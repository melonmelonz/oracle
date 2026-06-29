<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>archive — oracle</title>
</svelte:head>

<div class="wrap">
	<p class="kicker">the archive</p>
	<h1 class="page-title">what is written</h1>
	<p class="lede">
		{data.count} subjects, held closely. Read them here, or ask the oracle and it will answer from
		these same pages and nothing else.
	</p>

	{#each data.groups as g}
		<section class="domain">
			<h2 class="domain-head">{g.label}</h2>
			<ul class="topics">
				{#each g.topics as t}
					<li>
						<a class="topic" href="/archive/{t.slug}">
							<span class="t-title">{t.title}</span>
							<span class="t-blurb">{t.blurb}</span>
							<span class="t-meta">
								{#if t.vocab}{t.vocab} terms{/if}{#if t.vocab && t.manuals} &middot; {/if}{#if t.manuals}{t.manuals} manuals{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.domain {
		margin-top: 2.6rem;
	}
	.domain-head {
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--amber);
		margin: 0 0 1rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px dotted var(--edge);
	}
	.topics {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
	}
	.topic {
		display: block;
		padding: 0.7rem 0.85rem;
		border: 1px solid var(--edge-soft);
		border-radius: 4px;
		text-decoration: none;
		transition: border-color 0.18s, background 0.18s, transform 0.18s;
	}
	.topic:hover {
		border-color: var(--amber-dim);
		background: rgba(217, 168, 94, 0.04);
	}
	.t-title {
		display: block;
		font-family: var(--mono);
		font-size: 0.96rem;
		font-weight: 500;
		color: var(--amber-bright);
	}
	.t-blurb {
		display: block;
		font-family: var(--sans);
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--paper-dim);
		margin-top: 0.3rem;
	}
	.t-meta {
		display: block;
		font-family: var(--mono);
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		margin-top: 0.4rem;
	}
</style>
