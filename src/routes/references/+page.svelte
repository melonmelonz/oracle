<script lang="ts">
	let { data } = $props();

	let kind = $state('all');
	const groups = $derived(
		data.groups
			.map((g) => ({
				...g,
				items: kind === 'all' ? g.items : g.items.filter((ref) => ref.kind === kind)
			}))
			.filter((g) => g.items.length)
	);
</script>

<svelte:head>
	<title>references - oracle</title>
</svelte:head>

<div class="wrap">
	<p class="kicker">references</p>
	<h1 class="page-title">{data.count} external links</h1>
	<p class="lede">
		Maps, route hubs, datasheets, source trees, official docs, and reference pages. Manuals stay on
		the manual shelf; everything else lives here.
	</p>

	<div class="facets">
		<button class="chip" data-active={kind === 'all'} onclick={() => (kind = 'all')}>all</button>
		{#each data.kinds as k}
			<button class="chip" data-active={kind === k} onclick={() => (kind = kind === k ? 'all' : k)}>{k}</button>
		{/each}
	</div>

	{#if groups.length}
		{#each groups as g}
			<section class="topic">
				<h2 class="topic-head">
					<a class="linkline" href="/archive/{g.topic}">{g.topicTitle}</a>
					<span>{g.domain}</span>
				</h2>
				<ul class="refs">
					{#each g.items as ref}
						<li>
							<a class="ref" href={ref.url} target="_blank" rel="noopener noreferrer">
								<span class="title">{ref.title}</span>
								<span class="kind">{ref.kind}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{:else}
		<p class="empty"># no references match this filter.</p>
	{/if}
</div>

<style>
	.facets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 1.2rem;
	}
	.topic {
		margin-top: 2.4rem;
	}
	.topic-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin: 0 0 0.85rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px dotted var(--edge);
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.refs {
		list-style: none;
		display: grid;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
	}
	.ref {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.45rem 0.2rem;
		font-family: var(--mono);
		text-decoration: none;
	}
	.title {
		color: var(--paper);
		text-decoration: underline;
		text-decoration-color: var(--edge);
		text-underline-offset: 2px;
	}
	.ref:hover .title {
		color: var(--amber-bright);
		text-decoration-color: var(--amber-dim);
	}
	.kind {
		margin-left: auto;
		font-size: 0.64rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.empty {
		margin-top: 2rem;
		font-family: var(--mono);
		font-size: 0.86rem;
		color: var(--text-dim);
	}
</style>
