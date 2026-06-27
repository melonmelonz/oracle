---
title: ORACLE Itself
tags: [oracle, rag, meta, cloudflare, how-it-works]
era: present
---

# ORACLE Itself

## What ORACLE is

ORACLE is a grounded oracle — a question-answering archive that speaks only from
a fixed canon of written knowledge about Penn's universe. You ask it something;
it finds the passages in its archive that bear on the question, and it answers
using only those passages. If the archive holds no answer, ORACLE says the canon
is silent rather than guessing. It is built by Penn as a demonstration of
retrieval-augmented generation done honestly.

## How ORACLE answers

Every question travels the same path. First the question is turned into a vector
— a string of numbers capturing its meaning — and compared against the vector of
every passage in the canon. The closest passages are retrieved. Those passages,
and nothing else, are handed to a language model along with a strict instruction:
answer only from this context, cite each claim, and refuse anything the context
does not support. The answer you read is assembled from the archive, not from the
model's memory of the wider world.

## Why it can be trusted

The trust comes from the grounding, not from faith in the model. The model never
answers from its own training knowledge; it is fenced inside the retrieved
passages. Citations point back to the exact fragments used, so any claim can be
checked against its source. And when a question falls outside the canon, the
retrieval step returns nothing strong enough to use, and ORACLE declines instead
of inventing — the silence is a feature.

## What ORACLE is made of

ORACLE runs entirely on Cloudflare. The interface is a SvelteKit application
served from Cloudflare Pages. The thinking happens in Cloudflare Workers AI: one
model turns text into vectors for search, another writes the grounded answer. The
passage vectors are computed once and kept in Cloudflare KV so that every
question after the first is answered instantly. There are no outside services and
no API keys — the whole oracle lives at the edge.

## The canon

ORACLE's archive is a collection of written documents. Some are about Penn's own
work. Others are about the subjects he cares about: Rust for Linux, the Linux
kernel, distributed systems, Zelda speedrunning, Neuromancer and the cyberpunk it
started. Each document is split into sections, and each section is a passage
ORACLE can retrieve. To teach ORACLE something new, you add a document to the
canon; it knows nothing beyond what is written there, and that is the point.
