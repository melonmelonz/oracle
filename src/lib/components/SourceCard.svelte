<script>
	/** @type {{ source: { n:number, doc:string, slug:string, section:string, score:number, text:string }, highlighted?: boolean, delay?: number }} */
	let { source, highlighted = false, delay = 0 } = $props();
	let open = $state(false);

	const score = $derived(source.score.toFixed(2));
</script>

<div class="row" class:highlighted id={`source-${source.n}`} style="animation-delay:{delay}ms">
	<button class="head" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="n">[{source.n}]</span>
		<span class="file">{source.slug}.md</span>
		<span class="sec">&rsaquo; {source.section}</span>
		<span class="dots"></span>
		<span class="score">{score}</span>
	</button>
	{#if open}
		<p class="body">{source.text}</p>
	{/if}
</div>

<style>
	.row {
		font-family: var(--mono);
		border-left: 2px solid transparent;
		padding-left: 0.6rem;
		margin-left: -0.6rem;
		transition: border-color 0.3s, background 0.3s;
		animation: rise 0.4s both;
	}
	.row.highlighted {
		border-left-color: var(--amber);
		background: rgba(217, 168, 94, 0.05);
	}

	.head {
		width: 100%;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.28rem 0;
		background: none;
		border: 0;
		cursor: pointer;
		text-align: left;
		color: inherit;
		font-family: var(--mono);
		font-size: 0.8rem;
	}
	.n {
		color: var(--amber);
		flex: 0 0 auto;
	}
	.file {
		color: var(--paper);
		flex: 0 0 auto;
		white-space: nowrap;
	}
	.head:hover .file {
		color: var(--amber-bright);
	}
	.sec {
		color: var(--amber-dim);
		flex: 0 1 auto;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dots {
		flex: 1 1 auto;
		min-width: 1rem;
		align-self: center;
		height: 0;
		border-bottom: 1px dotted var(--edge);
	}
	.score {
		color: var(--amber-dim);
		flex: 0 0 auto;
		font-variant-numeric: tabular-nums;
	}

	.body {
		margin: 0.1rem 0 0.5rem;
		padding-left: 1.6rem;
		font-size: 0.82rem;
		line-height: 1.6;
		color: var(--paper-dim);
		border-left: 1px solid var(--edge);
		animation: rise 0.25s both;
	}
</style>
