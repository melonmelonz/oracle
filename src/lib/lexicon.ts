// Pure helpers for the lexicon: slugs, the client search index, and the A-Z
// grouping. No framework imports, so they are unit-testable in isolation.

export interface LexEntry {
	term: string;
	def: string;
	domain: string;
	slug: string; // the source topic slug
	topicTitle?: string;
}

export interface SearchEntry extends LexEntry {
	href: string;
}

/** A url-safe slug for a term: lowercase, non-alphanumerics collapsed to dashes. */
export function slugifyTerm(term: string): string {
	return term
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Build the (small) client search index: every term plus its lexicon href. */
export function buildSearchIndex(terms: LexEntry[]): SearchEntry[] {
	return terms.map((t) => ({ ...t, href: `/lexicon/${slugifyTerm(t.term)}` }));
}

/** Bucket terms by uppercase first letter; digits and symbols fall under '#'. */
export function groupAlpha<T extends { term: string }>(terms: T[]): Record<string, T[]> {
	const groups: Record<string, T[]> = {};
	for (const t of terms) {
		const first = t.term.trim().charAt(0).toUpperCase();
		const key = /[A-Z]/.test(first) ? first : '#';
		(groups[key] ??= []).push(t);
	}
	for (const key of Object.keys(groups)) {
		groups[key].sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
	}
	return groups;
}
