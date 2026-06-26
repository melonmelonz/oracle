// Build-time corpus chunker.
//
// Reads every markdown file in knowledge/, splits each into section-level
// chunks (one per `##` heading), and writes src/lib/corpus.json. This step is
// pure Node — no network, no AI — so it is deterministic and runs anywhere.
// Embeddings are computed later, at runtime, by the /api/ask endpoint and
// cached in KV. The corpus JSON therefore carries only text + metadata.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const KNOWLEDGE_DIR = join(ROOT, 'knowledge');
const OUT_FILE = join(ROOT, 'src', 'lib', 'corpus.json');

/** Parse a minimal YAML frontmatter block (title + tags only). */
function parseFrontmatter(raw) {
	const meta = { title: null, tags: [] };
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	let body = raw;
	if (match) {
		body = raw.slice(match[0].length);
		for (const line of match[1].split('\n')) {
			const t = line.match(/^title:\s*(.+)$/);
			if (t) meta.title = t[1].trim();
			const g = line.match(/^tags:\s*\[(.*)\]$/);
			if (g) meta.tags = g[1].split(',').map((s) => s.trim()).filter(Boolean);
		}
	}
	return { meta, body };
}

/** Split a doc body into { section, text } chunks on `##` headings. */
function chunkBody(body) {
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
			// top-level title line — skip, it duplicates frontmatter title
			continue;
		} else {
			buffer.push(line);
		}
	}
	flush();
	return chunks;
}

function build() {
	const files = readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md')).sort();
	const corpus = [];
	let id = 0;

	for (const file of files) {
		const raw = readFileSync(join(KNOWLEDGE_DIR, file), 'utf-8');
		const { meta, body } = parseFrontmatter(raw);
		const docTitle = meta.title || basename(file, '.md');
		const slug = basename(file, '.md');

		for (const { section, text } of chunkBody(body)) {
			// Prepend doc + section context so the embedding captures *what*
			// this passage is about, not just its bare words.
			const embedText = `${docTitle} — ${section}\n\n${text}`;
			corpus.push({
				id: `c${id++}`,
				doc: docTitle,
				slug,
				section,
				tags: meta.tags,
				text,
				embedText
			});
		}
	}

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(OUT_FILE, JSON.stringify(corpus, null, '\t'));
	console.log(`[corpus] ${corpus.length} chunks from ${files.length} docs -> src/lib/corpus.json`);
}

build();
