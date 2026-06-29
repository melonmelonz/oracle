import type { PageLoad } from './$types';
import lexicon from '$lib/lexicon.json';
import { buildSearchIndex, groupAlpha, type LexEntry } from '$lib/lexicon';

export const prerender = true;

export const load: PageLoad = () => {
	const entries = lexicon as LexEntry[];
	const index = buildSearchIndex(entries);
	const groups = groupAlpha(index);
	const letters = Object.keys(groups).sort((a, b) =>
		a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)
	);
	const domains = [...new Set(entries.map((e) => e.domain))].sort();
	return { index, groups, letters, domains, count: entries.length };
};
