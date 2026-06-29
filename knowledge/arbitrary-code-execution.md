---
title: Arbitrary Code Execution in Games
domain: games
tags: [ace, speedrun, memory-corruption, glitch, retro, tas]
vocab:
  - { term: Arbitrary Code Execution, def: "Steering a program to run instructions the developers never wrote, assembled from data the player controls." }
  - { term: Memory Corruption, def: "Writing values into memory the program assumes hold something else, so later reads or jumps misbehave." }
  - { term: Stack Smashing, def: "Overwriting saved return addresses on the call stack so a routine returns to a location the attacker chose." }
  - { term: Payload, def: "The block of bytes the player has shaped to act as the custom code that finally runs." }
  - { term: Credits Warp, def: "An ACE setup whose payload jumps straight to the ending sequence, beating the game in minutes." }
  - { term: Tool-Assisted Speedrun, def: "A run built frame by frame with emulator tools, often feeding precise byte streams through the controller ports." }
  - { term: RAM Write, def: "Storing a chosen byte at a chosen address, the building block that lets a player author a payload in memory." }
  - { term: 8F, def: "A glitch item in Pokemon Red and Blue (index 0x5D) whose effect pointer sends execution into party data in RAM." }
related: [pokemon-gen1, zelda-speedruns, doom]
source: "Compiled June 2026 from Bulbapedia, Glitch City Wiki, ZeldaSpeedRuns, Hackaday, and TASVideos; mechanics cross-checked against multiple community writeups."
links:
  - { title: "Arbitrary code execution (Bulbapedia)", url: "https://bulbapedia.bulbagarden.net/wiki/Arbitrary_code_execution", kind: wiki }
  - { title: "Arbitrary code execution (Glitch City Wiki mirror)", url: "https://nintyconservation.github.io/glitchcity.wiki/glitchcity.wiki/Arbitrary_code_execution.html", kind: wiki }
  - { title: "SRM Overview (ZeldaSpeedRuns)", url: "https://www.zeldaspeedruns.com/oot/srm/srm-overview", kind: reference }
  - { title: "Reprogramming Super Mario World From Inside The Game (Hackaday)", url: "https://hackaday.com/2015/01/22/reprogramming-super-mario-world-from-inside-the-game/", kind: reference }
  - { title: "Super Mario World total-control TAS (TASVideos)", url: "https://tasvideos.org/2513M", kind: video }
---

# Arbitrary Code Execution in Games

## What ACE Actually Means

Arbitrary code execution, or ACE, is the point where a player stops playing a game and starts programming the machine that runs it. The console only ever fetches bytes and treats them as CPU instructions; it has no concept of "this region is code, that region is data." If a player can corrupt the program so it jumps into a region they can fill with their own bytes, the processor will dutifully execute whatever is there. Daniel Baamonde, an Ocarina of Time runner, framed it as two requirements: redirect execution into memory that normally holds data, and shape the bytes at that location so they mimic valid instructions. Meet both and the game becomes a substrate for code the developers never wrote. On original hardware this is not modding; the cartridge is untouched. Everything comes from in-game state and controller inputs.

## How Inputs Become Bytes in RAM

The player's only channel into the machine is the controller, so every ACE setup is ultimately a way of turning button presses into stored bytes. In Pokemon, items, box names, and Pokemon nicknames are edited until their underlying index numbers spell out the desired opcodes; a stack of items is just a run of bytes in the bag. In Ocarina of Time the file name is a favorite payload region because the player types it directly. Tool-assisted runs go further and stream bytes through the controller ports themselves, which is why TASBot demos read joypad registers as instructions. In every case the trick is the same: find a writable region whose contents the game faithfully copies somewhere predictable, then fill it one careful value at a time.

## Super Mario World: The Credits Warp

The Super Mario World credits warp is the canonical hardware ACE. The setup empties a sprite slot using an item-swap glitch (Yoshi and Mario grabbing the same coin), then a Chargin' Chuck is mishandled as a power-up. Execution falls off the end of mapped memory into open bus and lands in the sprite coordinate tables, which the player has loaded with chosen values by positioning sprites. Those values run as 65816 instructions. SethBling demonstrated it on an unmodified SNES in January 2015 after Twitch user Jeffw356 found it in emulation. Runners hold extra buttons on controllers plugged through multitaps to feed the exact bytes the routine reads. The world-record any% time now sits near 41 seconds. Hedge noted: the precise addresses and reasons the open-bus value resolves to a usable instruction are documented in detail by the community, and small route variants exist.

## Pokemon Gen 1: 8F and the Item Pack

Generation I gives one of the cleanest entry points. The glitch item 8F (index 0x5D in Red and Blue; the Yellow analog is "ws m," index 0x63) has no hardcoded effect. Instead its behavior is read from a pointer that lands in writable RAM: 8F sends the program counter into the party data near 0xD163, while "ws m" jumps into current-box data. Because party data is awkward to control precisely, the standard pattern is a two-stage bootstrap; the entry jump writes a second jump to the third item in the bag, and the real payload is spelled out there with item index numbers and quantities. Obtaining 8F itself usually relies on the item-underflow glitch or specific glitch Pokemon. A caution the community stresses: since the payload lives in ordinary game data, routine play (healing, catching, reordering) can silently corrupt it.

## Pokemon Gen 2: The Coin Case

The Coin Case glitch is the Generation II analog and is exclusive to the English Gold and Silver; it does not exist in Japanese versions or in Crystal. The root cause is mundane: the English Coin Case text string is not properly terminated, so after listening to certain Pokemon cries the game runs off the end and executes echo RAM around 0xE112. The cries of Bellsprout, Machop, Machoke, or Omanyte redirect execution to a further address that party Pokemon can steer toward the PC items, where a payload waits. It went unnoticed in testing because that memory region is usually zeros, so nothing visible happened. It is a textbook example of how a single missing terminator byte becomes a full code-execution primitive.

## Ocarina of Time: SRM into ACE

Ocarina of Time reached ACE through Stale Reference Manipulation, discovered in 2019. The N64 game keeps actors in a doubly linked heap, and some actors store references to others; Link holds a reference to what is over his head, the boomerang to what it carries. SRM unloads the carried actor and loads something else into that memory, while the holder keeps writing position data to the now-stale reference. By ordering room and actor loads carefully, runners aim those stray writes at actor code or function pointers. This climbs from editing actor variables, to partial function calls, to full ACE that calls arbitrary functions (commonly the title-screen file-setup routine for instant items). Because full ACE is effectively unlimited, it is banned in most categories; the famous Triforce% demonstration used TASBot to feed custom data and even added new content, all through the controller ports.

## What TAS Reaches That Humans Cannot

A tool-assisted speedrun records inputs frame by frame, with save states, slow motion, and scripting, so it can hit windows no human hand can. That precision is what lets a TAS write large, exact payloads: the Super Mario World total-control runs reprogram the cartridge mid-play into small games like Pong and Snake using only controller input. Real-time runners must trade that ambition for reliability, leaning on simpler, robust setups (a single credits warp) that survive human timing error. The line between the two is not a different exploit but a different budget of precision; both stand on the same fact that a game console will run whatever bytes you can convince it to fetch.
