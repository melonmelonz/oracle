---
title: Rust for Linux
domain: kernel
tags: [rust, linux, kernel, rfl, systems, drivers, memory-safety]
vocab:
  - { term: Safe Abstraction, def: "A Rust API that wraps unsafe C kernel interfaces so callers can use them without writing unsafe code." }
  - { term: pin_init, def: "A macro and crate from Rust for Linux that initializes pinned, self-referential, or oversized structs in place, with a fallible variant for error paths." }
  - { term: kernel Result, def: "The kernel crate's Result type whose error is the kernel Error enum, used so fallible setup returns errno-style codes instead of panicking." }
  - { term: no_std, def: "A Rust mode that drops the standard library and builds only on core (and optionally alloc), required because the kernel has no OS underneath it." }
  - { term: Miguel Ojeda, def: "The kernel developer who leads the Rust for Linux project and maintains its core infrastructure." }
  - { term: Asahi, def: "The community project porting Linux to Apple Silicon Macs; source of the Rust drm/asahi GPU driver, founded by Hector Martin." }
  - { term: Binder, def: "Android's inter-process communication driver, rewritten in Rust as an early demonstration of a real Rust kernel subsystem." }
  - { term: Nova, def: "A Rust driver for GSP-based NVIDIA GPUs (Turing/RTX 20 and newer), intended successor to Nouveau, led by Danilo Krummrich at Red Hat." }
  - { term: Maintainer, def: "A developer responsible for reviewing and merging changes to a part of the kernel and keeping it working over time." }
  - { term: Subsystem, def: "A self-contained area of the kernel (filesystems, DRM, networking) with its own maintainers and merge process." }
related: [linux-kernel, spi-bus]
source: "Wikipedia Rust for Linux; Phoronix; The Register (2024-09 and 2025-02); rust-for-linux.com pin-init and Nova pages; docs.kernel.org/gpu/nova; corrode.dev Krummrich interview"
---

# Rust for Linux

## What it is

Rust for Linux is the effort to make Rust a second implementation language for the Linux kernel, alongside C. The goal is not a rewrite. It is to let new drivers and subsystems be written in a language that rules out whole classes of bugs at compile time: use-after-free, data races, buffer overruns, the memory errors that account for a large share of serious kernel vulnerabilities.

The project was announced on the kernel mailing list in 2020. Initial support landed in mainline Linux 6.1, released in December 2022. That release shipped no flagship driver. It shipped the scaffolding: enough to build a Rust module and load it, plus a small sample. Linus Torvalds asked that the first merge include as little functionality as possible, so the early abstractions and proof-of-concept drivers were trimmed out and made to wait. Miguel Ojeda leads the project. The first real drivers were accepted in late 2023 and reached users in Linux 6.8.

## Why Rust, and why it is hard

C gives you full control and no seatbelts. The kernel is the worst place for a memory bug, because there is nothing underneath it to catch the fall. Rust's ownership and borrowing model enforces, at compile time, rules that kernel C programmers already try to follow by discipline and review. The compiler becomes a reviewer that never tires.

The hard part is the seam between the two languages. The kernel is millions of lines of C with its own memory model, its own locking conventions, and very little of it written down formally. Most of the real work is not writing Rust drivers; it is writing the safe abstractions those drivers stand on. A Rust kernel developer spends a great deal of time wrapping fallible setup so half-built state cannot leak on error, and reaching for the kernel's own primitives because the things a userspace Rust programmer takes for granted are simply not there.

## Safe abstraction over C

The central pattern is the safe abstraction. Calling into the kernel's C means calling into code that has no idea what Rust's rules are; every such call is `unsafe`. The strategy is to confine that danger. You write a small, audited layer of `unsafe` Rust that talks to C and upholds the kernel's invariants, then expose a safe API on top of it. Driver authors build against the safe API and never touch `unsafe` themselves.

A clear example comes from Nova and the wider DRM work: the type system is used not only to prevent memory errors but to encode logic so that certain misuses fail to compile. The same idea drove the dispute that pushed Wedson Almeida Filho out: he wanted to statically encode filesystem interface semantics in the Rust bindings so a class of errors could not be expressed at all. The abstraction is the contract. When the C side changes, the abstraction is where the cost of keeping that contract lands.

## pin_init and fallible setup

Two facts collide in kernel code. Many kernel objects must not move once they exist, because other code holds raw pointers into them; locks, lists, and work items are full of such self-reference. And Rust insists every value be fully initialized before use, which is awkward when a field needs the object's own final address. The `Pin` type marks "this cannot move," but it does not, by itself, tell you how to build such a thing safely.

The `pin_init` crate (originally `pinned-init`) answers that. Its `pin_init!` macro builds a pinned struct in place, writing each field directly into its final location rather than constructing on the stack and moving. There are fallible variants, `try_init!` and `try_pin_init!`, that default their error to the kernel `Error`; if a field's initializer fails partway, already-built fields are torn down and an errno-style code returns. The crate avoids `syn`, the usual proc-macro parser, because pulling 50,000 lines of it into the kernel was a non-starter.

## Why no standard library

Rust kernel code is `no_std`. The familiar standard library assumes an operating system beneath it: a heap that cannot fail, threads, files, sockets, a process that can exit. In the kernel none of that holds, so `std` is unavailable. Code builds on `core`, the allocation-free foundation, plus a kernel-controlled `alloc`.

The differences are not cosmetic. Userspace Rust lets allocation panic on failure; the kernel cannot panic on a failed `kmalloc`, so allocation is fallible and returns a `Result`. Locking, reference counting, and memory come from the kernel's own primitives wrapped in safe types, not from `std::sync`. The kernel `Result` and the kernel `Error` enum thread through nearly everything, which is why fallible initialization is so central; setup that can fail must say so in its type, and unwind cleanly when it does.

## What has been built

The early proof was a handful of real drivers, deliberately small. There was an NVMe driver as a proof of concept, a null block driver, and a rewrite of Android's Binder IPC driver. The most visible flagship was the drm/asahi GPU driver from the Asahi Linux project, written in Rust to drive the same Apple Silicon that runs macOS.

The current frontier is Nova, a Rust driver for GSP-based NVIDIA GPUs (Turing/RTX 20 and newer) meant to succeed the reverse-engineered Nouveau. It splits into `nova-core` and `nova-drm`, leaning on the GPU's system processor as a hardware abstraction layer reached over IPC. Danilo Krummrich of Red Hat leads it and also built much of the Rust driver-core infrastructure underneath. The first `nova-core` code targeted Linux 6.15; by the 6.17 cycle an NVIDIA engineer, Alexandre Courbot, had joined as co-maintainer, a notable sign of NVIDIA's direct involvement.

## The friction

Putting a second language into a thirty-year-old C project was never purely technical. Some maintainers were wary of a second toolchain and of having to understand Rust to keep their subsystems working. The recurring fight was over who bears the cost when a C interface changes and breaks the Rust bindings on top of it.

In September 2024, Wedson Almeida Filho, a Microsoft engineer and one of the most prominent contributors, retired from the project, citing "nontechnical nonsense" rather than the code; the trigger was a recorded exchange with ext4 maintainer Ted Ts'o, who objected to taking on responsibility for Rust bindings he had not asked for. In February 2025, Hector Martin stepped down first as upstream maintainer for the Apple Silicon platform, then as Asahi Linux project lead, after a public clash with Torvalds over how the Rust integration was being managed; Asahi moved to a seven-person board. Torvalds has stayed broadly supportive of the experiment while letting subsystem maintainers move at their own pace. The work continues, slowly and for real, which is how most things get into the kernel.
