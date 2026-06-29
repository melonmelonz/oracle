import { test, expect } from 'vitest';
import { parseFrontmatter, chunkBody, buildArtifacts } from '../scripts/build-corpus.mjs';

const DOC = `---
title: Test Topic
domain: monitors
tags: [crt, trinitron]
vocab:
  - { term: Underscan, def: "image pulled inward leaving a black border" }
  - { term: Aperture Grille, def: "vertical wires instead of a shadow mask" }
manuals:
  - { model: "PVM-20M2U", title: "Service Manual", url: "https://example/x", kind: service }
links:
  - { title: "Kanto Map", url: "https://example/map", kind: map }
  - { title: "ILI9341 Datasheet", url: "https://example/ds.pdf", kind: datasheet }
related: [gamecube, zelda-speedruns]
source: "test provenance"
---
# Test Topic
Intro line before any heading.

## History
It began somewhere.

## How It Works
A second section.
`;

test('parseFrontmatter reads extended fields', () => {
	const { meta, body } = parseFrontmatter(DOC);
	expect(meta.title).toBe('Test Topic');
	expect(meta.domain).toBe('monitors');
	expect(meta.tags).toEqual(['crt', 'trinitron']);
	expect(meta.vocab).toHaveLength(2);
	expect(meta.vocab[0]).toEqual({ term: 'Underscan', def: 'image pulled inward leaving a black border' });
	expect(meta.vocab[1].term).toBe('Aperture Grille');
	expect(meta.manuals[0]).toMatchObject({ model: 'PVM-20M2U', kind: 'service', url: 'https://example/x' });
	expect(meta.links).toHaveLength(2);
	expect(meta.links[0]).toEqual({ title: 'Kanto Map', url: 'https://example/map', kind: 'map' });
	expect(meta.related).toEqual(['gamecube', 'zelda-speedruns']);
	expect(meta.source).toBe('test provenance');
	expect(body).toMatch(/Intro line/);
});

test('chunkBody splits on ## headings, skipping the # title', () => {
	const { body } = parseFrontmatter(DOC);
	const chunks = chunkBody(body);
	const sections = chunks.map((c) => c.section);
	expect(sections).toContain('History');
	expect(sections).toContain('How It Works');
	// the pre-heading intro lands in an Overview chunk
	expect(sections).toContain('Overview');
});

test('buildArtifacts emits corpus, archive, lexicon, manuals', () => {
	const a = buildArtifacts([{ file: 'test-topic.md', raw: DOC }]);

	// corpus: one chunk per section, with embedText + ids
	expect(a.corpus.length).toBeGreaterThanOrEqual(3);
	expect(a.corpus[0]).toHaveProperty('id');
	expect(a.corpus[0]).toHaveProperty('embedText');
	expect(a.corpus[0].slug).toBe('test-topic');

	// archive: one entry per doc, sections preserved
	expect(a.archive).toHaveLength(1);
	expect(a.archive[0]).toMatchObject({ slug: 'test-topic', domain: 'monitors', title: 'Test Topic' });
	expect(a.archive[0].sections.map((s) => s.section)).toContain('History');
	expect(a.archive[0].related).toEqual(['gamecube', 'zelda-speedruns']);

	// lexicon: one entry per vocab term, carrying its source doc
	expect(a.lexicon.find((t) => t.term === 'Underscan')).toMatchObject({ domain: 'monitors', slug: 'test-topic' });
	expect(a.lexicon).toHaveLength(2);

	// manuals: carry their topic
	expect(a.manuals.find((m) => m.model === 'PVM-20M2U')).toMatchObject({ kind: 'service', topic: 'test-topic' });

	// links: carry their topic + domain + kind
	expect(a.links).toHaveLength(2);
	expect(a.links.find((l) => l.kind === 'datasheet')).toMatchObject({
		title: 'ILI9341 Datasheet',
		topic: 'test-topic',
		domain: 'monitors'
	});
});

test('lexicon dedupes by lowercased term, first wins', () => {
	const dup = `---
title: Other
domain: kernel
vocab:
  - { term: underscan, def: "a duplicate, should be dropped" }
---
## X
body
`;
	const a = buildArtifacts([
		{ file: 'test-topic.md', raw: DOC },
		{ file: 'other.md', raw: dup }
	]);
	const hits = a.lexicon.filter((t) => t.term.toLowerCase() === 'underscan');
	expect(hits).toHaveLength(1);
	expect(hits[0].slug).toBe('test-topic');
});
