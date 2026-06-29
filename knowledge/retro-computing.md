---
title: Computing in the 1990s and Early 2000s
domain: hardware
tags: [retro, pc, dos, windows, gpu, modem, cd-rom, lan, crt]
vocab:
  - { term: MS-DOS, def: "Microsoft's command-line disk operating system that ran most PCs before and beneath Windows 95." }
  - { term: Windows 95, def: "The 1995 Microsoft operating system that merged DOS and Windows and introduced the Start menu and taskbar." }
  - { term: 3dfx Voodoo, def: "The 1996 add-on board that brought hardware 3D acceleration to consumer PCs and defined early gaming graphics." }
  - { term: Dial-up Modem, def: "A device that carried data as audible tones over an ordinary phone line, topping out near 56 kbit/s." }
  - { term: Shareware, def: "A distribution model where a free partial version was freely copied to entice purchase of the full registered version." }
  - { term: LAN Party, def: "A gathering where people hauled their PCs to one location and wired them together for multiplayer games." }
  - { term: CRT, def: "Cathode ray tube; the deep glass display that fired electron beams at colored phosphors behind the glass." }
  - { term: CD-ROM, def: "A read-only optical disc holding about 650 MB, used to distribute software after floppies ran out of room." }
  - { term: Defragmentation, def: "Rearranging a disk's file fragments into contiguous order so the drive head seeks less." }
  - { term: Beige Box, def: "The generic putty-colored tower or desktop case that nearly every PC shipped in during the era." }
related: [monitors-pvm, gamecube]
source: "Web-verified June 2026 against Wikipedia, DOS Days, fabiensanglard.net, ITU/EE Times, Internet Archive, and contemporary retrospectives."
links:
  - { title: "DOS Days", url: "https://www.dosdays.co.uk/", kind: archive }
  - { title: "WinWorld operating systems library", url: "https://winworldpc.com/library/operating-systems", kind: archive }
  - { title: "PCjs machines", url: "https://www.pcjs.org/", kind: archive }
  - { title: "Fabien Sanglard: Doom renderer", url: "https://fabiensanglard.net/doomIphone/doomClassicRenderer.php", kind: article }
---

# Computing in the 1990s and Early 2000s

## The CRT on the desk

Every PC of the era sat behind a deep, heavy glass tube. A color cathode ray tube fired three electron beams, one each for red, green, and blue, through a perforated metal shadow mask (or, in Sony's Trinitron line, a grid of fine vertical wires called an aperture grill) onto colored phosphor dots painted on the inside of the screen. The phosphors glowed briefly where the beams struck them, and the whole image was redrawn line by line many times a second. The redraw speed was the refresh rate, often 60 Hz on cheaper monitors and climbing to 85 Hz and beyond on better ones to reduce visible flicker. Sharpness was sold by dot pitch, the spacing between phosphor dots; smaller was better. The baseline was the VGA standard at 640 by 480 pixels, with the screen running 4:3 and stepping up through 800 by 600, 1024 by 768, and 1280 by 1024. These were the same fundamentals as the broadcast monitors used in video, just driven by a computer's analog VGA signal. The tubes were enormous and warm, and they would outlast the rest of the machine.

## DOS underneath everything

Before the graphical desktop took over, the PC booted to a blinking prompt. MS-DOS was Microsoft's command-line operating system, and you typed commands to change directories, run programs, and launch games. There was no multitasking to speak of; one program owned the machine. Memory management was a black art, since DOS could address conventional memory below 640 KB directly and everything above it needed extended or expanded memory tricks to reach. Games shipped with cryptic instructions about freeing up enough base memory and loading the right sound and mouse drivers. Even after Windows 95 arrived, DOS did not vanish: traces remained throughout the system, and MS-DOS 7 still loaded briefly during boot. For years the command line stayed close at hand, one keystroke under the colorful icons, and plenty of software still expected to find it there.

## Windows 95 and the Start menu

On August 24, 1995, Microsoft released Windows 95 at retail (it had gone to manufacturing on July 14). Developed under the codename "Chicago," it merged the separate MS-DOS and Windows product lines into one and moved from the older 16-bit cooperative multitasking to a 32-bit preemptive design. The launch was a spectacle, backed by a roughly $300 million campaign and the Rolling Stones' "Start Me Up." The song fit the headline feature: the Start menu, a single button in the corner that opened onto everything installed. Alongside it came the taskbar, the notification area, Windows Explorer, desktop shortcuts, Plug and Play driver detection, and long filenames up to 255 characters instead of the old eight-plus-three limit. It sold more than seven million copies in five weeks. The desktop metaphor it set down, a button at bottom-left and a bar of running programs, is still recognizable on screens decades later.

## The beige box

The hardware all looked the same. PCs shipped in putty-colored cases, the beige box, whether a flat desktop with the monitor perched on top or an upright tower. Inside was a motherboard, expansion slots for sound and video and modem cards, drive bays for floppies and a CD-ROM, and a power supply with a loud fan. The sameness was a feature of the open PC platform: parts from many makers fit together, so people upgraded a card here, a drive there, rather than replacing the whole machine. The cases were sturdy and unglamorous, and they were heavy. Some were sold with carrying handles or straps so the owner could lug the tower to a friend's house. That weight, multiplied by a CRT, is the reason the LAN party was such physical work.

## 3D acceleration and the rise of the GPU

For most of the decade, the processor drew 3D graphics in software, slowly. That changed when 3dfx Interactive, founded in 1994 by former Silicon Graphics engineers, shipped the Voodoo Graphics chip (the SST-1, named for founders Sellers, Smith, and Tarolli). The first card built on it, Orchid Technology's Righteous 3D, arrived on October 7, 1996. The Voodoo did one thing: 3D rendering, and fast. It had no 2D output of its own, so it sat alongside a separate VGA card, connected by a pass-through cable, and woke up only when a 3D game ran; some boards made an audible click as they switched modes. A typical card carried 4 MB of EDO DRAM at 50 MHz and did texture mapping, Z-buffering, Gouraud shading, and bilinear filtering in hardware. 3dfx paired it with the Glide API, a lean subset of OpenGL tuned to the chip, and games like Tomb Raider looked transformed. At its peak the company held an estimated 80 to 85 percent of the 3D accelerator market. Then Nvidia's GeForce 256 (1999) integrated hardware transform and lighting onto one chip, 3dfx stumbled, and Nvidia bought its assets in December 2000.

## Dial-up and the early web

Going online meant tying up the phone line. A dial-up modem turned data into the screechy tones of a handshake, then carried it over an ordinary analog line. Speeds climbed through the decade: 14.4 kbit/s standardized as V.32bis in 1991, with affordable modems shipping from early 1992, then 28.8 in 1994, 33.6 in 1996, which sat near the hard ceiling that quantization noise imposed on analog-to-digital conversion. The 56k generation broke through by exploiting the fact that the phone network was already digital past the local loop, but it arrived split between two incompatible camps, USRobotics' X2 and Rockwell's K56Flex, sold at around $200. The ITU ended the standoff with the V.90 standard, drafted in February 1998 and ratified that September, nicknamed "V.Last." Even then, 56k was a downstream maximum; uploads stayed at 33.6, and noisy rural lines often fell to 21.6, the so-called "21600 Syndrome." Real throughput of 40 to 50 kbit/s shaped the whole early web: small images, sparse pages, and downloads measured in patient minutes.

## Shareware, CD-ROMs, and the LAN party

Software found its audience by being copied freely. Under the shareware model, a free partial version circulated by any means and the full game was sold by mail. id Software's Doom is the landmark case: at midnight on December 10, 1993, the team uploaded the first nine-level episode, "Knee-Deep in the Dead," and let players spread it. The full $40 game shipped only by mail order. By an estimate only about one percent of downloaders paid, but that still brought roughly $100,000 a day, and the shareware episodes were distributed well over a million times. Meanwhile storage outgrew the 3.5-inch floppy's 1.44 MB; office suites once shipped on a dozen disks. The CD-ROM, a read-only optical format from Sony and Philips dating to 1985, held about 650 MB, hundreds of times more, and became standard PC equipment by the mid-1990s. With drives fragmenting files across the disk, FAT-era machines slowed over time, and users ran defragmentation tools (Microsoft Defrag arrived in MS-DOS 6.0) to pull each file's pieces back together. And to play together, people hauled beige boxes and CRTs to one room, wired them with Ethernet hubs, fought with static IPs and the IPX protocol, and played Doom, Quake, and StarCraft until dawn. That was the LAN party.
