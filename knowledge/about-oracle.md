---
title: About the Oracle
domain: meta
tags: [oracle, archive, rag, retrieval, grounding, how-it-works]
vocab:
  - { term: Retrieval-Augmented Generation, def: "Answering with a language model that is fed passages retrieved from a fixed source, so it speaks from documents rather than memory." }
  - { term: Grounding, def: "The rule that every claim must trace to a retrieved passage; if nothing relevant is found, the honest answer is silence." }
  - { term: Hybrid Search, def: "Combining dense vector similarity with lexical keyword matching so both meaning and exact terms are caught." }
  - { term: BM25, def: "A classic lexical ranking function that scores a passage by how well its rare query words match, normalized for length." }
  - { term: Reciprocal Rank Fusion, def: "A way to merge two ranked lists by rewarding items that rank highly in either, without needing to normalize their scores." }
  - { term: Cross-Encoder Reranker, def: "A model that reads a question and a passage together and scores true relevance, sharper than comparing them as separate vectors." }
  - { term: Embedding, def: "A vector of numbers that places a piece of text in a space where nearby vectors mean similar things." }
  - { term: Cosine Similarity, def: "The angle-based measure of how aligned two embedding vectors are, used to rank passages by meaning." }
related: [distributed-systems]
source: "The architecture of this site: SvelteKit and Cloudflare Workers AI, hybrid retrieval with a cross-encoder reranker."
links:
  - { title: "SvelteKit Cloudflare adapter", url: "https://svelte.dev/docs/kit/adapter-cloudflare", kind: docs }
  - { title: "Cloudflare Workers AI", url: "https://developers.cloudflare.com/workers-ai/", kind: docs }
  - { title: "Cloudflare Workers KV", url: "https://developers.cloudflare.com/kv/", kind: docs }
---
# About the Oracle

## What this is

The oracle is a small reference archive. It holds a handful of subjects that are worth knowing well: broadcast CRT and Sony PVM monitors, the Nintendo GameCube, The Legend of Zelda and the long history of breaking it in speedruns, Rust for Linux and the SPI bus, the Linux kernel, distributed systems, and Neuromancer. You can read it like a reference, or you can ask it a question and it will answer from what is written.

It does not know anything else. Ask it about the weather and it will tell you, plainly, that the weather is not in the archive.

## How it answers

Every answer is grounded. When you ask a question the oracle does not reach into a model's memory; it retrieves passages from this archive and answers only from those, citing each one inline. If nothing relevant is found, it says so rather than guessing. That refusal is not a failure mode. It is the point.

The retrieval is hybrid. A dense embedding catches meaning, a BM25 lexical score catches exact terms like a model number or a glitch name, and the two rankings are fused with Reciprocal Rank Fusion. A cross-encoder reranker then reads the question and each candidate passage together and scores true relevance, and a threshold on that score is the honesty gate.

## Underscan

A broadcast monitor has an underscan mode that pulls the picture inward to reveal the part of the signal normally hidden behind the bezel. The oracle borrows the word. Turn on underscan and the retrieval signal is laid bare: the query as it was tokenized, every candidate passage, its dense score, its lexical score, its fused rank, and the reranker score that decided whether it survived. The machinery is not hidden. You can watch it work.

## What it runs on

The whole thing is built on SvelteKit and runs on Cloudflare Pages. The embeddings, the reranker, and the language model are all Cloudflare Workers AI, so there are no external API keys and the retrieval happens at the edge. The corpus is small on purpose, which is why brute-force cosine over a few dozen vectors is instant and needs no separate index.
