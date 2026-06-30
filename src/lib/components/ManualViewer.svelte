<script>
	/**
	 * A single manual: a quiet row that expands into an in-page Internet Archive
	 * preview (never rehosted), with a fullscreen control. Used on the manual
	 * shelf and inline in the oracle's answers.
	 * @type {{ manual: { model?: string, title?: string, url: string, kind?: string } }}
	 */
	let { manual } = $props();
	let open = $state(false);

	// The archive.org item id, pulled from a /details/<id> url. Only items we can
	// frame get an inline preview; anything else falls back to a source link.
	const id = $derived((manual.url.match(/archive\.org\/details\/([^/?#]+)/) || [])[1] ?? null);
</script>

<div class="manual">
	<div class="row">
		<span class="model">{manual.model}</span>
		{#if manual.title}<span class="title">{manual.title}</span>{/if}
		{#if manual.kind}<span class="kind">{manual.kind}</span>{/if}
		<span class="dots"></span>
		{#if id}
			<button class="act" aria-expanded={open} onclick={() => (open = !open)}>
				{open ? 'close' : 'preview'}
			</button>
		{/if}
		<a class="act ext" href={manual.url} target="_blank" rel="noopener noreferrer">source &nearr;</a>
	</div>
	{#if open && id}
		<div class="viewer">
			<div class="viewer-cap">
				<span>{manual.model}{#if manual.title} &middot; {manual.title}{/if}</span>
				<span class="cap-right">
					<button
						class="fs"
						onclick={(e) =>
							/** @type {HTMLElement} */ (e.currentTarget).closest('.viewer')?.requestFullscreen?.()}
						>fullscreen &#x26F6;</button
					>
					<span class="src">archive.org/{id}</span>
				</span>
			</div>
			<iframe
				src={`https://archive.org/embed/${id}`}
				title={`${manual.model} ${manual.title ?? ''}`}
				loading="lazy"
				allowfullscreen
			></iframe>
		</div>
	{/if}
</div>

<style>
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
		margin: 0.2rem 0 0.8rem;
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
</style>
