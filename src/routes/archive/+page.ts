import type { PageLoad } from './$types';
import archive from '$lib/archive.json';

export const prerender = true;

interface Section {
	section: string;
	text: string;
}
interface Topic {
	slug: string;
	title: string;
	domain: string;
	sections: Section[];
	vocab: unknown[];
	manuals: unknown[];
}

// The order and labels the domains read in on the index.
const DOMAIN_ORDER = ['monitors', 'hardware', 'games', 'kernel', 'distsys', 'fiction', 'meta'];
const DOMAIN_LABEL: Record<string, string> = {
	monitors: 'broadcast monitors',
	hardware: 'hardware',
	games: 'games',
	kernel: 'kernel and rust',
	distsys: 'distributed systems',
	fiction: 'fiction and lore',
	meta: 'the oracle'
};

function blurb(t: Topic): string {
	const first = t.sections.find((s) => s.text.trim())?.text ?? '';
	const flat = first.replace(/\s+/g, ' ').trim();
	return flat.length > 160 ? flat.slice(0, 157).trimEnd() + '...' : flat;
}

export const load: PageLoad = () => {
	const topics = archive as Topic[];
	const byDomain = new Map<string, Array<{ slug: string; title: string; blurb: string; vocab: number; manuals: number }>>();
	for (const t of topics) {
		if (!byDomain.has(t.domain)) byDomain.set(t.domain, []);
		byDomain.get(t.domain)!.push({
			slug: t.slug,
			title: t.title,
			blurb: blurb(t),
			vocab: t.vocab.length,
			manuals: t.manuals.length
		});
	}

	const groups = [...byDomain.keys()]
		.sort((a, b) => {
			const ia = DOMAIN_ORDER.indexOf(a);
			const ib = DOMAIN_ORDER.indexOf(b);
			return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
		})
		.map((domain) => ({
			domain,
			label: DOMAIN_LABEL[domain] ?? domain,
			topics: byDomain.get(domain)!.sort((a, b) => a.title.localeCompare(b.title))
		}));

	return { groups, count: topics.length };
};
