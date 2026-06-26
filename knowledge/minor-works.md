---
title: Minor Works and Side Projects
tags: [candy-mountain, hammertime, mute-pixel, mdt, 404-pages]
era: present
---

# Minor Works and Side Projects

## Candy Mountain

Candy Mountain is a co-op "space-portal" site: a crowd performs a split ritual
together to open a portal, which reveals a daily curated site. It is zero-UI and
diegetic — nothing explains itself, the interface is the fiction. Built with
Preact, Cloudflare Pages, and a Durable Object Worker. Source at
melonmelonz/candy-mountain, working tree at ~/dev/candy-mountain.

## Hammertime / Warscribe

Hammertime is a Warhammer 40,000 army builder and battle tracker. It lives at
github.com/melonmelonz/hammertime, deploys to warscribe.pages.dev, and works out
of ~/dev/hammertime.

## mute-pixel

mute-pixel is a pixel-art asset gallery at mute-pixel.pages.dev. It pairs a
passphrase-gated PixelLab generator with a community gallery backed by Cloudflare
KV, all served through Pages Functions.

## MDT — Maud'dib Tek

MDT is a consulting landing site for Maud'dib Tek, at github.com/melonmelonz/
mdt-landing, live at mdt-landing.pages.dev, working tree ~/dev/mdt-landing.

## 404-pages

The 404-pages collection is six drop-in 404.html pages meant to be copied into
any project — a small library of good-looking dead ends. Source at
github.com/melonmelonz/404-pages and ~/dev/404-pages.

## A platform note

Almost everything here is a Cloudflare Pages project, and most of them have the
Git provider integration turned off — which means a `git push` does not publish.
Publishing is always an explicit `wrangler pages deploy`. When a Pages project
needs a Durable Object, the DO cannot be declared inline in the Pages config; it
goes in a sibling Worker and gets bound by script_name. These two facts explain a
lot of the deploy rituals across the portfolio.
