<script>
	/**
	 * @type {{
	 *   text?: string,
	 *   streaming?: boolean,
	 *   maxCite?: number,
	 *   onhovercite?: (n: number | null) => void
	 * }}
	 */
	let { text = '', streaming = false, maxCite = 0, onhovercite = () => {} } = $props();

	// Split the prose into plain runs and [n] citation tokens so each citation
	// can become an interactive chip. Re-runs as tokens stream in.
	const segments = $derived.by(() => {
		const out = [];
		const re = /\[(\d+)\]/g;
		let last = 0;
		let m;
		while ((m = re.exec(text)) !== null) {
			if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
			const n = Number(m[1]);
			out.push({ t: 'cite', v: n, valid: n >= 1 && n <= maxCite });
			last = m.index + m[0].length;
		}
		if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
		return out;
	});

	function scrollTo(n) {
		document.getElementById(`source-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
</script>

<div class="answer" class:streaming>
	{#each segments as seg}
		{#if seg.t === 'text'}<span>{seg.v}</span
			>{:else if seg.valid}<button
				class="cite"
				onmouseenter={() => onhovercite(seg.v)}
				onmouseleave={() => onhovercite(null)}
				onfocus={() => onhovercite(seg.v)}
				onblur={() => onhovercite(null)}
				onclick={() => scrollTo(seg.v)}>{seg.v}</button
			>{:else}<span class="cite-dead">[{seg.v}]</span>{/if}
	{/each}{#if streaming}<span class="caret"></span>{/if}
</div>

<style>
	.answer {
		font-family: var(--serif);
		font-size: 21px;
		line-height: 1.72;
		color: var(--vellum);
		letter-spacing: 0.1px;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.cite {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 19px;
		height: 19px;
		padding: 0 4px;
		margin: 0 2px;
		transform: translateY(-2px);
		font-family: var(--mono);
		font-size: 11px;
		font-weight: 600;
		color: var(--amber);
		background: rgba(233, 178, 74, 0.12);
		border: 1px solid rgba(233, 178, 74, 0.34);
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.2s;
		vertical-align: middle;
	}
	.cite:hover,
	.cite:focus-visible {
		background: var(--amber);
		color: #1a1206;
		border-color: #ffd98a;
		box-shadow: 0 0 16px rgba(233, 178, 74, 0.6);
		outline: none;
	}

	.cite-dead {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--vellum-faint);
	}

	.caret {
		display: inline-block;
		width: 9px;
		height: 1.1em;
		margin-left: 3px;
		transform: translateY(2px);
		background: var(--phosphor-bright);
		box-shadow: 0 0 12px var(--phosphor-bright);
		animation: blink 1s steps(2) infinite;
	}
	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}
</style>
