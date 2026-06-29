import type { PageLoad } from './$types';
import links from '$lib/links.json';

export const prerender = true;

interface Link {
	title: string;
	url: string;
	kind: string;
	topic: string;
	topicTitle: string;
	domain: string;
}

export const load: PageLoad = () => {
	const items = links as Link[];
	const byTopic = new Map<string, { topicTitle: string; domain: string; items: Link[] }>();
	for (const l of items) {
		if (!byTopic.has(l.topic)) byTopic.set(l.topic, { topicTitle: l.topicTitle, domain: l.domain, items: [] });
		byTopic.get(l.topic)!.items.push(l);
	}
	const kinds = [...new Set(items.map((l) => l.kind))].sort();
	const groups = [...byTopic.entries()].map(([topic, g]) => ({ topic, ...g }));
	return { groups, kinds, count: items.length };
};
