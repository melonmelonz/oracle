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
			}
		})
	}
};

export default config;
