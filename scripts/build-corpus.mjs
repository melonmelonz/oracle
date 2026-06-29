// Build-time corpus chunker + archive indexer.
//
// Reads every markdown file in knowledge/ and emits four artifacts to src/lib/:
//   - corpus.json  : section-level chunks for the RAG retriever (one per `##`)
//   - archive.json : one entry per topic (sections, vocab, manuals, related) for browse
//   - lexicon.json : every vocab term with its source topic, for the queryable lexicon
//   - manuals.json : every referenced manual with its source topic, for the manual shelf
//
// Pure Node, no network, no AI. Embeddings are computed at runtime by /api/ask and
// cached in KV, so these JSONs carry only text + metadata. The pure functions are
// exported for unit tests; build() runs only when invoked as a script.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ── Frontmatter ───────────────────────────────────────────────────────────

/** Split a string on a delimiter, ignoring delimiters inside quotes. */
function splitTopLevel(s, delim) {
	const out = [];
	let cur = '';
	let quote = null;
	for (const ch of s) {
		if (quote) {
			if (ch === quote) quote = null;
			cur += ch;
		} else if (ch === '"' || ch === "'") {
			quote = ch;
			cur += ch;
		} else if (ch === delim) {
			out.push(cur);
			cur = '';
		} else {
			cur += ch;
		}
	}
	out.push(cur);
	return out;
}

/** Strip a single matched pair of surrounding quotes. */
function stripQuotes(v) {
	const t = v.trim();
	if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) {
		return t.slice(1, -1);
	}
	return t;
}

/** Parse an inline object body like `term: Foo, def: "a, b"` into {term, def}. */
function parseInlineObject(inner) {
	const obj = {};
	for (const part of splitTopLevel(inner, ',')) {
		const idx = part.indexOf(':');
		if (idx === -1) continue;
		const key = part.slice(0, idx).trim();
		if (!key) continue;
		obj[key] = stripQuotes(part.slice(idx + 1));
	}
	return obj;
}

/** Parse `[a, b, "c, d"]` into a string array. */
function parseInlineArray(inner) {
	return splitTopLevel(inner, ',')
		.map((s) => stripQuotes(s))
		.filter(Boolean);
}

/**
 * Parse the YAML-ish frontmatter we use. Supports scalars (title, domain,
 * source), inline arrays (tags, related), and block lists of inline objects
 * (vocab, manuals). Returns { meta, body }.
 */
export function parseFrontmatter(raw) {
	const meta = { title: null, domain: null, tags: [], vocab: [], manuals: [], links: [], related: [], source: null };
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { meta, body: raw };

	const body = raw.slice(match[0].length);
	const lines = match[1].split('\n');
	let listKey = null; // 'vocab' | 'manuals' while consuming a block list

	for (const line of lines) {
		if (!line.trim()) continue;

		// A block-list item: `  - { ... }` or `  - scalar`
		const item = line.match(/^\s+-\s+(.*)$/);
		if (item && listKey) {
			const objMatch = item[1].match(/^\{(.*)\}$/);
			if (objMatch) meta[listKey].push(parseInlineObject(objMatch[1]));
			else meta[listKey].push(stripQuotes(item[1]));
			continue;
		}

		// `key: [inline, array]`
		const arr = line.match(/^([A-Za-z_]+):\s*\[(.*)\]\s*$/);
		if (arr) {
			listKey = null;
			if (arr[1] === 'tags' || arr[1] === 'related') meta[arr[1]] = parseInlineArray(arr[2]);
			continue;
		}

		// `key:` with nothing after -> start of a block list
		const blockKey = line.match(/^([A-Za-z_]+):\s*$/);
		if (blockKey) {
			listKey = ['vocab', 'manuals', 'links'].includes(blockKey[1]) ? blockKey[1] : null;
			if (listKey && !Array.isArray(meta[listKey])) meta[listKey] = [];
			continue;
		}

		// `key: scalar`
		const scalar = line.match(/^([A-Za-z_]+):\s*(.+)$/);
		if (scalar) {
			listKey = null;
			const key = scalar[1];
			const val = stripQuotes(scalar[2]);
			if (key === 'title' || key === 'domain' || key === 'source') meta[key] = val;
			continue;
		}
	}

	return { meta, body };
}

// ── Chunking ────────────────────────────────────────────────────────────────

/** Split a doc body into { section, text } chunks on `##` headings. */
export function chunkBody(body) {
	const lines = body.split('\n');
	const chunks = [];
	let section = 'Overview';
	let buffer = [];

	const flush = () => {
		const text = buffer.join('\n').trim();
		if (text) chunks.push({ section, text });
		buffer = [];
	};

	for (const line of lines) {
		const h2 = line.match(/^##\s+(.+)$/);
		const h1 = line.match(/^#\s+(.+)$/);
		if (h2) {
			flush();
			section = h2[1].trim();
		} else if (h1) {
			continue; // top-level title duplicates frontmatter title
		} else {
			buffer.push(line);
		}
	}
	flush();
	return chunks;
}

// ── Artifacts ─────────────────────────────────────────────────────────────

/**
 * Build all four artifacts from a list of { file, raw } markdown sources.
 * Pure: no filesystem access, fully unit-testable.
 */
export function buildArtifacts(files) {
	const corpus = [];
	const archive = [];
	const lexicon = [];
	const manuals = [];
	const links = [];
	const seenTerms = new Set(); // lexicon dedupe, first wins
	let id = 0;

	for (const { file, raw } of files) {
		const { meta, body } = parseFrontmatter(raw);
		const slug = basename(file, '.md');
		const title = meta.title || slug;
		const domain = meta.domain || 'misc';
		const sections = chunkBody(body);

		for (const { section, text } of sections) {
			const embedText = `${title} — ${section}\n\n${text}`;
			corpus.push({ id: `c${id++}`, doc: title, slug, section, tags: meta.tags, text, embedText });
		}

		archive.push({
			slug,
			title,
			domain,
			tags: meta.tags,
			source: meta.source,
			related: meta.related,
			sections,
			vocab: meta.vocab,
			manuals: meta.manuals,
			links: meta.links
		});

		for (const v of meta.vocab) {
			if (!v || !v.term) continue;
			const key = v.term.toLowerCase();
			if (seenTerms.has(key)) continue;
			seenTerms.add(key);
			lexicon.push({ term: v.term, def: v.def || '', domain, slug, topicTitle: title });
		}

		for (const m of meta.manuals) {
			if (!m || !m.url) continue;
			manuals.push({ ...m, topic: slug, topicTitle: title, domain });
		}

		for (const l of meta.links) {
			if (!l || !l.url) continue;
			links.push({ ...l, topic: slug, topicTitle: title, domain });
		}
	}

	lexicon.sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
	// A slim topic map for the runtime endpoint (grounded follow-ups), so the
	// Worker does not import the full archive text.
	const topics = archive.map((a) => ({ slug: a.slug, title: a.title, domain: a.domain, related: a.related }));
	return { corpus, archive, lexicon, manuals, links, topics };
}

// ── Script entry ────────────────────────────────────────────────────────────

function build() {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const ROOT = join(__dirname, '..');
	const KNOWLEDGE_DIR = join(ROOT, 'knowledge');
	const OUT_DIR = join(ROOT, 'src', 'lib');

	const files = readdirSync(KNOWLEDGE_DIR)
		.filter((f) => f.endsWith('.md'))
		.sort()
		.map((file) => ({ file, raw: readFileSync(join(KNOWLEDGE_DIR, file), 'utf-8') }));

	const { corpus, archive, lexicon, manuals, links, topics } = buildArtifacts(files);

	mkdirSync(OUT_DIR, { recursive: true });
	writeFileSync(join(OUT_DIR, 'corpus.json'), JSON.stringify(corpus, null, '\t'));
	writeFileSync(join(OUT_DIR, 'archive.json'), JSON.stringify(archive, null, '\t'));
	writeFileSync(join(OUT_DIR, 'lexicon.json'), JSON.stringify(lexicon, null, '\t'));
	writeFileSync(join(OUT_DIR, 'manuals.json'), JSON.stringify(manuals, null, '\t'));
	writeFileSync(join(OUT_DIR, 'links.json'), JSON.stringify(links, null, '\t'));
	writeFileSync(join(OUT_DIR, 'topics.json'), JSON.stringify(topics, null, '\t'));

	console.log(
		`[corpus] ${corpus.length} chunks, ${archive.length} topics, ${lexicon.length} terms, ${manuals.length} manuals, ${links.length} links from ${files.length} docs`
	);
}

// Run only when invoked directly as a script, not when imported by tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	build();
}
