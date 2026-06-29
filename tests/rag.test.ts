import { test, expect } from 'vitest';
import { SYSTEM_PROMPT, EMBED_VERSION, buildMessages } from '../src/lib/rag';

test('system prompt is de-personalized: archivist of subjects, not Penn', () => {
	expect(SYSTEM_PROMPT).not.toMatch(/Penn/i);
	expect(SYSTEM_PROMPT).not.toMatch(/portfolio|resume|the work\b/i);
	expect(SYSTEM_PROMPT).toMatch(/archive|archivist/i);
	// keep the hard voice rule
	expect(SYSTEM_PROMPT.toLowerCase()).toContain('em dash');
});

test('embed version bumped to v2 to invalidate the KV cache', () => {
	expect(EMBED_VERSION).toBe('v2');
});

test('buildMessages numbers and bounds citations to the passage count', () => {
	const msgs = buildMessages('q?', [
		{ id: 'c0', doc: 'D', slug: 'd', section: 'S', tags: [], text: 'T', embedText: '', score: 1 }
	]);
	expect(msgs).toHaveLength(2);
	expect(msgs[1].content).toMatch(/\[1\]/);
	expect(msgs[1].content).toMatch(/1 to 1/);
});
