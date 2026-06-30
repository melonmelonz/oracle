<script>
	import ManualViewer from '$lib/components/ManualViewer.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>manuals — oracle</title>
</svelte:head>

<div class="wrap">
	<p class="kicker">the manual shelf</p>
	<h1 class="page-title">{data.count} service documents</h1>
	<p class="lede">
		Operation and service manuals for the broadcast monitors in the archive. These are not rehosted;
		each one is a citable source document held by the Internet Archive. Preview one here, or open it
		at the source.
	</p>

	{#each data.groups as g}
		<section class="topic">
			<h2 class="topic-head">{g.topicTitle}</h2>
			<ul class="shelf">
				{#each g.items as m}
					<li><ManualViewer manual={m} /></li>
				{/each}
			</ul>
		</section>
	{/each}

	<p class="note">
		# documents served by the Internet Archive. nothing is rehosted here; the shelf only points to
		the source.
	</p>
</div>

<style>
	.topic {
		margin-top: 2.4rem;
	}
	.topic-head {
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--amber);
		margin: 0 0 0.6rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px dotted var(--edge);
	}
	.shelf {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.2rem;
	}
	.note {
		margin-top: 3rem;
		font-family: var(--mono);
		font-size: 0.68rem;
		color: var(--text-faint);
		line-height: 1.6;
	}
</style>
