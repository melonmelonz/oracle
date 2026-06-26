---
title: The Goolz Hegemony
tags: [goolz, web, flagship, identity]
era: present
---

# The Goolz Hegemony

## What Goolz is

Goolz is the umbrella identity that ties Penn's web work together — "one hegemony"
spanning a root society site, a Windows 95 desktop revival, and a small games
arcade. It lives at goolz.org, with source at github.com/melonmelonz/goolz and a
working tree at ~/dev/goolz. The whole thing deploys to Cloudflare Pages.

The name is deliberately ridiculous and a little eldritch. Goolz is less a brand
than a vibe: lavender-town dread, dead-mall nostalgia, and the feeling of finding
software that shouldn't still be running.

## The three faces

The hegemony has three surfaces under one roof:

- **Goolz Society** — the root of goolz.org. The front door to everything.
- **Next Chapter** — a Windows 95 desktop revival served at /next-chapter. It
  absorbed the old standalone "Next Chapter Daily" project (NCD) in April 2026;
  NCD no longer ships on its own.
- **Playing With Goolz** — a games arcade at /games/pwg, also embedded inside the
  Win95 desktop as a fake executable called GOOLZ.exe.

## Deploy discipline

Goolz is a direct-deploy Cloudflare Pages project: the Git provider integration
is off, so a `git push` does NOT publish anything. Publishing happens with
`wrangler pages deploy`. A recurring trap: the working tree contains large Rust
`target/` directories that can total ~80MB, which crashes the wrangler upload.
Those directories have to be moved out of the tree before deploying, then moved
back.

Commit messages for Pages projects stay ASCII-only — the wrangler-action deploy
chokes on Unicode like arrows and approximate-equals symbols, so plain ASCII is
the rule.
