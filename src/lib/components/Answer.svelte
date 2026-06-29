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

	/** @param {number} n */
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
		font-family: var(--mono);
		font-size: 15.5px;
		line-height: 1.78;
		color: var(--paper);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.cite {
		display: inline;
		padding: 0 2px;
		font-family: var(--mono);
		font-size: 0.86em;
		font-weight: 600;
		/* the cool calibration accent: citations are the "grounded / sourced" marks */
		color: var(--cool-bright);
		background: none;
		border: 0;
		cursor: pointer;
		transition: text-shadow 0.18s, color 0.18s;
		vertical-align: baseline;
	}
	.cite:hover,
	.cite:focus-visible {
		color: #fff;
		text-shadow: 0 0 12px rgba(111, 166, 181, 0.85);
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
