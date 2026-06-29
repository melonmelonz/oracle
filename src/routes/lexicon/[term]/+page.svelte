<script>
	import Sidenote from '$lib/components/Sidenote.svelte';
	let { data } = $props();
	const { entry, siblings } = $derived(data);
	const askHref = $derived(`/?q=${encodeURIComponent('what is ' + entry.term.toLowerCase() + '?')}`);
</script>

<svelte:head>
	<title>{entry.term} — lexicon — oracle</title>
</svelte:head>

<article class="wrap">
	<a class="crumb" href="/lexicon">&lsaquo; lexicon</a>

	<p class="dtag">{entry.domain}</p>
	<h1 class="term">{entry.term}</h1>

	<p class="def">
		{entry.def}<Sidenote
			>Defined in the <a class="linkline" href="/archive/{entry.slug}">{entry.topicTitle}</a> entry of the
			archive.</Sidenote
		>
	</p>

	<div class="actions">
		<a class="ask" href={askHref}>ask the oracle &rsaquo;</a>
		<a class="from" href="/archive/{entry.slug}">read {entry.topicTitle} &rsaquo;</a>
	</div>

	{#if siblings.length}
		<section class="siblings">
			<span class="kicker">alongside it</span>
			<div class="chips">
				{#each siblings as s}<a class="chip" href={s.href}>{s.term}</a>{/each}
			</div>
		</section>
	{/if}
</article>

<style>
	.term {
		font-family: var(--mono);
		font-size: clamp(1.5rem, 5vw, 2.2rem);
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--amber-bright);
		margin: 0.4rem 0 0;
		text-shadow: 0 0 1px currentColor;
	}
	.def {
		font-family: var(--sans);
		font-size: 1.15rem;
		line-height: 1.65;
		color: var(--paper);
		max-width: 56ch;
		margin: 1.2rem 0 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1.4rem;
		margin-top: 2rem;
		font-family: var(--mono);
		font-size: 0.85rem;
	}
	.ask {
		color: var(--amber-bright);
	}
	.ask:hover {
		text-shadow: 0 0 12px rgba(246, 205, 132, 0.5);
	}
	.from {
		color: var(--cool-bright);
	}
	.from:hover {
		text-shadow: 0 0 12px rgba(111, 166, 181, 0.5);
	}
	.siblings {
		margin-top: 2.8rem;
		padding-top: 1.4rem;
		border-top: 1px dotted var(--edge);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 0.8rem;
	}
</style>
