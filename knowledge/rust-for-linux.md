---
title: Rust for Linux
tags: [rust, linux, kernel, rfl, systems]
era: present
---

# Rust for Linux

## What it is

Rust for Linux is the effort to make Rust a second language for writing Linux
kernel code, alongside C. The goal is not to rewrite the kernel. It is to let new
drivers and subsystems be written in a language that rules out whole classes of
bugs at compile time: use-after-free, data races, buffer overruns, the memory
errors that have caused a large share of kernel security holes.

Initial Rust support landed in the mainline kernel in Linux 6.1, released in
December 2022. That release did not ship a big Rust driver; it shipped the
scaffolding, enough to build a Rust "hello world" module and start growing the
abstractions. Miguel Ojeda leads the project.

## Why Rust, and why it is hard

C gives you full control and no seatbelts. The kernel is the worst possible place
for a memory bug, because there is nothing underneath it to catch the fall. Rust's
ownership model enforces, at compile time, the rules that kernel C programmers
already try to follow by discipline and convention. The pitch is that the compiler
becomes a reviewer that never gets tired.

The hard part is the seam between the two languages. The kernel is millions of
lines of C with its own memory model, its own locking rules, and very little of it
written down formally. Every Rust driver needs safe abstractions over that C, and
writing those abstractions correctly is most of the real work. A Rust kernel
programmer spends a lot of time wrapping fallible setup so half-built state cannot
leak on error, and reaching for the kernel's own primitives rather than the
standard library, which is not available.

## What has been built

The early proof that this was worth doing was a set of real drivers. There was an
NVMe driver written as a proof of concept, an Android Binder rewrite, and a null
block driver. The most visible flagship has been Asahi Lina's drm/asahi work: a
GPU driver for Apple Silicon, written in Rust, driving the same hardware that runs
macOS. More recently the Nova project aims at a Rust driver for modern NVIDIA GPUs.

## The friction

Putting a second language into a thirty-year-old C project was never going to be
purely technical. Some longtime maintainers were wary of having to understand Rust
to keep their subsystems working, and of a second toolchain in the build. There
were sharp public exchanges about whether the Rust side or the C side bears the
cost when an interface changes.

In 2024, Wedson Almeida Filho, one of the most prominent contributors, stepped back
from the project, citing the nontechnical friction rather than the code. In early
2025 Hector Martin, who led the Asahi Linux project, also stepped back from kernel
maintainership after similar conflict. Linus Torvalds has been broadly supportive
of the experiment while letting subsystem maintainers move at their own pace. The
work continues, slowly and for real, which is how most things get into the kernel.
