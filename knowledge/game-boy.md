---
title: The Game Boy
domain: hardware
tags: [game-boy, nintendo, handheld, lr35902, chiptune, mbc]
vocab:
  - { term: LR35902, def: "Sharp's system-on-chip in the Game Boy; its CPU core (the SM83) is a hybrid of the Intel 8080 and Zilog Z80." }
  - { term: DMG, def: "Dot Matrix Game; the codename and model prefix of the original 1989 Game Boy." }
  - { term: MBC, def: "Memory Bank Controller; a chip inside cartridges that swaps ROM and RAM banks in and out of the CPU's small address space." }
  - { term: Game Link Cable, def: "A serial cable that connects two (or up to four) Game Boys for trading and multiplayer." }
  - { term: SRAM, def: "Static RAM on a cartridge, often kept alive by a coin cell to hold save data after power off." }
  - { term: Tile, def: "An 8x8-pixel, 2-bits-per-pixel bitmap; the basic unit the Game Boy draws backgrounds and sprites from." }
  - { term: Sprite, def: "A movable object (OBJ) drawn over the background; the Game Boy supports up to 40, with 10 per scanline." }
  - { term: Chiptune, def: "Music made with the sound chips of old game hardware, including the Game Boy's four-channel APU." }
  - { term: LSDj, def: "Little Sound Dj; a Game Boy music tracker by Johan Kotlinski that anchored the modern chiptune scene." }
related: [pokemon-gen1, retro-computing]
source: "Compiled from Wikipedia (Game Boy, Game Boy Color, Chiptune, Zilog Z80), gekkio's Game Boy: Complete Technical Reference, and the official Little Sound Dj site; June 2026."
links:
  - { title: "Game Boy (Wikipedia)", url: "https://en.wikipedia.org/wiki/Game_Boy", kind: wiki }
  - { title: "Game Boy Color (Wikipedia)", url: "https://en.wikipedia.org/wiki/Game_Boy_Color", kind: wiki }
  - { title: "Game Boy: Complete Technical Reference (gekkio)", url: "https://gekkio.fi/files/gb-docs/gbctr.pdf", kind: reference }
  - { title: "Zilog Z80 (Wikipedia)", url: "https://en.wikipedia.org/wiki/Zilog_Z80", kind: wiki }
  - { title: "Chiptune (Wikipedia)", url: "https://en.wikipedia.org/wiki/Chiptune", kind: wiki }
  - { title: "Little Sound Dj (official site)", url: "https://www.littlesounddj.com/lsd/index.php", kind: official }
---

# The Game Boy

## The handheld and its run

Nintendo released the Game Boy in Japan on April 21, 1989, and in North America on July 31, 1989. It was not the most powerful handheld of its era; the contemporary Atari Lynx and Sega Game Gear had color and more muscle. The Game Boy won anyway on battery life, price, and a deep software library. The hardware was led by Gunpei Yokoi's team at Nintendo R&D1, with Satoru Okada among the key designers.

The line carried forward through the smaller Game Boy Pocket (1996) and Game Boy Light (1998, Japan only) before the Game Boy Color arrived on October 21, 1998. Counted together, the Game Boy and Game Boy Color sold 118.69 million units worldwide by the time the line was discontinued in 2003. That makes it one of the best-selling game systems ever, and the platform that carried Tetris and the first Pokemon games to the world.

## The LR35902 CPU

The system runs on a Sharp LR35902, a system-on-chip clocked at 4.194304 MHz. Its CPU core is often called the SM83, and it is a hybrid: it borrows much of its instruction set from the Intel 8080 and Zilog Z80, but it is not a full Z80. The designers dropped the Z80's IX/IY index registers, the alternate register set, and several instructions, while adding their own conveniences such as the LDH instruction for fast access to high memory.

The chip is 8-bit with a 16-bit address bus, so it can address 64 KB directly. On-board it has 8 KB of work RAM and 8 KB of video RAM, plus a small block of high RAM. The 8080 and Z80 lineage means assembly programmers coming from those parts felt at home, which mattered in 1989 when those CPUs were everywhere in arcades and home computers.

## A dot-matrix screen in four greys

The DMG name stands for Dot Matrix Game, and the screen is the point. It is a 2.5-inch reflective STN (super-twisted nematic) liquid crystal display, 160 by 144 pixels, in a 10:9 aspect ratio. It shows four shades, rendered on the original unit as the famous pea-green-to-dark palette.

Being reflective rather than backlit, the original screen needed ambient light and was notoriously hard to read in dim rooms; an accessory light and magnifier industry grew up around that flaw. The display also had visible ghosting on fast motion. The Game Boy Color kept the same 160 by 144 resolution but swapped in a color LCD. Power came from four AA batteries good for up to about 30 hours, a runtime its rivals could not touch.

## Tiles and sprites

The Game Boy does not have a framebuffer you draw pixels into; it composes the image from tiles. A tile is an 8x8-pixel bitmap stored as 16 bytes in VRAM, using a planar 2-bits-per-pixel format (each pixel is a value from 0 to 3). The background and window layers are grids of these tiles.

Movable objects, called sprites or OBJs, live in a 160-byte table called OAM, with 40 four-byte entries. Each sprite is 8x8 or 8x16 pixels and carries its position, palette choice, priority, and flip flags. Two hard limits shaped Game Boy art: only 40 sprites total, and only 10 per scanline. Sprites also reserve color 0 as transparent, so a sprite shows at most three solid shades. Programmers learned to juggle the per-line limit, sometimes flickering sprites on and off across frames to fake more on screen.

## Cartridges, mappers, and saves

The CPU can only address 32 KB of cartridge ROM at once, far less than most games need. The fix lives in the cartridge itself: a Memory Bank Controller (MBC) that maps larger ROMs and RAM into the small window through bank switching. Writing to special address ranges tells the MBC which bank to expose.

The common chips each have a profile. MBC1 handles up to 2 MB of ROM with optional battery-backed RAM. MBC2 is smaller (up to 256 KB) with a tiny built-in RAM. MBC3 added a real-time clock, which is how Pokemon Gold and Silver track day and night even with the system off. MBC5 raised the ROM ceiling further and supported the rumble motor in carts like the Pokemon Pinball series. Saves persist because the cartridge holds SRAM kept alive by a small coin cell; when that battery dies decades later, the save is lost.

## Linking up

The Game Boy's serial port and Game Link Cable, developed by Satoru Okada, let two units (and in some configurations up to four) talk to each other at a modest serial rate. It was first imagined for head-to-head play, and Tetris versus mode was an early showcase.

Its lasting importance was different. Pokemon Red and Green were built around the cable: you cannot complete the Pokedex on one cartridge alone, because some species only evolve or appear through trading. That design turned a piece of hardware into a social loop, sending kids to find a friend with the other version. The same link hardware later carried the Super Game Boy and Game Boy Printer accessories, and homebrew musicians use it to sync two trackers together.

## Constraints that bred a music scene

The Game Boy's audio is a four-channel programmable sound generator: two pulse-wave channels with selectable duty cycles, one channel that plays a custom 4-bit waveform, and one noise channel. Game composers like Hirokazu Tanaka wrung memorable scores out of it; the same chip became an instrument in its own right.

That second life is chiptune. In 2000 the Swedish programmer Johan Kotlinski wrote Little Sound Dj (LSDj), a music tracker that runs on real Game Boy hardware from a cartridge and gives a performer direct control of all four channels, custom waveforms, and an arpeggiator. Sold on flash carts and later released as freeware, LSDj (alongside Oliver Wittchow's Nanoloop) made the Game Boy a live performance instrument and inspired a generation of trackers. The platform's limits, four channels and four greys, became its aesthetic.
