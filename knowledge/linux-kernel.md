---
title: The Linux Kernel
domain: kernel
tags: [linux, kernel, torvalds, maintainers, lkml, lts, release-cycle, monolithic, syscall]
vocab:
  - { term: Monolithic Kernel, def: "A kernel design where scheduling, memory, filesystems, networking, and drivers all run in one privileged address space." }
  - { term: Loadable Module, def: "Kernel code (often a driver) that can be inserted into or removed from a running kernel without rebooting, via insmod or modprobe." }
  - { term: Merge Window, def: "The roughly two-week period after a release when Linus pulls new features from subsystem maintainers into mainline." }
  - { term: "Release Candidate (-rc)", def: "A weekly pre-release snapshot, rc1 through about rc7, issued during the bug-fix-only stabilization phase." }
  - { term: Mainline, def: "The canonical kernel tree maintained by Linus Torvalds, into which all new features ultimately land." }
  - { term: LTS, def: "A longterm-support kernel chosen for extended maintenance, receiving backported fixes for years rather than months." }
  - { term: Subsystem Maintainer, def: "A developer responsible for a portion of the kernel who reviews patches and forwards them upstream toward mainline." }
  - { term: syscall, def: "A system call: the controlled entry point through which user-space programs request services from the kernel." }
  - { term: LKML, def: "The Linux Kernel Mailing List, the main forum where patches are posted, reviewed, and argued over in public." }
related: [rust-for-linux, distributed-systems]
source: "kernel.org release and process docs; Documentation/process/submitting-patches.rst; MAINTAINERS; LWN; Wikipedia kernel version history; stable-kernel EOL announcements (Kroah-Hartman/Levin)"
---

# The Linux Kernel

## Where it came from

Linus Torvalds announced Linux in August 1991, a 21-year-old student in Helsinki, in a Usenet post that called it "just a hobby, won't be big and professional like gnu." He wrote it on and for the Intel 386, partly out of frustration with the licensing of MINIX, a small teaching operating system. He underestimated the thing badly. It is now the most widely deployed kernel in history: phones, servers, routers, cars, and very nearly every supercomputer on the planet run it. The current line is the 7.x series; 7.0 shipped 12 April 2026, with 7.1 following on 14 June 2026. The license is GPLv2, which Torvalds has called one of the best decisions the project ever made, because it forces derived changes to stay open.

## Monolithic, but with modules

Linux is a monolithic kernel. The scheduler, the memory manager, the filesystems, the network stack, and the device drivers all run together in a single privileged address space, calling each other as ordinary functions. This is the design Andrew Tanenbaum attacked in the 1992 "LINUX is obsolete" debate, arguing that microkernels, with services split into isolated processes, were the correct future. The pragmatic monolith won the deployment numbers. But it is not a static blob. Most of the kernel can be built as loadable modules: drivers and features compiled separately and inserted into a running kernel with insmod or modprobe, then removed again, no reboot required. So the practical design is "monolithic with modules." You get the speed of shared address space and the flexibility of loading only the code a given machine needs.

## The userspace boundary

The kernel's job is to mediate hardware on behalf of programs that are not allowed to touch it directly. The interface across that line is the system call, or syscall: a small, stable, deliberately narrow set of entry points like read, write, openat, mmap, and clone. A program traps into the kernel, the kernel does the privileged work, and control returns. The contract is famously strict in one direction. Internal kernel APIs change freely between releases; the syscall ABI to userspace, by contrast, is held nearly sacred. Torvalds' rule, repeated for decades, is "we do not break userspace." A change that makes existing programs stop working is treated as a kernel bug to be reverted, not a userspace problem to be fixed. That stability is a large part of why software written against Linux keeps running for years.

## The release rhythm

Linux runs on a predictable clock. A cycle opens with a merge window of about two weeks, during which Torvalds pulls features that maintainers have prepared and signed; the bulk of all change for a release lands here, sometimes approaching a thousand patches a day. The window then closes and Torvalds tags rc1. From there the tree is in bug-fix-only mode: a release candidate per week, rc1 through roughly rc7 (occasionally rc8 or beyond if needed), each one stabilizing rather than adding. Total cycle length is about nine to ten weeks. The whole structure rests on one fact: Torvalds has the final say on what merges into mainline and when the final version ships.

## How a change actually lands

A patch does not go straight to Linus. The path runs through people. A contributor formats the change, runs scripts/checkpatch.pl, and emails it to the relevant mailing list and maintainers, found via the MAINTAINERS file or scripts/get_maintainer.pl. Every patch must carry a Signed-off-by line, an agreement to the Developer's Certificate of Origin attesting the right to submit it; code without one cannot be merged. Reviewers respond with Reviewed-by (a real technical review), Acked-by (a lighter endorsement, often from the maintainer), or Tested-by. The subsystem maintainer collects accepted patches in a tree and, when the merge window opens, sends Torvalds a git pull request. Before that, the work is integration-tested in linux-next, the daily roll-up of every subsystem's "for-next" branch. Roughly 90% of what reaches mainline has already passed through linux-next first.

## Subsystems and the people who run them

No one person reviews the whole kernel; it is partitioned. The MAINTAINERS file at the top of the tree maps directories and file patterns to the people, mailing lists, and git trees responsible for them. Networking, the various filesystems, the scheduler, each architecture, the graphics drivers, and dozens of other areas each have maintainers who own review for their patch flow. Greg Kroah-Hartman is among the most visible: he runs the stable releases, the kernel CVE team, and the USB, TTY, and driver-core subsystems, among others. linux-next, the integration tree, was maintained from its inception by Stephen Rothwell, who stepped down on 16 January 2026; Mark Brown took over. The arrangement is deliberately distributed. Trust flows up a chain of maintainers, and the volume that reaches Torvalds is whatever his lieutenants have already vetted.

## Mailing-list culture

Kernel development happens in plain-text email, in public, on the Linux Kernel Mailing List (LKML) and the many subsystem lists. Patches are posted inline, reviewed inline, and the archive is permanent. The culture has a long reputation for being blunt to the point of brutal; in 2018 Torvalds stepped away briefly to reflect on his own communication, and the project adopted a code of conduct. The tooling reflects the medium. When the kernel lost access to BitKeeper in 2005, Torvalds spent a couple of weeks writing a replacement built for this exact distributed, patch-by-email scale. That tool was git, and it went on to become the default version control system for nearly all of software.

## LTS and the long tail

Most mainline releases are short-lived; they get bug fixes only until the next one supplants them. To support products that cannot chase a new kernel every couple of months, certain releases are designated longterm-support (LTS) kernels and maintained for years, with fixes backported by the stable team (Greg Kroah-Hartman and Sasha Levin). An LTS line typically starts with a two-year projected end-of-life that gets extended when industry interest justifies the work. As of 2026 the active LTS kernels include 6.6 (EOL projected December 2027), 6.12 (December 2028), and 6.18 (December 2028), while the older 5.10 and 5.15 lines reach end-of-life in December 2026. One caveat kernel.org stresses: many distributions ship their own "longterm" kernels that are not the ones maintained upstream, and upstream developers cannot support those.
