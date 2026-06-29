<script>
	import { onMount } from 'svelte';

	let { data } = $props();

	let query = $state('');
	/** @type {string | null} */
	let domain = $state(null);
	/** @type {import('fuse.js').default<import('$lib/lexicon').SearchEntry> | null} */
	let fuse = $state(null);

	onMount(async () => {
		const Fuse = (await import('fuse.js')).default;
		fuse = new Fuse(data.index, {
			keys: [
				{ name: 'term', weight: 2 },
				{ name: 'def', weight: 1 }
			],
			threshold: 0.34,
			ignoreLocation: true,
			minMatchCharLength: 2
		});
	});

	function inDomain(/** @type {{domain:string}} */ e) {
		return !domain || e.domain === domain;
	}

	// When searching, a flat ranked list; otherwise the A-Z groups. Domain facet
	// filters both. Falls back to substring match until Fuse has loaded.
	const results = $derived.by(() => {
		const q = query.trim();
		if (!q) return null;
		let hits;
		if (fuse) hits = fuse.search(q).map((r) => r.item);
		else {
			const lq = q.toLowerCase();
			hits = data.index.filter((e) => e.term.toLowerCase().includes(lq) || e.def.toLowerCase().includes(lq));
		}
		return hits.filter(inDomain);
	});

	const visibleLetters = $derived(
		data.letters.filter((l) => data.groups[l].some(inDomain))
	);
</script>

<svelte:head>
	<title>lexicon — oracle</title>
</svelte:head>

<div class="wrap">
	<p class="kicker">the lexicon</p>
	<h1 class="page-title">{data.count} terms</h1>
	<p class="lede">
		The working vocabulary of the archive: the bus signals, the glitches, the tube parts, the
		retrieval words. Search it, or browse by letter.
	</p>

	<div class="search">
		<span class="ps1">/</span>
		<input
			bind:value={query}
			placeholder="search the lexicon&hellip;"
			spellcheck="false"
			autocomplete="off"
			aria-label="Search the lexicon"
		/>
		{#if query}<button class="clear" onclick={() => (query = '')} aria-label="clear">&times;</button>{/if}
	</div>

	<div class="facets">
		<button class="chip" data-active={domain === null} onclick={() => (domain = null)}>all</button>
		{#each data.domains as d}
			<button class="chip" data-active={domain === d} onclick={() => (domain = domain === d ? null : d)}>{d}</button>
		{/each}
	</div>

	{#if results !== null}
		{#if results.length}
			<ul class="hits">
				{#each results as e}
					<li>
						<a class="hit" href={e.href}>
							<span class="h-term">{e.term}</span>
							<span class="h-domain">{e.domain}</span>
							<span class="h-def">{e.def}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">nothing in the lexicon matches &ldquo;{query}&rdquo;.</p>
		{/if}
	{:else}
		{#each visibleLetters as letter}
			<section class="alpha">
				<h2 class="letter" id={`L${letter}`}>{letter}</h2>
				<ul class="hits">
					{#each data.groups[letter].filter(inDomain) as e}
						<li>
							<a class="hit" href={e.href}>
								<span class="h-term">{e.term}</span>
								<span class="h-domain">{e.domain}</span>
								<span class="h-def">{e.def}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</div>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		max-width: 34rem;
		margin-top: 1.8rem;
		padding: 0.65rem 0.8rem;
		background: var(--bg-2);
		border: 1px solid var(--edge);
		border-radius: 6px;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.search:focus-within {
		border-color: var(--amber-dim);
		box-shadow: 0 0 0 1px rgba(217, 168, 94, 0.2);
	}
	.search .ps1 {
		color: var(--amber);
		font-family: var(--mono);
	}
	.search input {
		flex: 1 1 auto;
		min-width: 0;
		background: none;
		border: 0;
		outline: none;
		color: var(--paper);
		caret-color: var(--amber-bright);
		font-family: var(--mono);
		font-size: 0.9rem;
	}
	.search input::placeholder {
		color: var(--amber-dim);
		opacity: 0.7;
	}
	.clear {
		background: none;
		border: 0;
		color: var(--text-dim);
		cursor: pointer;
		font-size: 1.1rem;
		line-height: 1;
	}
	.clear:hover {
		color: var(--amber-bright);
	}

	.facets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 1rem;
	}

	.alpha {
		margin-top: 2rem;
	}
	.letter {
		font-family: var(--mono);
		font-size: 0.82rem;
		color: var(--amber);
		margin: 0 0 0.6rem;
		padding-bottom: 0.3rem;
		border-bottom: 1px dotted var(--edge);
	}
	.hits {
		list-style: none;
		margin: 0.9rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.2rem;
	}
	.hit {
		display: grid;
		grid-template-columns: minmax(0, auto) auto;
		grid-template-areas: 'term domain' 'def def';
		gap: 0.1rem 0.6rem;
		align-items: baseline;
		padding: 0.45rem 0.6rem;
		border-radius: 4px;
		text-decoration: none;
		transition: background 0.16s;
	}
	.hit:hover {
		background: rgba(217, 168, 94, 0.05);
	}
	.h-term {
		grid-area: term;
		font-family: var(--mono);
		font-size: 0.9rem;
		color: var(--amber-bright);
	}
	.h-domain {
		grid-area: domain;
		justify-self: end;
		font-family: var(--mono);
		font-size: 0.64rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.h-def {
		grid-area: def;
		font-family: var(--sans);
		font-size: 0.86rem;
		line-height: 1.5;
		color: var(--paper-dim);
	}
	.empty {
		margin-top: 1.6rem;
		font-family: var(--mono);
		font-size: 0.86rem;
		color: var(--text-dim);
	}
</style>
