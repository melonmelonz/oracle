import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// three.js is only ever imported client-side (dynamic import in Monitor3D), but
	// keep it out of SSR externalization so a stray server import never breaks.
	ssr: {
		noExternal: ['three']
	}
});
