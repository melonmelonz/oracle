---
title: FPGA and the MiSTer Project
domain: hardware
tags: [fpga, mister, retro, hardware, recreation, hdl, latency]
vocab:
  - { term: FPGA, def: "A field-programmable gate array; an integrated circuit whose logic can be reconfigured after manufacture to behave like arbitrary digital hardware." }
  - { term: HDL, def: "Hardware description language; code that describes the structure and behavior of digital circuits rather than a sequence of instructions." }
  - { term: Verilog, def: "A widely used HDL with C-like syntax for describing and simulating digital logic." }
  - { term: Look-Up Table, def: "A small programmable memory inside an FPGA logic cell that implements any function of a few input bits." }
  - { term: Core, def: "An HDL design that configures an FPGA to recreate a specific machine, such as a console or arcade board." }
  - { term: DE10-Nano, def: "The Terasic development board, built around an Intel Cyclone V SoC FPGA, that the MiSTer project runs on." }
  - { term: Latency, def: "The delay between an input and its visible result; FPGA recreations can keep this very low because logic runs in parallel hardware." }
  - { term: Reconfigurable Logic, def: "Digital circuitry whose wiring and function can be reprogrammed, as opposed to fixed gates etched at fabrication." }
  - { term: Analogue, def: "A company that builds FPGA-based hardware such as the Analogue Pocket handheld for playing original game cartridges." }
related: [emulation-preservation, beagleplay, spi-bus]
source: "Compiled from Wikipedia (FPGA, MiSTer, Analogue Pocket), the official MiSTer-devel GitHub wiki, and Analogue's product pages; June 2026."
links:
  - { title: "Field-programmable gate array (Wikipedia)", url: "https://en.wikipedia.org/wiki/Field-programmable_gate_array", kind: wiki }
  - { title: "MiSTer FPGA (Wikipedia)", url: "https://en.wikipedia.org/wiki/MiSTer_FPGA", kind: wiki }
  - { title: "Official MiSTer-devel Wiki", url: "https://github.com/MiSTer-devel/Wiki_MiSTer/wiki", kind: official }
  - { title: "MiSTer Main repository", url: "https://github.com/MiSTer-devel/Main_MiSTer", kind: source }
  - { title: "Analogue Pocket (Wikipedia)", url: "https://en.wikipedia.org/wiki/Analogue_Pocket", kind: wiki }
  - { title: "Analogue Pocket product page", url: "https://www.analogue.co/pocket", kind: official }
---

# FPGA and the MiSTer Project

## What an FPGA Actually Is

A field-programmable gate array is an integrated circuit you can rewire after it leaves the factory. Inside is a grid of small logic blocks and a fabric of programmable interconnect. Loading a configuration sets what each block computes and how the blocks are wired together. The result is real digital hardware, not a program running on a processor. This is the key distinction for retro work; a CPU fetches and executes instructions one after another, while an FPGA holds the actual circuit and runs it in parallel. Xilinx shipped the first commercially viable FPGA, the XC2064, in 1985, with programmable logic blocks and programmable interconnect between them. Altera, founded in 1983, was the other early pioneer. For decades those two companies dominated the market; Altera is now part of Intel, which is why the chip at the heart of MiSTer carries both names.

## Logic Cells and Look-Up Tables

The building block of most FPGAs is the logic cell. A typical cell pairs a look-up table with a full adder and a D-type flip-flop. The look-up table is a tiny memory; a four-input LUT stores sixteen bits, one per possible input combination, so it can implement any Boolean function of those four inputs just by holding the right truth table. Chain thousands of these cells through the interconnect and you can build counters, state machines, memory controllers, and whole CPUs. Device capacity is quoted in logic elements; the Cyclone V part MiSTer uses reports roughly 110,000 logic elements. The point is that none of this is fixed at manufacture. The same silicon becomes a Z80, a 6502, or a video chip depending on which configuration you load.

## Describing Hardware: HDL, Verilog, VHDL

You do not draw FPGA circuits by hand. You write a hardware description language. The two dominant HDLs are VHDL, whose syntax descends from Ada, and Verilog, which reads more like C. An HDL describes structure and timing rather than a step-by-step procedure; a line of Verilog can mean "this register updates on every clock edge," which becomes physical flip-flops and wires after synthesis. Synthesis tools translate the HDL into a netlist of LUTs and routing, then place and route it onto a specific device. This is why FPGA recreations are sometimes called gateware. A core author is effectively redrawing the original machine's schematic in code, clock domains and all, instead of writing software that imitates its behavior.

## Why FPGA Recreation Differs from Emulation

Software emulation runs on a host CPU and operating system; the host interprets the guest machine's instructions and redraws its video. That introduces scheduling jitter and buffering, and accuracy depends on how faithfully the emulator author modeled odd hardware timing. An FPGA core instead instantiates the original logic and clocks it in step. Because the logic runs in parallel hardware rather than a host scheduler, input-to-display latency can be kept very low and consistent, and quirky timing behavior tends to fall out for free when the circuit matches the original. This is not magic; a sloppy core can still be wrong, and a careful software emulator can be excellent. The honest framing is that the FPGA approach removes a host software stack from the loop, which makes low, deterministic latency easier to reach.

## The MiSTer Project and the DE10-Nano

MiSTer is an open project that recreates classic computers, consoles, and arcade machines on modern hardware. Alexey "Sorgelig" Melnikov introduced it on GitHub in June 2017 as a successor to the earlier MIST project, motivated partly by MIST's analog-only video; MiSTer outputs HDMI directly. It runs on Terasic's DE10-Nano, a mass-produced development board built around an Intel/Altera Cyclone V SoC FPGA (the 5CSEBA6U23I7, about 110,000 logic elements) paired with a dual-core ARM Cortex-A9. The ARM side runs a small Linux that loads cores and handles menus and storage, while the FPGA fabric becomes the recreated machine. Picking a stock, affordable board instead of custom hardware is much of why the project spread.

## Cores, Add-on Boards, and the SDRAM Problem

In MiSTer terms a core is one machine: an HDL design that turns the FPGA into an NES, an SNES, a Genesis, an Amiga, or a particular arcade board. The project depends on many contributors maintaining these cores, and support spans 8-bit through 32-bit systems. Several add-on boards extend the bare DE10-Nano: a USB hub, an analog I/O board with VGA for CRTs, a digital I/O board with TOSLINK audio, a real-time clock, and most importantly an SDRAM module (commonly 128MB). The SDRAM board exists for a subtle reason. The DE10-Nano's onboard DDR3 is shared with the ARM side and has high, variable latency, which cannot stand in for the fast, simply timed memory many vintage machines expected, so a dedicated low-latency SDRAM chip is added for cores that need it.

## The Wider FPGA Recreation World

MiSTer is the open, hobbyist anchor of a larger movement, and commercial FPGA hardware sits alongside it. Analogue builds polished consumer devices on the same principle; their Analogue Pocket, announced in October 2019 and launched December 13, 2021, uses an Altera Cyclone V FPGA plus a second Cyclone 10 for system functions. It plays Game Boy, Game Boy Color, and Game Boy Advance cartridges directly, with adapters for Game Gear, Neo Geo Pocket, Atari Lynx, and TurboGrafx-16. Crucially Analogue opened a framework called openFPGA so outside developers can write cores for the Pocket, echoing MiSTer's open model. The shared thread across MiSTer and the Pocket is preservation through reconfigurable logic; instead of describing old hardware in software, you rebuild the circuit itself on a chip designed to be reprogrammed.
