---
title: Zelda Speedrunning
domain: zelda
tags: [zelda, speedrun, ocarina-of-time, majoras-mask, glitches, n64]
vocab:
  - { term: Any%, def: "A category that finishes the game as fast as possible by any means, glitches included." }
  - { term: 100%, def: "A category that requires collecting everything the game tracks as completion, not just reaching the end." }
  - { term: RTA, def: "Real-time attack; a run timed by a real clock from start to finish, as opposed to in-game or tool-assisted timing." }
  - { term: Frame Perfect, def: "An input that must land on one exact frame, roughly 1/60th of a second on N64 hardware, to work." }
  - { term: Tool-Assisted Speedrun (TAS), def: "A run built with slowdown, save states, and frame-by-frame input, used to find theoretical limits rather than to compete with human runs." }
  - { term: Wrong Warp, def: "Loading a scene transition while the game is confused about the destination, sending Link somewhere unintended, sometimes straight to an ending." }
  - { term: Get-Item Manipulation, def: "Looting a chest's contents without the opening animation by triggering an item delay and then taking damage or swimming." }
  - { term: Bottle Adventure, def: "Equipping a non-sword item onto the B button by selecting it on C-Right and pulling the Master Sword." }
  - { term: Stale Reference Manipulation (SRM), def: "A use-after-free exploit where the game keeps writing to a freed actor's old memory, letting runners corrupt whatever loads there next." }
  - { term: Infinite Sword Glitch (ISG), def: "A state where Link's sword stays permanently active without a swing, used as a setup for many other tricks." }
related: [majoras-mask, gamecube]
source: "ZeldaSpeedRuns.com glitch documentation (SRM Overview, Bottle Adventure pages), Kotaku and TheGamer record reporting, TASVideos submission notes, speedrun.com category pages; record times reflect milestones reported through the early 2020s and continue to fall."
---

# Zelda Speedrunning

## What speedrunning is

Speedrunning is the practice of finishing a game as fast as possible under an agreed set of rules. Those rules are the whole game. A category defines what counts as the start, what counts as the end, and which techniques are legal in between. Most runs are RTA, timed by a real clock; a separate world of tool-assisted runs uses slowdown and frame-by-frame input to chart what is theoretically possible. The two inform each other. A TAS often proves a trick is real before any human lands it live.

The reason a game like Ocarina of Time rewards this is its depth. Many tricks are frame perfect, meaning the input has to land on a single frame out of sixty in a second. Others depend on the game's version, on the language set in the file name, or on the exact memory layout at one moment. Runners do not just play faster. They build a route, a fixed sequence of inputs and movement, and then practice that route until the hard parts become repeatable. The community keeps the routes, the glitch documentation, and the leaderboards in shared archives, mostly on speedrun.com and the older ZeldaSpeedRuns site.

## Categories

The category list is its own vocabulary. Any% finishes the game by any means; glitches are not only allowed, they are the point. 100% sits at the other end and requires everything the game tracks: every item, upgrade, and collectible. Between them sit categories that pick a different finish line or ban a class of trick.

Ocarina of Time's main extended categories include MST (Medallions, Stones, and Trials), which requires every spiritual stone and medallion, clearing the trials, and beating Ganon, and All Dungeons, which requires completing every area that contains a blue warp. All Dungeons and 100% are widely regarded as the hardest to run, the first for how brutally it punishes a mistake, the second for its length and near-perfect movement. Glitchless is its own family with Any%, 100%, and All Main Quests variants, governed by a long rulebook about what counts as a glitch. Several categories split further into SRM and No SRM versions, because the most powerful modern exploit changes the route so completely that running with and without it are almost different games.

## Get-Item Manipulation and Bottle Adventure

Two early tricks show how the routes grew from small exploits. Get-Item Manipulation is a fast way to obtain a bottle. Rather than open a chest and watch the animation, a runner triggers the game's item delay, moves next to the chest, then takes the item by swimming up for air or taking damage at the right moment. The bottle matters because it became the key that later warps depended on.

Bottle Adventure, often shortened to B-A, exploits how the game handles time travel between child and adult Link. The game stores which items sit on the B and C buttons for both ages so the player does not re-equip after traveling. By selecting an item on C-Right as a child and then pulling the Master Sword, a runner can place that item onto B, the slot normally reserved for the sword. The simplest payoff is using items where they are normally banned, such as bombs inside the Temple of Time. Its more dangerous cousin, Reverse Bottle Adventure (RBA), reverses the flow: a bottle on B writes values into inventory addresses, including memory just past the inventory, letting a runner flip the bits that represent songs, stones, and key items. RBA can grant items the runner never earned, at the cost of others.

## Infinite Sword Glitch

The Infinite Sword Glitch (ISG) is one of the oldest building blocks in the kit. When it is active, Link's sword stays "on" without a swing, so anything that touches the blade takes damage continuously. There is a tradeoff: while in this state Link loses the ability to automatically hop off ledges, so he will not fall where he normally would. In the original game it is most often set up with a bomb, using the bomb as the object Link interacts with to trigger the state. ISG matters less for the damage and more as a foundation. It is used to set up several other tricks, including the bottle-based glitches, and it shows the pattern that runs through all of these exploits: a small, harmless-looking state that becomes a tool when chained into something larger.

## Wrong Warp

Wrong Warp is the trick that first broke Any% wide open. The game numbers its areas, and a transition loaded while the game is confused about its destination can send Link to the wrong entry in that list. ZFG, then known as ZeldaFreakGlitcha, used this to set a world record in 2012 with the "Ganondoor" exploit, warping from the first dungeon toward the end of the game and cutting almost twelve minutes off the prior record, to a time reported around 34:59. The discovery that made this so powerful was a coincidence in the area numbering: the scene right after the Deku Tree is the collapsing-tower scene from Ganon's Castle, so a warp from the starting dungeon could leap most of the way to the finish. Earlier in the game's history, before this anything-goes era, the records authority Twin Galaxies banned glitches, so the first competitive runs were a fast version of the intended game. Cosmo (Cosmo Wright, later Narcissa Wright) was a prominent figure in that transition and pushed early glitched routes; one reported milestone is an 18:10 run in 2014. The exact attribution and timing of some early records are contested, so treat specific times as documented milestones rather than fixed facts.

## Stale Reference Manipulation and the collapse

The deepest break came from Stale Reference Manipulation (SRM), which entered the public route around late 2019. At its core SRM is a use-after-free bug. The game tracks actors (entities such as rocks, enemies, and items) in a heap, and some actors hold a reference to another actor they are carrying; Link holds a reference to a bush or rock above his head, the boomerang to whatever it grabbed. If that carried actor is unloaded while the reference survives, the game keeps writing position and rotation values to the freed memory. Load something new into that space and those writes corrupt it. Runners control what loads there through careful "heap manipulation."

What you can corrupt escalates in levels: editing an actor's data, then redirecting a function pointer such as the draw-function pointer to existing code, then calling code partway into a function. That last step reaches arbitrary code execution (ACE), where manipulated values become valid instructions and the game can be made to do almost anything, including jumping to the credits. The result was a fast collapse of the Any% record. As far as is documented, the route held near seventeen minutes for years, then a credits warp dropped it under thirteen minutes, then a later warp into ending cutscenes pushed the headline category under ten minutes, with reported times such as 9:56. ACE's power has been shown off in stunts like spawning Star Fox 64 Arwings on an unmodified cartridge. Because the route keeps changing, any single record number here is a snapshot; the community has long treated the game as something that keeps finding new ways to break.

## Majora's Mask

Majora's Mask is the sister discipline, built on a different engine quirk. Its signature exploit involves the Song of Soaring and a "hidden owl" in West Clock Town. If a runner has activated no other owl statue, playing the Song of Soaring has no listed destination and the game falls back to a default. The discovery, credited to Indextic in early 2014, is that the default is not fixed; it follows where the cursor last sat on the pause-menu map, and each owl point maps to a spot on that map. This index-warping lets a runner teleport widely, with counterintuitive results (aiming the cursor at one town can warp Link to a different road). A more advanced form overflows the text box that appears after the song, letting runners grab boss remains and the Fierce Deity's Mask and head for the final dungeon, even though it can require playing the song dozens of times. One reported milestone is ennopp112's record falling from 1:15:52 to 49:42 once the ocarina method matured.

Majora's Mask also runs Glitchless and No Major Glitches categories, and it shares foundational tricks with Ocarina of Time, including ISG. The three-day clock and the Song of Soaring as fast travel give it a routing flavor all its own, but the underlying pattern is identical to its older sibling: a beloved game taken apart, deliberately, by people who know it well enough to find the seams.
