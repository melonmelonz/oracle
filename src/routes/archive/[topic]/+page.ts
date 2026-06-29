import type { PageLoad, EntryGenerator } from './$types';
import { error } from '@sveltejs/kit';
import archive from '$lib/archive.json';
import { slugifyTerm } from '$lib/lexicon';

export const prerender = true;

interface Vocab {
	term: string;
	def: string;
}
interface Manual {
	model?: string;
	title?: string;
	url: string;
	kind?: string;
	year?: string;
}
interface Topic {
	slug: string;
	title: string;
	domain: string;
	source: string | null;
	related: string[];
	sections: { section: string; text: string }[];
	vocab: Vocab[];
	manuals: Manual[];
}

export const entries: EntryGenerator = () =>
	(archive as { slug: string }[]).map((t) => ({ topic: t.slug }));

export const load: PageLoad = ({ params }) => {
	const topics = archive as Topic[];
	const topic = topics.find((t) => t.slug === params.topic);
	if (!topic) error(404, 'That one is not in the archive.');

	const titleBySlug = new Map(topics.map((t) => [t.slug, t.title]));
	const related = (topic.related ?? [])
		.filter((s) => titleBySlug.has(s))
		.map((s) => ({ slug: s, title: titleBySlug.get(s)! }));
	const vocab = (topic.vocab ?? []).map((v) => ({ ...v, href: `/lexicon/${slugifyTerm(v.term)}` }));

	return { topic, related, vocab };
};
