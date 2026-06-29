import { test, expect } from 'vitest';
import { slugifyTerm, buildSearchIndex, groupAlpha } from '../src/lib/lexicon';

const TERMS = [
	{ term: 'MOSI', def: 'master out slave in', domain: 'kernel', slug: 'spi-bus', topicTitle: 'The SPI Bus' },
	{ term: 'Aperture Grille', def: 'vertical wires', domain: 'monitors', slug: 'monitors-pvm', topicTitle: 'Sony PVM' },
	{ term: '100%', def: 'a category', domain: 'zelda', slug: 'zelda-speedruns', topicTitle: 'Zelda' }
];

test('slugifyTerm produces clean url slugs', () => {
	expect(slugifyTerm('Aperture Grille')).toBe('aperture-grille');
	expect(slugifyTerm('CPOL/CPHA')).toBe('cpol-cpha');
	expect(slugifyTerm('MOSI')).toBe('mosi');
	expect(slugifyTerm('Tool-Assisted Speedrun (TAS)')).toBe('tool-assisted-speedrun-tas');
});

test('buildSearchIndex carries term, def, domain, slug, and an href', () => {
	const idx = buildSearchIndex(TERMS);
	expect(idx).toHaveLength(3);
	expect(idx[0]).toMatchObject({ term: 'MOSI', domain: 'kernel', slug: 'spi-bus' });
	expect(idx[0]).toHaveProperty('def');
	expect(idx[0].href).toBe('/lexicon/mosi');
});

test('groupAlpha buckets by first letter, numerals under #', () => {
	const g = groupAlpha(TERMS);
	expect(g['A'][0].term).toBe('Aperture Grille');
	expect(g['M'][0].term).toBe('MOSI');
	expect(g['#'][0].term).toBe('100%');
});

test('groupAlpha sorts terms within a bucket', () => {
	const g = groupAlpha([
		{ term: 'Zorp', def: '', domain: 'x', slug: 's', topicTitle: 't' },
		{ term: 'Zebra', def: '', domain: 'x', slug: 's', topicTitle: 't' }
	]);
	expect(g['Z'].map((t) => t.term)).toEqual(['Zebra', 'Zorp']);
});
