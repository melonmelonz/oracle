import type { PageLoad, EntryGenerator } from './$types';
import { error } from '@sveltejs/kit';
import lexicon from '$lib/lexicon.json';
import { slugifyTerm, type LexEntry } from '$lib/lexicon';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const seen = new Set<string>();
	const out: { term: string }[] = [];
	for (const e of lexicon as LexEntry[]) {
		const slug = slugifyTerm(e.term);
		if (seen.has(slug)) continue;
		seen.add(slug);
		out.push({ term: slug });
	}
	return out;
};

export const load: PageLoad = ({ params }) => {
	const entries = lexicon as LexEntry[];
	const entry = entries.find((e) => slugifyTerm(e.term) === params.term);
	if (!entry) error(404, 'That term is not in the lexicon.');

	const siblings = entries
		.filter((e) => e.slug === entry.slug && e.term !== entry.term)
		.map((e) => ({ term: e.term, href: `/lexicon/${slugifyTerm(e.term)}` }));

	return { entry, siblings };
};
