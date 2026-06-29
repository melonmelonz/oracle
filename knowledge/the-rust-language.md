---
title: The Rust Language
domain: kernel
tags: [rust, systems, memory-safety, ownership, borrow-checker, no-std, traits]
vocab:
  - { term: Ownership, def: "Rust's rule that every value has exactly one owner, and the value is dropped when that owner goes out of scope." }
  - { term: Borrow Checker, def: "The compiler pass that enforces the borrowing rules so references can never outlive their data or alias mutably." }
  - { term: Lifetime, def: "A region of code over which a reference is valid, tracked by the compiler so dangling references fail to compile." }
  - { term: Trait, def: "A named set of methods a type can implement, used for shared behavior, generic bounds, and polymorphism." }
  - { term: Result, def: "The Result<T, E> enum that carries either a success value or an error, making fallible operations explicit in the type." }
  - { term: Cargo, def: "Rust's build tool and package manager; it resolves dependencies, compiles crates, and talks to the crates.io registry." }
  - { term: no_std, def: "An attribute that drops the standard library and builds only on core, for kernels and bare-metal targets with no OS underneath." }
  - { term: Zero-Cost Abstraction, def: "A high-level construct that compiles down to code no slower than hand-written low-level equivalents." }
  - { term: Move Semantics, def: "Assigning or passing a non-Copy value transfers ownership and invalidates the source, preventing double frees." }
  - { term: Unsafe, def: "A keyword marking code where the programmer, not the compiler, vouches for memory safety invariants." }
related: [rust-for-linux, the-c-language, spi-bus]
source: "rust-lang.org; Wikipedia Rust (programming language); The Rust Book ch. 4 ownership and references; rustfoundation.org; Cargo Book; Rust Edition Guide"
links:
  - { title: "Rust language home", url: "https://www.rust-lang.org/", kind: official }
  - { title: "The Rust Book: What Is Ownership?", url: "https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html", kind: guide }
  - { title: "The Rust Book: References and Borrowing", url: "https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html", kind: guide }
  - { title: "The Cargo Book", url: "https://doc.rust-lang.org/cargo/", kind: manual }
  - { title: "Rust Edition Guide", url: "https://doc.rust-lang.org/edition-guide/editions/index.html", kind: guide }
  - { title: "Rust Foundation", url: "https://rustfoundation.org/", kind: official }
---

# The Rust Language

## Origins and governance

Rust began in 2006 as a personal project by Graydon Hoare, then an engineer at Mozilla. Mozilla took over sponsorship in 2009, and the first public release, Rust 0.1, shipped on January 20, 2012. The language churned hard through those pre-1.0 years; whole features came and went. The first stable release, Rust 1.0, landed on May 15, 2015, and with it came a promise the project still keeps: stability without stagnation, meaning code that compiles on a stable release should keep compiling.

In 2021 stewardship moved out of Mozilla and into an independent nonprofit, the Rust Foundation, established on February 8, 2021. Its five founding corporate backers were the large companies already shipping Rust: Amazon Web Services, Google, Huawei, Microsoft, and Mozilla. Meta (then Facebook) joined the same top platinum tier a few months later, on April 29, 2021, which is why it is often listed alongside the original five. The Foundation funds infrastructure, security, and maintainers; it does not design the language. That work stays with the open project's teams.

## Ownership

Ownership is the idea everything else hangs on. The rules are short: every value has one owner, there is only one owner at a time, and when the owner goes out of scope the value is dropped. "Dropped" means its destructor runs and its memory is freed, automatically, at a point the compiler can see.

This is how Rust frees heap memory without a garbage collector and without manual `free`. There is no runtime scanning for unreachable objects and no pauses. Cleanup is tied to scope, so it is deterministic; you can reason about exactly when a buffer or a lock is released. The cost is paid at compile time, in the discipline the compiler demands. Plenty of programs that a C or Python author would write without thinking simply will not compile until the ownership story is made explicit.

## Move semantics

Because a value has one owner, handing it somewhere else moves it rather than copying it. After `let b = a;` for a heap-backed type like `String`, `a` is no longer valid; using it is a compile error. Only the pointer and metadata were copied, not the heap contents, and the source was invalidated so two owners can never both try to free the same allocation. That rules out double frees by construction.

Small, fixed-size types that live entirely on the stack (integers, `bool`, `char`, tuples of such types) opt out by implementing the `Copy` trait; for them, assignment duplicates the bits and the original stays usable. Everything else moves by default. Passing a value into a function moves it too, unless you pass a reference instead.

## Borrowing and the borrow checker

You usually do not want to give ownership away just to read or tweak a value, so Rust lets you borrow it with a reference, written `&`. The borrow checker, a compiler pass, enforces two rules. At any moment a value may have either any number of shared `&` references or exactly one mutable `&mut` reference, never both. And no reference may outlive the data it points at.

Those two rules eliminate a surprising amount of trouble at compile time: data races (no aliasing while writing), use-after-free, and dangling pointers. A function that tries to return a reference to its own local will not compile, because the local is dropped at the end of the function. The checker has become less conservative over time; non-lexical lifetimes, stabilized in 2018, let a borrow end at its last use rather than at the close of its block.

## Lifetimes and traits

Lifetimes are the names the compiler uses for "how long is this reference valid." Most of the time they are inferred and invisible. When a function's references could plausibly relate in more than one way, you annotate them, as in `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`, telling the compiler the returned reference lives no longer than the inputs. Lifetimes are purely a compile-time device; they vanish in the generated code.

Traits are Rust's mechanism for shared behavior. A trait names a set of methods; a type implements the trait to gain them. Traits drive generics through bounds (`T: Display`), enable both static and dynamic dispatch, and underpin operator overloading and `Copy`, `Drop`, and the rest of the standard machinery. They are also where zero-cost abstractions show up: generic, trait-bound code monomorphizes per concrete type, so an iterator chain compiles to roughly the loop you would have written by hand.

## Errors without exceptions

Rust has no exceptions. Fallible operations return the `Result<T, E>` enum, which is either `Ok(value)` or `Err(error)`. The type signature tells you a call can fail, and the compiler warns if you ignore the result. Propagating an error up the stack is terse thanks to the `?` operator, which returns early on `Err` and unwraps on `Ok`. The related `Option<T>` handles "value or nothing" the same way, which is how Rust avoids null.

There is a second failure mode, `panic!`, for unrecoverable bugs; it unwinds (or aborts) rather than returning a value. The split is deliberate: expected, recoverable failures are values you must handle, while a panic signals a violated invariant. In constrained settings this matters a lot. Kernel and embedded code cannot afford to panic on a failed allocation, so allocation there is made fallible and returns a `Result`.

## no_std, unsafe, and editions

The standard library assumes an operating system: a heap that cannot fail, threads, files, a process. Strip that with the `#![no_std]` attribute and you build on `core`, the allocation-free foundation, optionally adding a separate `alloc` crate for heap types. This is what lets Rust target microcontrollers and the Linux kernel, and it is central to Rust for Linux.

Some things the compiler cannot prove safe: dereferencing raw pointers, calling into C, touching hardware registers. The `unsafe` keyword marks those regions, shifting the burden of upholding invariants from the compiler to the programmer. Good practice is to keep `unsafe` small and audited, then wrap it in a safe API. Finally, editions (2015, 2018, 2021, 2024) let the language make opt-in breaking changes, like adding the `async` keyword, without splitting the ecosystem; crates on different editions still link together.
