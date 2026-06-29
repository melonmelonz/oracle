import type { PageLoad } from './$types';
import manuals from '$lib/manuals.json';

export const prerender = true;

interface Manual {
	model?: string;
	title?: string;
	url: string;
	kind?: string;
	year?: string;
	topic: string;
	topicTitle: string;
	domain: string;
}

/** Pull the Internet Archive item identifier out of a /details/<id> url. */
function identifier(url: string): string | null {
	const m = url.match(/archive\.org\/details\/([^/?#]+)/);
	return m ? m[1] : null;
}

export const load: PageLoad = () => {
	const items = (manuals as Manual[]).map((m) => ({ ...m, id: identifier(m.url) }));
	const byTopic = new Map<string, { topicTitle: string; items: typeof items }>();
	for (const m of items) {
		if (!byTopic.has(m.topic)) byTopic.set(m.topic, { topicTitle: m.topicTitle, items: [] });
		byTopic.get(m.topic)!.items.push(m);
	}
	return { groups: [...byTopic.entries()].map(([topic, g]) => ({ topic, ...g })), count: items.length };
};
