<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { palette } from '$lib/palette.svelte.js';
	import { buildSearchIndex } from '$lib/lexicon';

	let query = $state('');
	let active = $state(0);
	let loaded = $state(false);
	/** @type {import('$lib/lexicon').SearchEntry[]} */
	let index = $state([]);
	/** @type {import('fuse.js').default<import('$lib/lexicon').SearchEntry> | null} */
	let fuse = $state(null);
	/** @type {HTMLInputElement | undefined} */
	let inputEl = $state();

	// Lazy: the lexicon data and Fuse load only the first time the palette opens.
	async function ensureLoaded() {
		if (loaded) return;
		const [{ default: Fuse }, lex] = await Promise.all([
			import('fuse.js'),
			import('$lib/lexicon.json')
		]);
		index = buildSearchIndex(/** @type {any} */ (lex.default));
		fuse = new Fuse(index, {
			keys: [
				{ name: 'term', weight: 2 },
				{ name: 'def', weight: 1 }
			],
			threshold: 0.34,
			ignoreLocation: true,
			minMatchCharLength: 2
		});
		loaded = true;
	}

	const results = $derived.by(() => {
		const q = query.trim();
		if (!loaded) return [];
		if (!q) return index.slice(0, 8);
		if (fuse) return fuse.search(q).slice(0, 12).map((r) => r.item);
		return [];
	});

	$effect(() => {
		// Reset selection as the result set changes.
		results;
		active = 0;
	});

	async function open() {
		palette.open = true;
		query = '';
		active = 0;
		await ensureLoaded();
		await tick();
		inputEl?.focus();
	}
	function close() {
		palette.open = false;
	}

	// External opens (the nav "search" trigger flips palette.open).
	$effect(() => {
		if (palette.open && !inputEl) {
			ensureLoaded().then(() => tick().then(() => inputEl?.focus()));
		}
	});

	/** @param {KeyboardEvent} e */
	function onkeydown(e) {
		const tag = /** @type {HTMLElement} */ (e.target)?.tagName;
		const typing = tag === 'INPUT' || tag === 'TEXTAREA';

		if (!palette.open) {
			if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
				e.preventDefault();
				open();
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = Math.min(active + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = Math.max(active - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const hit = results[active];
			if (hit) {
				close();
				goto(hit.href);
			}
		}
	}

	onMount(() => {
		window.addEventListener('keydown', onkeydown);
		return () => window.removeEventListener('keydown', onkeydown);
	});
</script>

{#if palette.open}
	<div
		class="scrim"
		onclick={(e) => e.currentTarget === e.target && close()}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="presentation"
	>
		<div class="palette" role="dialog" tabindex="-1" aria-label="Search the lexicon" aria-modal="true">
			<div class="bar">
				<span class="ps1">/</span>
				<input
					bind:this={inputEl}
					bind:value={query}
					placeholder="search the lexicon&hellip;"
					spellcheck="false"
					autocomplete="off"
					aria-label="Search the lexicon"
				/>
				<kbd>esc</kbd>
			</div>

			{#if !loaded}
				<div class="hint">loading the lexicon&hellip;</div>
			{:else if results.length}
				<ul class="rows">
					{#each results as r, i}
						<li>
							<a
								class="row"
								class:active={i === active}
								href={r.href}
								onmouseenter={() => (active = i)}
								onclick={() => close()}
							>
								<span class="r-term">{r.term}</span>
								<span class="r-domain">{r.domain}</span>
								<span class="r-def">{r.def}</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="hint">nothing matches &ldquo;{query}&rdquo;.</div>
			{/if}

			<div class="foot">
				<span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span>
				<span><kbd>&crarr;</kbd> open</span>
				<span class="muted">the lexicon &middot; {loaded ? index.length : ''} terms</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 14vh;
		background: rgba(7, 6, 4, 0.6);
		backdrop-filter: blur(2px);
		animation: fade 0.15s both;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.palette {
		width: min(34rem, calc(100vw - 2rem));
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-2);
		border: 1px solid var(--edge);
		border-radius: 8px;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.6);
		overflow: hidden;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.75rem 0.9rem;
		border-bottom: 1px solid var(--edge-soft);
	}
	.bar .ps1 {
		color: var(--amber);
		font-family: var(--mono);
	}
	.bar input {
		flex: 1 1 auto;
		min-width: 0;
		background: none;
		border: 0;
		outline: none;
		color: var(--paper);
		caret-color: var(--amber-bright);
		font-family: var(--mono);
		font-size: 0.92rem;
	}
	.bar input::placeholder {
		color: var(--amber-dim);
		opacity: 0.7;
	}
	kbd {
		font-family: var(--mono);
		font-size: 0.62rem;
		color: var(--text-faint);
		border: 1px solid var(--edge);
		border-radius: 3px;
		padding: 0.05rem 0.3rem;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0.4rem;
		overflow-y: auto;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, auto) auto;
		grid-template-areas: 'term domain' 'def def';
		gap: 0.1rem 0.6rem;
		padding: 0.45rem 0.6rem;
		border-radius: 5px;
		text-decoration: none;
	}
	.row.active {
		background: rgba(217, 168, 94, 0.08);
	}
	.r-term {
		grid-area: term;
		font-family: var(--mono);
		font-size: 0.88rem;
		color: var(--amber-bright);
	}
	.r-domain {
		grid-area: domain;
		justify-self: end;
		font-family: var(--mono);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.r-def {
		grid-area: def;
		font-family: var(--sans);
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--paper-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.hint {
		padding: 1.2rem;
		font-family: var(--mono);
		font-size: 0.84rem;
		color: var(--text-dim);
	}
	.foot {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.55rem 0.9rem;
		border-top: 1px solid var(--edge-soft);
		font-family: var(--mono);
		font-size: 0.66rem;
		color: var(--text-faint);
	}
	.foot .muted {
		margin-left: auto;
	}
</style>
