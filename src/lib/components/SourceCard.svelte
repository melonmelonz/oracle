<script>
	/** @type {{ source: { n:number, doc:string, slug:string, section:string, score:number, text:string }, highlighted?: boolean, delay?: number }} */
	let { source, highlighted = false, delay = 0 } = $props();
	let open = $state(false);

	const resonance = $derived(Math.round(source.score * 100));
</script>

<article
	class="card"
	class:highlighted
	id={`source-${source.n}`}
	style="animation-delay:{delay}ms"
>
	<button class="head" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="n">{String(source.n).padStart(2, '0')}</span>
		<span class="meta">
			<span class="doc">{source.doc}</span>
			<span class="section">{source.section}</span>
		</span>
		<span class="resonance" title="semantic resonance with your question">
			<span class="bar" style="--r:{resonance}%"></span>
			<span class="pct">{resonance}</span>
		</span>
		<span class="chev" class:open>▾</span>
	</button>
	{#if open}
		<p class="body">{source.text}</p>
		<div class="tag">canon · {source.slug}.md</div>
	{/if}
</article>

<style>
	.card {
		border: 1px solid var(--edge-soft);
		border-radius: 12px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.022), rgba(0, 0, 0, 0.18));
		overflow: hidden;
		transition: border-color 0.35s, box-shadow 0.35s, transform 0.35s;
		animation: rise 0.5s both;
	}
	.card.highlighted {
		border-color: var(--violet);
		box-shadow: 0 0 0 1px rgba(139, 108, 255, 0.4), 0 0 34px rgba(139, 108, 255, 0.22);
		transform: translateX(2px);
	}

	.head {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 13px 16px;
		background: none;
		border: 0;
		cursor: pointer;
		text-align: left;
		color: inherit;
		font-family: var(--mono);
	}
	.head:hover .doc {
		color: var(--violet-bright);
	}

	.n {
		font-size: 12px;
		color: var(--violet);
		letter-spacing: 1px;
		flex: 0 0 auto;
	}

	.meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1 1 auto;
	}
	.doc {
		font-size: 13px;
		color: var(--vellum);
		font-weight: 500;
		transition: color 0.25s;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.section {
		font-size: 11px;
		color: var(--vellum-faint);
		text-transform: uppercase;
		letter-spacing: 1.4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.resonance {
		display: flex;
		align-items: center;
		gap: 7px;
		flex: 0 0 auto;
	}
	.bar {
		width: 46px;
		height: 3px;
		border-radius: 3px;
		background: var(--edge);
		position: relative;
		overflow: hidden;
	}
	.bar::after {
		content: '';
		position: absolute;
		inset: 0;
		width: var(--r);
		background: linear-gradient(90deg, var(--violet-deep), var(--violet-bright));
		border-radius: 3px;
	}
	.pct {
		font-size: 11px;
		color: var(--vellum-dim);
		width: 20px;
		text-align: right;
	}

	.chev {
		color: var(--vellum-faint);
		font-size: 11px;
		transition: transform 0.3s;
		flex: 0 0 auto;
	}
	.chev.open {
		transform: rotate(180deg);
		color: var(--violet);
	}

	.body {
		margin: 0;
		padding: 0 16px 14px 48px;
		font-family: var(--serif);
		font-size: 14.5px;
		line-height: 1.62;
		color: var(--vellum-dim);
		animation: rise 0.3s both;
	}
	.tag {
		padding: 0 16px 13px 48px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 1px;
		color: var(--vellum-faint);
		text-transform: uppercase;
	}
</style>
