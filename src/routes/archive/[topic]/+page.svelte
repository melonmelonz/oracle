<script>
	let { data } = $props();
	const { topic, related, vocab } = $derived(data);

	// Render a section's plain text into paragraphs and simple bullet lists.
	/** @param {string} text */
	function blocks(text) {
		return text
			.split(/\n{2,}/)
			.map((b) => b.trim())
			.filter(Boolean)
			.map((b) => {
				const lines = b.split('\n');
				if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
					return { type: 'ul', items: lines.map((l) => l.replace(/^[-*]\s+/, '').trim()) };
				}
				return { type: 'p', text: b.replace(/\n/g, ' ') };
			});
	}

	const askHref = $derived(`/?q=${encodeURIComponent('what is ' + topic.title.toLowerCase() + '?')}`);
</script>

<svelte:head>
	<title>{topic.title} — oracle</title>
</svelte:head>

<article class="wrap">
	<a class="crumb" href="/archive">&lsaquo; archive</a>

	<p class="dtag">{topic.domain}</p>
	<h1 class="page-title">{topic.title}</h1>

	{#each topic.sections as s}
		<section class="sec">
			{#if s.section !== 'Overview'}<h2 class="sec-head">{s.section}</h2>{/if}
			<div class="prose">
				{#each blocks(s.text) as b}
					{#if b.type === 'ul'}
						<ul>
							{#each b.items as it}<li>{it}</li>{/each}
						</ul>
					{:else}
						<p>{b.text}</p>
					{/if}
				{/each}
			</div>
		</section>
	{/each}

	{#if vocab.length}
		<section class="aside">
			<h2 class="kicker">defines</h2>
			<div class="terms">
				{#each vocab as v}
					<a class="term" href={v.href}>
						<span class="term-name">{v.term}</span>
						<span class="term-def">{v.def}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if topic.manuals.length}
		<section class="aside">
			<h2 class="kicker">manuals</h2>
			<ul class="manuals">
				{#each topic.manuals as m}
					<li>
						<a class="linkline" href={m.url} target="_blank" rel="noopener noreferrer">
							{m.model}{#if m.title} &middot; {m.title}{/if}
						</a>
						{#if m.kind}<span class="m-kind">{m.kind}</span>{/if}
					</li>
				{/each}
			</ul>
			<p class="hint">opens on the Internet Archive. read them in the <a class="linkline" href="/manuals">manual shelf</a>.</p>
		</section>
	{/if}

	<section class="foot">
		<a class="ask" href={askHref}>ask the oracle about this &rsaquo;</a>
		{#if related.length}
			<div class="related">
				<span class="kicker">related</span>
				{#each related as r}<a class="chip" href="/archive/{r.slug}">{r.title}</a>{/each}
			</div>
		{/if}
		{#if topic.source}<p class="source">source/ {topic.source}</p>{/if}
	</section>
</article>

<style>
	.sec {
		margin-top: 1.8rem;
	}
	.sec-head {
		font-family: var(--mono);
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--amber);
		margin: 0 0 0.6rem;
	}
	.prose :global(ul) {
		margin: 0 0 1rem;
		padding-left: 1.1rem;
	}
	.prose :global(li) {
		margin: 0.2rem 0;
	}

	.aside {
		margin-top: 2.6rem;
		padding-top: 1.4rem;
		border-top: 1px dotted var(--edge);
	}
	.terms {
		display: grid;
		gap: 0.3rem;
		margin-top: 0.9rem;
	}
	.term {
		display: block;
		padding: 0.4rem 0.6rem;
		border-left: 2px solid var(--cool-deep);
		border-radius: 0 4px 4px 0;
		text-decoration: none;
		transition: border-color 0.16s, background 0.16s;
	}
	.term:hover {
		border-left-color: var(--cool);
		background: rgba(30, 45, 51, 0.1);
	}
	.term-name {
		font-family: var(--mono);
		font-size: 0.85rem;
		color: var(--cool-bright);
	}
	.term-def {
		display: block;
		font-family: var(--sans);
		font-size: 0.84rem;
		line-height: 1.5;
		color: var(--paper-dim);
		margin-top: 0.15rem;
	}

	.manuals {
		list-style: none;
		margin: 0.9rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.45rem;
	}
	.manuals li {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		font-family: var(--mono);
		font-size: 0.84rem;
	}
	.m-kind {
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.hint {
		font-family: var(--mono);
		font-size: 0.72rem;
		color: var(--text-faint);
		margin: 0.7rem 0 0;
	}

	.foot {
		margin-top: 2.8rem;
		padding-top: 1.4rem;
		border-top: 1px dotted var(--edge);
	}
	.ask {
		font-family: var(--mono);
		font-size: 0.85rem;
		color: var(--amber-bright);
	}
	.ask:hover {
		text-shadow: 0 0 12px rgba(246, 205, 132, 0.5);
	}
	.related {
		margin-top: 1.4rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.related .kicker {
		margin-right: 0.3rem;
	}
	.source {
		font-family: var(--mono);
		font-size: 0.68rem;
		color: var(--text-faint);
		margin: 1.4rem 0 0;
		line-height: 1.6;
	}
</style>
