---
title: The Linux Kernel
tags: [linux, kernel, history, systems, lore]
era: present
---

# The Linux Kernel

## Where it came from

Linus Torvalds announced Linux in August 1991, as a 21-year-old student in
Helsinki, in a Usenet post that called it "just a hobby, won't be big and
professional like gnu." He was writing it on and for the Intel 386, partly because
he was frustrated with the licensing of MINIX, a small teaching operating system.
He famously underestimated the thing. It is now the most widely deployed kernel in
history, running on phones, servers, routers, cars, and nearly all of the world's
supercomputers.

## The Tanenbaum debate

In 1992 Andrew Tanenbaum, the author of MINIX, started a public argument on Usenet
titled "LINUX is obsolete." His objection was architectural: Linux is a monolithic
kernel, where drivers and core services share one address space, and Tanenbaum
believed microkernels, with services separated into isolated processes, were the
correct and future-proof design. Torvalds defended the monolithic approach as
faster and more practical. The debate is a classic of computing history, and in
the decades since, the pragmatic monolith won the deployment numbers while
microkernel ideas kept influencing research and some niches.

## How a release happens

Linux runs on a predictable rhythm. After a release, there is a roughly two-week
merge window, where Torvalds pulls in the features that maintainers have prepared.
Then the window closes and a series of release candidates begins, rc1 through
about rc7, one per week, each one only bug fixes and stabilization. After roughly
nine or ten weeks total, the final version ships and the cycle restarts. Torvalds
has the final say on what merges, and gives releases offbeat code names.

## Git exists because of this

In 2005 the kernel lost access to BitKeeper, the proprietary tool it had been
using for version control. Rather than adopt an existing system, Torvalds spent a
couple of weeks writing a new one designed for the kernel's scale and distributed
workflow. That tool was git. It was built to manage Linux and went on to become
the default version control system for nearly all of software.

## The penguin and the culture

The mascot is Tux, a sitting penguin. Torvalds picked a penguin partly as a joke
about having been bitten by one. The kernel is licensed under GPLv2, which Torvalds
has called one of the best decisions the project made, because it forces changes to
stay open. The development culture on the Linux kernel mailing list has a
reputation for being blunt to the point of brutal; in 2018 Torvalds stepped away
briefly to reflect on his communication style, and the project adopted a code of
conduct. The scheduler that decides which task runs next was the Completely Fair
Scheduler for many years, and was replaced by EEVDF starting in the 6.6 release.
