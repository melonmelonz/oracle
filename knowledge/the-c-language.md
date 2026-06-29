---
title: The C Language
domain: kernel
tags: [c, ritchie, bell-labs, unix, pointers, undefined-behavior, ansi-c, systems-programming]
vocab:
  - { term: Pointer, def: "A variable that holds the memory address of another value, which the program can read or write by dereferencing it." }
  - { term: Undefined Behavior, def: "A program construct the C standard places no requirements on, leaving the compiler free to do anything, including silently miscompile." }
  - { term: The Preprocessor, def: "A text-substitution pass that runs before compilation, handling #include, #define macros, and #ifdef conditional compilation." }
  - { term: ANSI C, def: "The first formal C standard, ANSI X3.159-1989, also called C89; adopted internationally as ISO C90." }
  - { term: K&R, def: "The 1978 book by Kernighan and Ritchie that served as C's de facto definition before standardization, and the pre-standard dialect it described." }
  - { term: Translation Unit, def: "A single source file plus everything it includes, compiled as one unit into an object file." }
  - { term: Segfault, def: "A segmentation fault: the OS killing a process for touching memory it is not allowed to access, often from a bad pointer." }
  - { term: Manual Memory Management, def: "The model where the programmer explicitly allocates memory with malloc and releases it with free, with no garbage collector." }
  - { term: libc, def: "The C standard library: the runtime implementation of printf, malloc, strcpy, and the other functions the standard defines." }
related: [the-rust-language, linux-kernel, rust-for-linux]
source: "Ritchie, The Development of the C Language (HOPL II, 1993); ISO/IEC JTC1/SC22/WG14; Wikipedia (C language, Undefined behavior, The C Programming Language); Linux kernel coding-style docs; Prossimo/memorysafety.org"
links:
  - { title: "C (programming language) — Wikipedia", url: "https://en.wikipedia.org/wiki/C_(programming_language)", kind: wiki }
  - { title: "Undefined behavior — Wikipedia", url: "https://en.wikipedia.org/wiki/Undefined_behavior", kind: wiki }
  - { title: "The C Programming Language (K&R) — Wikipedia", url: "https://en.wikipedia.org/wiki/The_C_Programming_Language", kind: wiki }
  - { title: "ISO/IEC JTC1/SC22/WG14 (C standards committee)", url: "https://www.open-std.org/jtc1/sc22/wg14/", kind: official }
  - { title: "Linux kernel coding style", url: "https://docs.kernel.org/process/coding-style.html", kind: reference }
  - { title: "What is memory safety and why does it matter? — Prossimo", url: "https://www.memorysafety.org/docs/memory-safety/", kind: reference }
---

# The C Language

## Born next to Unix

C came out of Bell Labs in the early 1970s, written mostly by Dennis Ritchie between 1972 and 1973. It did not appear in a vacuum; it grew alongside Unix and largely to serve it. Ritchie built on Ken Thompson's language B, which Thompson had derived from Martin Richards's BCPL. B was typeless and word-oriented, which fit older machines but fought against the byte-addressed PDP-11 that Unix was moving to. Ritchie added a type system, the notion of a character, and structures, and the result was a new language he called C. The payoff was concrete and historic: in 1973 Unix was rewritten from PDP-11 assembly into C, making the operating system portable in a way no assembly-language system could be. From that point on, the language and the system carried each other.

## K&R, then a standard

For years C had no formal standard; it had a book. In 1978 Brian Kernighan and Dennis Ritchie published "The C Programming Language," and the dialect it described became known as K&R C, the de facto definition. The book also gave the world its "hello, world" ritual. Formal standardization began with the ANSI X3J11 committee, producing ANSI X3.159-1989, usually called ANSI C or C89; the same text was adopted internationally as ISO C90. Later revisions followed: C99 added inline functions, new integer types, and one-line comments; C11 added a memory model, threads, and type-generic macros; C17 was a bug-fix release with no new features; and C23 (ISO/IEC 9899, adopted in 2024) added nullptr, typeof, and other modern touches. The standard is now maintained by ISO/IEC JTC1/SC22/WG14.

## Pointers and the machine

The defining idea in C is the pointer: a value that is itself a memory address. A pointer can be dereferenced to read or write whatever sits at that address, advanced with arithmetic to walk an array, or passed to a function so the callee can modify the caller's data. This is why C feels close to the metal; an array name decays to a pointer, a string is just a pointer to bytes ending in a zero, and a struct is a known layout you can reach into directly. The model maps almost transparently onto how a CPU actually addresses memory, which is exactly what an operating system or device driver needs. The same transparency is the source of most of C's danger. Nothing checks that a pointer still points at something valid, or that an index stays inside its array.

## Manual memory management

C has no garbage collector. Memory that outlives a single function call is obtained from the heap with malloc (or calloc, realloc) and must be handed back with free when you are done. The programmer owns the whole lifecycle. Get it wrong and you produce a recognizable family of bugs: a memory leak when you allocate and never free; a use-after-free when you keep using a pointer past the free call; a double free when you release the same block twice; a dangling pointer left aimed at memory that has been reclaimed. None of these are caught by the language. The discipline is entirely on the human, which is both why C programs can run with almost no runtime overhead and why memory bugs are endemic to them.

## The preprocessor

Before a C compiler proper sees your code, a separate text-substitution pass runs over it: the preprocessor. It handles lines beginning with #. #include splices in another file, which is how header files share declarations. #define creates macros, from simple constants to function-like macros expanded inline. #ifdef, #if, and #endif do conditional compilation, letting one source file build differently per platform or per build flag. The preprocessor is powerful and famously blunt; it knows nothing about C's syntax or types, it just moves text around. That makes some idioms (include guards, feature toggles) clean and others (macros with side effects, missing parentheses) a reliable source of surprises. A source file after preprocessing, headers and all, is the translation unit the compiler actually turns into an object file.

## Undefined behavior

The C standard does not define what every program does; it leaves a large set of constructs as undefined behavior, where the standard imposes no requirements at all. Signed integer overflow, dereferencing a null pointer, reading an uninitialized variable, indexing past the end of an array, and using a pointer after free are all undefined. The intent was to let C run fast on wildly different hardware without forcing checks. The modern consequence is sharper than many expect: optimizing compilers are allowed to assume undefined behavior never happens and to rewrite code on that assumption. A check that "can't" be true after an overflow can be deleted entirely. A program can appear to work for years and then miscompile when the optimizer changes. A segfault, the OS killing a process for an illegal memory access, is often the visible tip of UB underneath.

## Why it became the lingua franca

C won the systems world because it sits at a deliberate sweet spot: high enough to be readable and portable, low enough to express exactly what the hardware does, with a tiny runtime and a standard library (libc) that asks little of the platform underneath. Operating system kernels, device drivers, network stacks, language runtimes, and embedded firmware are overwhelmingly C. The Linux kernel is the canonical example; it is written in C (a freestanding dialect that does not use the normal libc) with its own famous coding style, down to eight-character tabs. Decades of code, tooling, ABIs, and trained programmers compound the advantage. C is the language other languages call into and define their foreign-function interface against.

## The safety problem and what answers it

The flip side of C's power is a now well-documented security record. Studies from Microsoft, Google, and Apple have repeatedly found that on the order of 70% of their serious vulnerabilities are memory-safety issues: buffer overflows, use-after-free, and the rest, the exact bug classes C does not prevent. Sanitizers, fuzzers, and static analyzers help but do not close the gap, which is why agencies like CISA now push memory-safe languages for new code. This is the precise motivation behind Rust. Rust keeps C-level control over memory and layout but adds a compile-time ownership and borrowing system that makes use-after-free and data races into errors the compiler rejects, rather than undefined behavior at runtime. The Rust-for-Linux effort brings that model into the kernel itself, in cautious coexistence with the C that still defines it.
