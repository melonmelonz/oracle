---
title: Playing With Goolz
tags: [goolz, game, bomberman, ai]
era: present
---

# Playing With Goolz

## Origin and reskin

Playing With Goolz (PWG) started life as a project called PWF3. It was renamed
and reskinned in May 2026: the gameplay took on a Bomberman shape, and the look
became a ghostly, Lavender-Town-inspired theme — sickly purples, a haunted
chiptune mood, the sense that the cartridge is cursed. The old PWF3 standalone
repository and its Worker were deprecated in the move.

## Where it lives

PWG ships in two places at once. It stands alone at /games/pwg, and it is also
embedded inside the Next Chapter Windows 95 desktop as a fake executable named
GOOLZ.exe — double-click the icon on the retro desktop and the game boots inside
the bit.

## The Bomberman bones

The game is grid-based, Bomberman-style: drop bombs, blow through soft blocks,
trap the enemy in the blast cross. The tuning that matters lives in a validated
AI bundle — the opponent's behavior was carefully dialed in rather than left to
chance.

## The AI opponent

The PWG enemy AI runs on a validated parameter bundle, and the guiding rule for
tuning it is to err on the side of caution — a beatable, readable opponent beats
a brutal one. The validated bundle settled on a movement speed of 0.62, a bomb
cooldown to stop spam, body-aware pathfinding (a breadth-first search that
accounts for the bot's own body so it doesn't trap itself), and a fix for an
arrival-time off-by-one error that previously made the bot mistime threats. The
result is an opponent that plays fair and legible — dangerous enough to respect,
never cheap.
