---
title: The Point Cloud Processing Server
tags: [hardware, workstation, zfs, sietch, threadripper]
era: present
---

# The Point Cloud Processing Server

## What it is

The point-cloud processing server is Penn's work build: a Threadripper PRO
workstation for processing LiDAR scan data into usable point clouds and floor
plans. The real build diverged from the original v5.1 spec PDF — the document is
a starting point, not the source of truth.

## The spec

- **CPU**: Threadripper PRO 9965WX, 24 cores
- **Platform**: WRX90 motherboard
- **Memory**: 192GB ECC
- **GPU**: an RTX 5080 paired with a 3080
- **Cooling**: Noctua NH-U12S — air, not liquid
- **Chassis**: a Fractal 9000D full tower
- **Networking**: MikroTik 10G

## The backup box

Alongside the workstation sits a ZFS backup box: 64GB of RAM and three 16TB
drives in RAIDZ1, giving roughly two drives' worth of usable capacity with
single-drive fault tolerance. Point-cloud datasets are large and slow to
regenerate, so the backup target is part of the build, not an afterthought.

## The fleet and access

The machines are part of a small home fleet with a desert-coded naming scheme.
Operators reach the fleet through a jump host called thopter. ARRAKIS is a
Windows VM (guest 100) on the fleet carrying an RTX 5080, driven remotely; SIETCH
is reachable for passwordless root over SSH. The fleet is segmented across VLANs,
and the workflow leans on `qm guest-exec` to drive the Windows guest and Proxmox
tooling under the hood.

## ARRAKIS streaming

ARRAKIS streams its desktop from the RTX 5080 Windows VM to a Bazzite client
using Sunshine and Moonlight over Tailscale. Sunshine runs as the host; the one
recurring snag is that Tailscale needs a one-time manual auth before the tunnel
comes up clean.
