<script>
	let { data } = $props();

	/** @type {string | null} */
	let openId = $state(null);
	/** @param {string | null} id */
	function toggle(id) {
		openId = openId === id ? null : id;
	}
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
					<li class="manual">
						<div class="row">
							<span class="model">{m.model}</span>
							<span class="title">{m.title}</span>
							{#if m.kind}<span class="kind">{m.kind}</span>{/if}
							<span class="dots"></span>
							{#if m.id}
								<button class="act" aria-expanded={openId === m.id} onclick={() => toggle(m.id)}>
									{openId === m.id ? 'close' : 'preview'}
								</button>
							{/if}
							<a class="act ext" href={m.url} target="_blank" rel="noopener noreferrer">source &nearr;</a>
						</div>
						{#if openId === m.id && m.id}
							<div class="viewer">
								<div class="viewer-cap">
									<span>{m.model} &middot; {m.title}</span>
									<span class="cap-right">
										<button
											class="fs"
											onclick={(e) =>
												/** @type {HTMLElement} */ (e.currentTarget).closest('.viewer')?.requestFullscreen?.()}
											>fullscreen &#x26F6;</button
										>
										<span class="src">archive.org/{m.id}</span>
									</span>
								</div>
								<iframe
									src={`https://archive.org/embed/${m.id}`}
									title={`${m.model} ${m.title}`}
									loading="lazy"
									allowfullscreen
								></iframe>
							</div>
						{/if}
					</li>
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
		margin: 0 0 1rem;
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
	.row {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.5rem 0.2rem;
		font-family: var(--mono);
		font-size: 0.84rem;
	}
	.model {
		color: var(--amber-bright);
		flex: 0 0 auto;
	}
	.title {
		color: var(--paper-dim);
		flex: 0 1 auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.kind {
		flex: 0 0 auto;
		font-size: 0.64rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.dots {
		flex: 1 1 auto;
		min-width: 1rem;
		align-self: center;
		height: 0;
		border-bottom: 1px dotted var(--edge);
	}
	.act {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 0.78rem;
		background: none;
		border: 0;
		cursor: pointer;
		color: var(--cool-bright);
		transition: text-shadow 0.16s, color 0.16s;
	}
	.act:hover {
		text-shadow: 0 0 10px rgba(111, 166, 181, 0.5);
	}
	.act.ext {
		color: var(--text-dim);
	}
	.act.ext:hover {
		color: var(--amber-bright);
		text-shadow: none;
	}

	.viewer {
		margin: 0.4rem 0 1rem;
		border: 1px solid var(--edge);
		border-radius: 4px;
		overflow: hidden;
		background: #000;
		animation: rise 0.3s both;
	}
	.viewer-cap {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding: 0.5rem 0.7rem;
		font-family: var(--mono);
		font-size: 0.7rem;
		color: var(--text-dim);
		border-bottom: 1px solid var(--edge-soft);
		background: var(--bg-2);
	}
	.viewer-cap .src {
		color: var(--text-faint);
	}
	.cap-right {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
	}
	.fs {
		background: none;
		border: 0;
		cursor: pointer;
		font-family: var(--mono);
		font-size: 0.7rem;
		color: var(--cool-bright);
	}
	.fs:hover {
		text-shadow: 0 0 10px rgba(111, 166, 181, 0.5);
	}
	.viewer iframe {
		display: block;
		width: 100%;
		height: min(70vh, 640px);
		border: 0;
	}
	/* When the panel is fullscreen, let the document fill the screen. */
	.viewer:fullscreen {
		display: flex;
		flex-direction: column;
		border: 0;
		border-radius: 0;
	}
	.viewer:fullscreen iframe {
		flex: 1 1 auto;
		height: auto;
	}
	.note {
		margin-top: 3rem;
		font-family: var(--mono);
		font-size: 0.68rem;
		color: var(--text-faint);
		line-height: 1.6;
	}
</style>
