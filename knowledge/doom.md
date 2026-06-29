---
title: DOOM (1993)
domain: games
tags: [doom, id-software, fps, bsp, modding, source-port, shareware]
vocab:
  - { term: WAD, def: "id's archive format (\"Where's All the Data?\") that bundles levels, sprites, sounds, and textures into named lumps; IWADs hold the base game and PWADs add or replace content." }
  - { term: BSP, def: "Binary space partitioning, a tree built from a level's lines that lets the renderer sort walls back to front quickly without per-frame depth sorting." }
  - { term: Source Port, def: "A community-maintained build of the released DOOM engine code, ported to new platforms and extended with higher resolutions, mouselook, and new features." }
  - { term: Shareware, def: "A distribution model where the first episode was given away free and copyable, with the remaining episodes sold by mail order." }
  - { term: id Tech 1, def: "id Software's retroactive name for the DOOM engine in its later engine-numbering scheme." }
  - { term: Sector, def: "A flat-floored, flat-ceilinged polygonal region of a DOOM map; floor and ceiling heights, light level, and textures are properties of the sector." }
  - { term: Sprite, def: "A flat 2D bitmap drawn to face the camera; DOOM's monsters, items, and projectiles are sprites, not polygonal models." }
  - { term: Demo (LMP), def: "A recording of player input stored in an .lmp file; replaying the same inputs against the same engine reproduces a playthrough deterministically." }
  - { term: Carmack, def: "John Carmack, id's lead programmer, who wrote the DOOM renderer and later championed the source releases." }
related: [the-c-language, arbitrary-code-execution, emulation-preservation]
source: "Compiled from Wikipedia, the Doom Wiki (doomwiki.org), and id Software's official source release on GitHub; June 2026."
links:
  - { title: "Doom (1993 video game) — Wikipedia", url: "https://en.wikipedia.org/wiki/Doom_(1993_video_game)", kind: wiki }
  - { title: "Doom modding — Wikipedia", url: "https://en.wikipedia.org/wiki/Doom_modding", kind: wiki }
  - { title: "WAD — Doom Wiki", url: "https://doomwiki.org/wiki/WAD", kind: reference }
  - { title: "Source port — Doom Wiki", url: "https://doomwiki.org/wiki/Source_port", kind: reference }
  - { title: "id-Software/DOOM source release — GitHub", url: "https://github.com/id-Software/DOOM", kind: source }
---

# DOOM (1993)

## Origins and release

id Software released DOOM for MS-DOS on December 10, 1993. The small Texas studio had already redefined the action game with Wolfenstein 3D in 1992; DOOM was the follow-up that turned the first-person shooter into a genre. John Carmack led the programming and wrote the renderer. John Romero and Sandy Petersen designed levels, and Adrian Carmack handled art. The game shipped as three episodes set on the moons of Mars and in Hell, with a nameless marine fighting demons. It was loud, fast, and violent in a way home computers had not really seen, and it spread across office networks and bulletin boards almost immediately.

## The renderer is 2.5D, not true 3D

DOOM looks three-dimensional but is not. The world is defined on a two-dimensional plane; walls are line segments and floors are regions, with floor and ceiling heights attached. The renderer projects this into a convincing perspective, but the player cannot truly look up or down, and there is no room over room: you can never stack one space directly above another. Enemies and objects are flat sprites drawn at a handful of fixed angles, not polygonal models. This combination of a 2D world model with perspective drawing is what people mean by 2.5D. It was a deliberate trade; the constraints let the engine run smoothly on a 1993 PC.

## Binary space partitioning

The renderer's central trick is binary space partitioning. Romero's level designs grew complex enough that naive drawing was too slow, so Carmack adopted BSP, an idea from earlier computer-graphics research. A tool processes each map ahead of time, recursively splitting it along its own line segments into a binary tree. At runtime the engine walks that tree from the player's position to visit wall segments in a guaranteed front-to-back order, drawing only what is visible and skipping the rest. Because the heavy partitioning is precomputed, the per-frame cost is low. The BSP tree is stored inside the level data, which is why DOOM maps need a build step before they will run.

## WAD files and the data model

DOOM keeps almost everything outside the executable in WAD files; the name is a backronym for "Where's All the Data?". A WAD is a directory of named lumps: levels, sprites, sounds, music, textures, and palettes. The base game ships in an IWAD, and add-ons come as PWADs that replace or extend lumps without touching engine code. A level itself is built from sectors (the flat-floored regions), linedefs and sidedefs (the walls), and things (monsters, items, the player start). This clean separation of data from code is what made DOOM so moddable; you could redraw a monster or build a new map without recompiling anything.

## Shareware and how DOOM spread

id released the first episode, "Knee-Deep in the Dead," as free shareware. Anyone could copy it, pass it around, and play it in full; the remaining two episodes were sold by mail order. The model fit the early-1990s internet and FidoNet perfectly. The shareware episode landed on FTP sites and floppy disks everywhere, and a meaningful fraction of players eventually paid for the rest. It made id wealthy without a traditional publisher and seeded an enormous installed base, which in turn fed the modding community.

## The source release and source ports

id put the DOOM engine source online on December 23, 1997, initially the Linux version under a license that forbade commercial use. After community pressure (and the loss of a derivative project's code to a disk crash), id relicensed the engine under the GNU GPL on October 3, 1999. The GPL release is the one mirrored at id-Software/DOOM on GitHub. Programmers ported the code to every modern platform and removed the original limits; these builds are called source ports. Chocolate Doom aims for faithful behavior, while ZDoom, GZDoom, and PrBoom add higher resolutions, OpenGL rendering, mouselook, and scripting. By the 2000s most people played DOOM through a source port rather than the DOS original.

## Demos, determinism, and "runs on everything"

DOOM records gameplay as demos: .lmp files that store only the player's inputs, not video. Replaying a demo feeds those inputs back through the same deterministic engine, so the run reproduces exactly; this is the backbone of the speedrunning and demo-verification scene. The same simplicity behind that determinism, plus the open source, fuels the long-running joke that DOOM runs on everything. People have made it run on printers, ATMs, oscilloscopes, pregnancy-test displays, and inside other games. Much of that is genuine; the engine is small, portable C, and once you can draw a framebuffer and read a few buttons, a port is plausible. The gag endures because it keeps being true.
