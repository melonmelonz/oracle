---
title: Pathfinder
tags: [pathfinder, lidar, sveltekit, gaussian-splats, white-label]
era: present
---

# Pathfinder

## Two halves

Pathfinder is a LiDAR-scanning venture with two web properties: a marketing site
and an open-core portal. Both are SvelteKit on Cloudflare.

## The marketing site

The Pathfinder LiDAR site is a marketing front for scanning services, built in
SvelteKit with a pure-CSS dark "scan-field" aesthetic — the look of a laser
sweeping a dark room, done without heavy graphics libraries. It carries a Twilio
inquiry form for leads. The repo is private at melonmelonz/pathfinder-lidar and
it ships to pathfinder-lidar.pages.dev.

## The portal

The Pathfinder portal is an open-core, white-label revamp of an earlier
els911-portal codebase. It is SvelteKit on Cloudflare and leans on 3D Gaussian
splats to present scanned spaces in the browser. Unlike the marketing site, the
portal repo is PUBLIC at melonmelonz/pathfinder and lives at
pathfinder-c3o.pages.dev. It ships with a full specification package and six
branded PDFs in its docs directory — the white-label kit a customer would
rebrand and hand to their own clients.
