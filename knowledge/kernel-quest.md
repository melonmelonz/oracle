---
title: The Rust Kernel Quest
tags: [rust, kernel, beagleplay, spi, doom, embedded]
era: present
---

# The Rust Kernel Quest

## rust-spi-tinydoom

rust-spi-tinydoom is a three-month Rust-for-Linux kernel project built as a demo
for a Slack "Next Chapter" talk. The arc is ambitious and concrete: write a
clean SPI abstraction in Rust, build a panel display driver on top of it, and
then get DOOM rendering through that driver. The target hardware is the
BeaglePlay board, and the scope was locked on 2026-05-10.

## The dev environment

The primary cross-compile box is kdev, a Fedora 41 machine. A second box,
gentoo-dev, is host-only. The Rust-for-Linux tree sits at 7.1-rc3 with
CONFIG_RUST enabled and arm64 / TI K3 support configured for the BeaglePlay's
SoC. A hard rule governs the tree: never push to upstream repos — the kernel
tree's origin remote is the upstream Rust-for-Linux project, not Penn's fork, so
every push gets a `git remote -v` check first.

## RfL coding patterns

Two Rust-for-Linux patterns earned their own notes. Fallible probe setup gets
wrapped in a `pin_init_scope` so half-built state can't leak on error. And
because `Page::with_page_mapped` is private, reading a page means going through
`read_raw` into a bounce buffer rather than mapping it directly.

## BeaglePlay hardware notes

The board fought back in physical ways:

- **Debug UART**: a 3-pin header — pin 1 is GND, pin 2 is the board's RXD, pin 3
  is the board's TXD. The ritual is to open picocom BEFORE plugging in the PSU so
  the boot log isn't missed.
- **Pasting commands**: multi-line heredoc pastes do NOT survive picocom, so
  verification is done with a single paste-in one-liner that dumps SPI, kernel,
  and boot state in one shot.
- **WiFi is broken** on the RfL kernel: the wl18xx driver hits an
  auth-no-assoc bug under 7.1-rc3, so the board runs on ethernet and wifi configs
  are simply not retried.
- **Board helpers**: /usr/local/bin holds wifi-up, overlay-apply, and
  module-load helpers; an SSH key is authorized; the penn-wifi service is left
  disabled.

## The ILI9341 bring-up

Getting the panel lit is an open thread. The GPIO map is fixed — reset on 12,
interrupt on 9, another control on 10 — and the IM mode jumpers are bridged, but
the display is STILL dark. The next things to check are the 3Vo voltage rail and
whether the IM0 splash even appears.
