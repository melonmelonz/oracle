<script>
	/**
	 * @type {{
	 *   trace: {
	 *     query: string,
	 *     tokens: string[],
	 *     gate: number,
	 *     fallback: boolean,
	 *     candidates: Array<{doc:string,slug:string,section:string,dense:number,lexical:number,rrf:number,rerank:number|null,passed:boolean}>
	 *   } | null
	 * }}
	 */
	let { trace = null } = $props();
	let open = $state(false);

	/** @param {number|null} v @param {number} d */
	const fmt = (v, d) => (v === null || v === undefined ? '--' : v.toFixed(d));
</script>

{#if trace}
	<div class="signal">
		<button class="toggle" onclick={() => (open = !open)} aria-expanded={open}>
			<span class="led" class:on={open}></span>
			underscan
			<span class="hint">{open ? 'hide the retrieval signal' : 'reveal the retrieval signal'}</span>
		</button>

		{#if open}
			<div class="readout">
				<div class="meta">
					<span class="lbl">query</span><span class="dots"></span><span class="val">{trace.query}</span>
				</div>
				<div class="meta">
					<span class="lbl">tokens</span><span class="dots"></span>
					<span class="val">
						{#each trace.tokens as t}<span class="tok">{t}</span>{/each}
						{#if trace.tokens.length === 0}<span class="muted">none</span>{/if}
					</span>
				</div>
				<div class="meta">
					<span class="lbl">gate</span><span class="dots"></span>
					<span class="val">rerank &ge; {trace.gate}{#if trace.fallback}<span class="muted"> &middot; reranker offline, dense fallback</span>{/if}</span>
				</div>

				<div class="grid" role="table" aria-label="retrieval candidates">
					<div class="hrow" role="row">
						<span class="c-pass" role="columnheader"></span>
						<span class="c-src" role="columnheader">passage</span>
						<span class="c-num" role="columnheader">dense</span>
						<span class="c-num" role="columnheader">bm25</span>
						<span class="c-num" role="columnheader">rrf</span>
						<span class="c-num c-rr" role="columnheader">rerank</span>
					</div>
					{#each trace.candidates as c}
						<div class="drow" class:passed={c.passed} role="row">
							<span class="c-pass" role="cell">{c.passed ? '▸' : ''}</span>
							<span class="c-src" role="cell" title={c.doc}>{c.slug}<span class="sec"> &rsaquo; {c.section}</span></span>
							<span class="c-num" role="cell">{fmt(c.dense, 3)}</span>
							<span class="c-num" role="cell">{fmt(c.lexical, 2)}</span>
							<span class="c-num" role="cell">{c.rrf}</span>
							<span class="c-num c-rr" role="cell">{fmt(c.rerank, 3)}</span>
						</div>
					{/each}
				</div>
				<p class="note">
					dense is cosine over embeddings; bm25 is the lexical score; rrf is the fused rank; rerank is the cross-encoder score that crosses the gate. the marked rows reached the answer.
				</p>
			</div>
		{/if}
	</div>
{/if}

<style>
	.signal {
		margin-top: 1.6rem;
		font-family: var(--mono);
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: 0;
		padding: 0.2rem 0;
		cursor: pointer;
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--cool-bright);
		transition: color 0.18s;
	}
	.toggle:hover {
		color: #fff;
	}
	.led {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--cool-deep);
		box-shadow: inset 0 0 0 1px var(--cool);
		transition: background 0.2s, box-shadow 0.2s;
	}
	.led.on {
		background: var(--cool-bright);
		box-shadow: 0 0 8px var(--cool-bright);
	}
	.hint {
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.72rem;
		color: var(--text-faint);
	}

	.readout {
		margin-top: 0.8rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--edge-soft);
		border-left: 2px solid var(--cool-deep);
		border-radius: 4px;
		background: rgba(30, 45, 51, 0.08);
		animation: rise 0.3s both;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.74rem;
		padding: 0.12rem 0;
	}
	.meta .lbl {
		color: var(--text-dim);
		flex: 0 0 auto;
	}
	.meta .dots {
		flex: 0 0 1.2rem;
		align-self: center;
		height: 0;
		border-bottom: 1px dotted var(--edge);
	}
	.meta .val {
		color: var(--paper);
		flex: 1 1 auto;
		word-break: break-word;
	}
	.tok {
		display: inline-block;
		margin-right: 0.4rem;
		color: var(--amber);
	}
	.muted {
		color: var(--text-faint);
	}

	.grid {
		margin-top: 0.7rem;
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
	}
	.hrow,
	.drow {
		display: grid;
		grid-template-columns: 1.1rem minmax(0, 1fr) 3.6rem 3.6rem 2.4rem 4rem;
		gap: 0.4rem;
		align-items: baseline;
		padding: 0.16rem 0;
	}
	.hrow {
		color: var(--text-faint);
		border-bottom: 1px dotted var(--edge);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.64rem;
	}
	.drow {
		color: var(--paper-dim);
		border-bottom: 1px solid rgba(42, 34, 18, 0.35);
	}
	.drow.passed {
		color: var(--paper);
	}
	.c-num {
		text-align: right;
	}
	.c-rr {
		color: var(--cool);
	}
	.drow.passed .c-rr {
		color: var(--cool-bright);
	}
	.c-pass {
		color: var(--cool-bright);
		text-align: center;
	}
	.c-src {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.c-src .sec {
		color: var(--text-faint);
	}

	.note {
		margin: 0.7rem 0 0;
		font-size: 0.66rem;
		line-height: 1.6;
		color: var(--text-faint);
	}
</style>
