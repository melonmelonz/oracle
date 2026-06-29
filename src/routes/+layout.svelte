<script>
	import '../app.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '@fontsource/ibm-plex-mono/600.css';
	import '@fontsource/ibm-plex-sans/400.css';
	import '@fontsource/ibm-plex-sans/500.css';
	import '@fontsource/ibm-plex-sans/600.css';
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'ask' },
		{ href: '/archive', label: 'archive' },
		{ href: '/lexicon', label: 'lexicon' },
		{ href: '/manuals', label: 'manuals' }
	];

	const path = $derived(page.url.pathname);
	/** @param {string} href */
	function current(href) {
		return href === '/' ? path === '/' : path.startsWith(href);
	}
</script>

<div class="bezel">
	<div class="screen">
		<nav class="topnav">
			<a class="brand" href="/">oracle</a>
			<span class="spacer"></span>
			{#each nav as n}
				<a class="navlink" href={n.href} aria-current={current(n.href) ? 'page' : undefined}>{n.label}</a>
			{/each}
		</nav>
		{@render children()}
	</div>
</div>

<style>
	.topnav {
		position: relative;
		z-index: 2;
		max-width: var(--maxw);
		margin: 0 auto;
		padding: 1.05rem 1.3rem 0;
		display: flex;
		align-items: baseline;
		gap: 1.15rem;
		font-family: var(--mono);
		font-size: 0.76rem;
		letter-spacing: 0.04em;
	}
	.brand {
		color: var(--amber-bright);
		letter-spacing: 0.18em;
		text-decoration: none;
		text-shadow: 0 0 1px currentColor;
	}
	.spacer {
		flex: 1 1 auto;
	}
	.navlink {
		color: var(--text-dim);
		text-decoration: none;
		transition: color 0.18s;
	}
	.navlink:hover,
	.navlink[aria-current='page'] {
		color: var(--amber-bright);
	}
</style>
