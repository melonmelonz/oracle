import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Emulate the Cloudflare platform (KV bindings) during `vite dev`.
			// Note: the AI binding only works against the real edge, so AI calls
			// during local dev require `wrangler pages dev --remote` instead.
			platformProxy: {
				configPath: 'wrangler.jsonc'
			},
			// Everything but the ask endpoint is prerendered to static assets, so
			// only /api/* needs to invoke the Pages Function. This keeps the
			// generated _routes.json well under Cloudflare's 100-rule limit.
			routes: {
				include: ['/api/*'],
				exclude: []
			}
		})
	}
};

export default config;
