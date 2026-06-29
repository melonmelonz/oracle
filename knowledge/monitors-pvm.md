---
title: Sony PVM and Broadcast Monitors
domain: monitors
tags: [crt, trinitron, broadcast, pvm, bvm, retro-gaming, video, calibration]
vocab:
  - { term: Aperture Grille, def: "Sony's tensioned vertical-wire mask that separates color phosphors into continuous stripes instead of dots." }
  - { term: Shadow Mask, def: "A perforated metal plate behind the screen with one hole per triangular phosphor triad, the older alternative to aperture grille." }
  - { term: Underscan, def: "A display mode that shrinks the image inward so the full signal and a clean black border are visible." }
  - { term: Overscan, def: "The normal consumer mode where the image is enlarged past the bezel so the signal's hidden edges fall off-screen." }
  - { term: TVL, def: "TV Lines, the horizontal resolution the tube itself can resolve, distinct from the signal's scan-line count." }
  - { term: Dot Pitch, def: "Spacing between two same-color phosphor dots on a shadow-mask tube; aperture-grille tubes use stripe pitch instead." }
  - { term: Trinitron, def: "Sony's aperture-grille CRT line introduced in the late 1960s, known for brightness and a flat-vertical screen." }
  - { term: BNC, def: "A bayonet locking coaxial connector used for professional video feeds on broadcast monitors." }
  - { term: RGBHV, def: "RGB video with horizontal and vertical sync on separate wires, five conductors total, the VGA arrangement." }
  - { term: Sync-on-Green, def: "RGB where composite sync rides on the green channel, requiring only three wires (RGsB); among Sony consoles only the PS2 outputs it, and only in 480p-and-up RGB mode." }
  - { term: Composite, def: "A single-cable signal carrying luma, chroma, and sync mixed together, the lowest-quality common input." }
  - { term: S-Video, def: "A connection that splits luma and chroma onto separate wires for a sharper image than composite." }
  - { term: Component, def: "YPbPr analog video split into luma (Y) and two color-difference channels, carried on three BNC or RCA lines." }
  - { term: Convergence, def: "Alignment of the three electron beams so red, green, and blue land on the correct phosphors across the screen." }
  - { term: Geometry, def: "How square and straight the raster is; service controls correct bowing, tilt, and size." }
  - { term: Phosphor, def: "The coating that emits light when struck by the electron beam, arranged as stripes on Trinitron tubes." }
  - { term: Scanline, def: "One horizontal pass of the electron beam; visible dark gaps between lines define the CRT look." }
  - { term: NTSC, def: "The 525-line, ~60 Hz analog color standard used in North America and Japan." }
  - { term: PAL, def: "The 625-line, 50 Hz analog color standard used across much of Europe and elsewhere." }
related: [gamecube, zelda-speedruns]
source: "Wikipedia (Aperture grille, Component video), RepairFAQ TVFAQ, RetroTechLab and RetroRGB comparisons, AndyNumbers TVL primer, ConsoleMods CRT calibration wiki, Internet Archive Sony service manuals"
manuals:
  - { model: "Collection", title: "Sony Monitor Documentation (master collection)", url: "https://archive.org/details/SonyMonitorDocumentation", kind: collection }
  - { model: "PVM-20M2U/20M4U", title: "Service Manual", url: "https://archive.org/details/SonyPVM20M220M4ServiceManual", kind: service }
  - { model: "PVM-14L2/20L2", title: "Service Manual", url: "https://archive.org/details/trinitron_pvm14l2", kind: service }
  - { model: "PVM-20L2/14L2/9L2/9L3", title: "User Guide with Service Menu", url: "https://archive.org/details/sony-pvm-20-l-2-14-l-2-9-l-2-9-l-3-user-guide-manual-with-service-menu", kind: operation }
  - { model: "PVM-20M7MDE", title: "Service Manual", url: "https://archive.org/details/sony-pvm-20-m-7-mde-service-manual", kind: service }
  - { model: "PVM-8042Q/8045Q/9042Q/9045Q", title: "Operation and Service Manual", url: "https://archive.org/details/SonyPVM8042Q8045Q9042Q9045QOperationAndServiceManual", kind: service }
  - { model: "BVM-14E/14F/20E/20F", title: "Operation and Maintenance Manual", url: "https://archive.org/details/SonyBVM14EBVM14FBVM20EBVM20F20F1U14F5UOperationAndMaintenanceManual", kind: operation }
  - { model: "BVM-2010/1910", title: "Operation/Maintenance/Service Manual", url: "https://archive.org/details/SonyBVM20102010P2010PD2010PM2010PMD1910OperationAndMaintenanceServiceManual", kind: service }
  - { model: "BVM-1916", title: "Operation and Maintenance Manual", url: "https://archive.org/details/SonyBVM1916OperationAndMaintenanceManual", kind: operation }
  - { model: "BVM-2000AP", title: "Service Manual", url: "https://archive.org/details/sony-bvm-2000-ap-service-manual", kind: service }
---
# Sony PVM and Broadcast Monitors

## What PVM and BVM Mean

PVM stands for Professional Video Monitor. BVM stands for Broadcast Video Monitor. These were not televisions. They had no tuner, no speaker worth mentioning, and no remote. They existed so that the people making and transmitting video could see, exactly, what the signal carried.

A PVM lived in an edit bay, a camera truck, a hospital, or a security room. It was a workhorse reference. A BVM sat one tier above it, the master-grade instrument used for critical color evaluation and final quality control before broadcast. The distinction matters because everything about the design follows from the job. Brightness, sharpness, color accuracy, and precise geometry were the product; convenience was not.

Sony dominated both categories for decades. The line ran from small 8 and 9 inch units up through 14 and 20 inch flagships, and the model numbers encoded the size and tube grade. A studio might rack a wall of them. When you read a service manual for a PVM-20M2U or a BVM-20F1U, you are reading a document written for a technician who will open the chassis and align it, not for a consumer who will plug it in and forget it.

## The Trinitron Tube

Trinitron is Sony's aperture-grille CRT, introduced in the late 1960s. To understand why it looks different from an ordinary color tube, you have to look at the mask sitting just behind the glass.

Every color CRT needs a way to make sure the red beam hits red phosphor and nothing else. A conventional tube uses a shadow mask: a thin steel or Invar plate drilled with one hole per triangular cluster of three phosphor dots, placed about half an inch behind the screen. It works, but the metal blocks a large share of the electrons, so brightness suffers.

Sony's answer replaced that plate with a grille of fine vertical wires under tension. Behind those wires the phosphor is laid down as continuous vertical stripes, red, green, blue, repeating across the screen. Far more of the beam reaches the phosphor, so a Trinitron runs brighter and with cleaner, more saturated color at lower beam current, which also means less blooming on highlights. The screen is flat top to bottom and, in many models, flat side to side as well. The catch: those wires can vibrate, so one or two horizontal damper wires hold them steady. On a bright field you can sometimes see them, faint lines crossing the picture. That is not a fault; it is the tube's signature.

## Scanlines and How They Form

A CRT draws each frame as a series of horizontal sweeps. The electron beam starts at the top, races left to right lighting phosphor as it goes, snaps back, drops down a line, and sweeps again. Each of those passes is a scanline.

For a 240p source like most retro consoles, the monitor draws roughly 240 active lines and then leaves the space between them dark. The bright lit lines sit on a black background, and that alternating pattern is what people mean by "scanlines." It is a real artifact of the beam, not a filter painted on top.

How visible the scanlines are depends on the tube's resolution, measured in TVL. A higher-TVL tube focuses the beam into a thinner line, so the dark gaps grow wider relative to the lit lines. An 800 TVL HR Trinitron renders 240p with roughly a fifty-fifty split between line and gap. A 1000 TVL BVM tube pushes even more black between lines. Consumer tubes with low TVL spread the beam so wide that scanlines blur together and vanish, which is why an old Commodore 1084 hides them while a PVM shows them off. That is the heart of the appeal: the scanline structure was always part of how these images were meant to look.

## Underscan and Why It Matters

Consumer televisions run in overscan. The picture is blown up slightly larger than the bezel so the messy edges of the signal, switching noise, head-switching glitches, the blanking region, all fall off the screen where nobody sees them. It looks clean because it is cropped.

Professional monitors offer the opposite: underscan. A button pulls the image inward, shrinking it so the entire transmitted frame sits inside the glass with a clean black border around it. Now every pixel the signal carries is visible, including the parts a home set would have thrown away. For the engineer this was diagnostic. You could see closed-caption data, test patterns at the frame edge, geometry errors, and whether the active picture was actually filling the raster.

The conceptual point is larger than a feature. Underscan is a decision to show the whole thing rather than the flattering crop. Overscan hides the seams; underscan admits they exist and lets you inspect them. The reference monitor's entire reason for being is to not lie about the signal, and underscan is that honesty made literal: nothing trimmed away, the edges left in, the border drawn so you know exactly where the picture stops.

## Inputs and Sync

Broadcast monitors accept their signals over BNC, the bayonet locking coaxial connector, because a friction-fit RCA plug has no business in a moving truck. The input ladder runs from worst to best. Composite mixes luma, chroma, and sync down a single wire. S-Video splits luma and chroma for a noticeably sharper picture. Component, properly YPbPr, breaks the signal into a luma channel and two color-difference channels carried on three lines.

Above those sits RGB, the cleanest feed a 15 kHz CRT can take, and here sync gets interesting. RGBHV carries horizontal and vertical sync on their own wires, five conductors total, the VGA arrangement. RGBS combines both into one composite sync, four wires. Sync-on-green, written RGsB, hides the sync pulse on the green channel and needs only three. Many Sony pro monitors that handle 480p offer an external-sync toggle to accept RGsB, but it is mostly a niche path: among the PlayStation consoles only the PS2 outputs RGsB, and only in its 480p-and-up RGB mode, so it is a PS2-specific edge case rather than general Sony console behavior. From a switcher's point of view, sync-on-green and component look nearly identical electrically, since component's Y channel also carries the sync, which is why the two often pass through the same equipment. One caution worth its own line: YPbPr connectors are often colored red, green, and blue too, but feeding YPbPr into an RGB input gives a watchable picture with badly wrong colors. Match the color space.

## TVL, the BVM Tier, and Resolution

TVL means TV Lines, and it describes what the tube can resolve horizontally, not what the signal contains. Do not confuse it with 240p or 480i; those count scan lines, the vertical structure. TVL is closer to the native sharpness ceiling of the glass.

Sony stacked its lineup by tube grade. BVMs used only the best HR Trinitron tubes, and from the mid-1990s a letter in the model name encoded the count: E for 1000 lines, F for 900, G for 800. A BVM-20F1U is a 900 TVL master monitor. PVMs sat below. The PVM-20M4U and PVM-14M4U series ran 800 TVL on HR tubes, while the PVM-20M2U and PVM-14M2U were the 600 TVL standard-tube models, and early-1990s PVMs managed 600 HR and 450 standard. The N-series was the budget rung at 500 TVL, internally closer to a consumer set. Consumer WEGA Trinitrons landed closer to 300 to 350.

Sharper is not automatically better for games. Many 240p enthusiasts prefer 600 to 800 TVL because the scanline-to-gap ratio looks balanced, where a 1000 TVL BVM can open gaps wider than some people like. Size interacts too: a 20 inch tube at only 600 TVL looks soft because the same resolution is spread over more glass.

## Calibration and the D65/D93 World

A reference monitor is only useful if its white is the right white. White point is set by color temperature, and two standards split the world. D65, near 6504 K, is the warmer Western standard and the white point Rec. 709 defines for modern video work. D93, near 9305 K, is the cooler, bluer Japanese standard. The gap between them is large; the same RGB values look distinctly different under each.

The choice is partly cultural. Japanese sets often shipped cooler because cool white was preferred there, the way Western audiences leaned warm. This feeds an ongoing argument in retro circles. Games developed in Japan were authored on D93 displays, the reasoning goes, so the Super Mario Bros. sky that reads purple under D65 was meant to look blue. The honest counterpoint is that nobody knows whether those development monitors were calibrated at all, and a single console's library may have been made across mixed conditions.

For accurate work the answer is settled: D65 is the broadcast target. Many CRTs let you flip between 6500 K and 9300 K in the service menu or on a rear switch. Beyond white point, the service controls reach into convergence, geometry, and grey-scale tracking, the alignments that separate a monitor a technician trusts from one that merely lights up.
