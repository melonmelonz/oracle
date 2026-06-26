---
title: Wanderlost
tags: [game, pixel-art, cloudflare, worker]
era: present
---

# Wanderlost

## The pitch

Wanderlost is a browser-based pixel-art walking sim — a small, quiet game about
moving through an authored world on foot. It runs on Cloudflare Pages with a
companion Worker, and the whole thing is built to feel handmade rather than
procedurally sprawling.

## World overhaul

The project's center of gravity is the world-overhaul branch, which replaces
earlier open-ended sprawl with a finite, authored map — a deliberately bounded
world a player can actually learn. The current build is a SHORT demo on purpose;
the priority is not size but solidity.

## The one priority

Above everything else, the game-loop solidity is priority number one. A walking
sim lives or dies on whether movement feels right — collision, footstep cadence,
the camera, the way the world reacts. Polish on the core loop beats new acreage
every time.

## Working style

The standing direction on Wanderlost is to keep expanding it with continuous,
additive polish, and the designer's judgment is explicitly trusted to make the
design calls. It is the kind of project that grows a little better every pass
rather than landing in one big release.
