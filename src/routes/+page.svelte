<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import AsciiPortrait from '$lib/components/AsciiPortrait.svelte';
	import Answer from '$lib/components/Answer.svelte';
	import SourceCard from '$lib/components/SourceCard.svelte';
	import SignalPath from '$lib/components/SignalPath.svelte';

	let question = $state('');
	let asked = $state('');
	let status = $state(/** @type {'idle' | 'divining' | 'answering' | 'spent' | 'error'} */ ('idle'));
	let answer = $state('');
	/** @type {Array<{n:number,doc:string,slug:string,section:string,score:number,text:string}>} */
	let sources = $state([]);
	/** @type {{query:string,tokens:string[],gate:number,fallback:boolean,candidates:Array<{doc:string,slug:string,section:string,dense:number,lexical:number,rrf:number,rerank:number|null,passed:boolean}>} | null} */
	let trace = $state(null);
	/** @type {string[]} */
	let followups = $state([]);
	let errorMsg = $state('');
	/** @type {number | null} */
	let hoveredCite = $state(null);

	const busy = $derived(status === 'divining' || status === 'answering');
	const screenState = $derived(busy ? 'divining' : status === 'spent' ? 'spent' : 'idle');

	const SUGGESTIONS = [
		'what are you?',
		'what is a pvm, and why do people want one?',
		'what is stale reference manipulation?',
		'explain the four spi modes',
		'why put rust in the linux kernel?',
		"how is majora's mask broken in a speedrun?"
	];

	async function ask() {
		const q = question.trim();
		if (!q || busy) return;

		asked = q;
		status = 'divining';
		answer = '';
		sources = [];
		trace = null;
		followups = [];
		errorMsg = '';
		hoveredCite = null;

		let res;
		try {
			res = await fetch('/api/ask', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ question: q })
			});
		} catch {
			errorMsg = 'connection dropped. try again.';
			status = 'error';
			return;
		}

		if (!res.ok || !res.body) {
			const e = await res.json().catch(() => ({ error: 'no answer came back.' }));
			errorMsg = e.error ?? 'no answer came back.';
			status = 'error';
			return;
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let nl;
			while ((nl = buffer.indexOf('\n')) !== -1) {
				const ln = buffer.slice(0, nl).trim();
				buffer = buffer.slice(nl + 1);
				if (!ln) continue;
				let msg;
				try {
					msg = JSON.parse(ln);
				} catch {
					continue;
				}
				if (msg.type === 'sources') {
					sources = msg.sources;
					if (status === 'divining') status = 'answering';
				} else if (msg.type === 'trace') {
					trace = msg;
				} else if (msg.type === 'token') {
					if (status === 'divining') status = 'answering';
					answer += msg.text;
				} else if (msg.type === 'error') {
					errorMsg = msg.message ?? 'something went wrong.';
					status = 'error';
				} else if (msg.type === 'done') {
					followups = msg.followups ?? [];
					status = 'spent';
				}
			}
		}
		if (status === 'answering' || status === 'divining') status = 'spent';
	}

	/** @param {string} q */
	function askWith(q) {
		question = q;
		ask();
	}

	/** @param {HTMLInputElement} node */
	function autofocus(node) {
		node.focus();
	}

	onMount(() => {
		const q = page.url.searchParams.get('q');
		if (q) askWith(q);
	});
</script>

<svelte:head>
	<title>oracle — an archive</title>
</svelte:head>

<main>
	<section class="hero" class:compact={status !== 'idle'}>
		<AsciiPortrait state={screenState} />

		<div class="id">
			<span class="name">oracle</span>
			<span class="ver">v2</span>
		</div>
		<p class="tagline"># a reference archive. it answers only from what is written.</p>

		<form class="prompt" onsubmit={(e) => (e.preventDefault(), ask())}>
			<span class="ps1">oracle:~$</span>
			<input
				use:autofocus
				bind:value={question}
				placeholder="ask&hellip;"
				spellcheck="false"
				autocomplete="off"
				maxlength="500"
				aria-label="Your question"
			/>
			<button class="run" type="submit" disabled={busy}>{busy ? '[…]' : '[run]'}</button>
		</form>

		{#if status === 'idle'}
			<div class="suggest">
				{#each SUGGESTIONS as q, i}
					<button class="sug" style="animation-delay:{100 + i * 60}ms" onclick={() => askWith(q)}>
						<span class="caret">&rsaquo;</span> {q}
					</button>
				{/each}
			</div>
		{/if}
	</section>

	{#if errorMsg}
		<div class="error"># {errorMsg}</div>
	{/if}

	{#if busy || answer || sources.length}
		<section class="response">
			{#if asked}
				<div class="echo"><span class="ps1">oracle:~$</span> <span class="cmd">{asked}</span></div>
			{/if}

			<div class="out">
				{#if status === 'divining'}
					<span class="working">reading the archive<span class="blink">_</span></span>
				{:else}
					<Answer
						text={answer}
						streaming={status === 'answering'}
						maxCite={sources.length}
						onhovercite={(n) => (hoveredCite = n)}
					/>
				{/if}
			</div>

			{#if sources.length}
				<div class="refs">
					<div class="refs-head">refs/ &middot; {sources.length} matched</div>
					<div class="ref-list">
						{#each sources as s, i (s.n)}
							<SourceCard source={s} highlighted={hoveredCite === s.n} delay={i * 50} />
						{/each}
					</div>
				</div>
			{/if}

			<SignalPath {trace} />

			{#if status === 'spent' && followups.length}
				<div class="followups">
					<div class="fu-head">threads/</div>
					{#each followups as q}
						<button class="sug" onclick={() => askWith(q)}>
							<span class="caret">&rsaquo;</span> {q}
						</button>
					{/each}
				</div>
			{/if}
		</section>
	{/if}

	<footer># grounded retrieval &middot; hybrid search + cross-encoder rerank &middot; cloudflare workers ai</footer>
</main>

<style>
	main {
		position: relative;
		z-index: 1;
		max-width: var(--maxw);
		margin: 0 auto;
		padding: clamp(1.4rem, 4vh, 3rem) 1.3rem 5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		width: 100%;
	}

	.id {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 1.3rem;
		animation: rise 0.7s both 0.05s;
	}
	.name {
		font-size: clamp(1.6rem, 5vw, 2.3rem);
		font-weight: 600;
		letter-spacing: 0.42em;
		padding-left: 0.42em;
		color: var(--amber-bright);
		text-shadow: 0 0 18px rgba(246, 205, 132, 0.3);
	}
	.ver {
		font-size: 0.7rem;
		color: var(--amber-dim);
		letter-spacing: 0.1em;
	}

	.tagline {
		font-size: clamp(0.8rem, 2.1vw, 0.92rem);
		color: var(--amber-dim);
		margin: 0.7rem 0 0;
		animation: rise 0.7s both 0.12s;
	}

	.prompt {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		max-width: 36rem;
		margin-top: 1.7rem;
		padding: 0.7rem 0.8rem;
		background: var(--bg-2);
		border: 1px solid var(--edge);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2), 0 12px 36px rgba(0, 0, 0, 0.4);
		transition: border-color 0.25s, box-shadow 0.25s;
		animation: rise 0.7s both 0.2s;
	}
	.prompt:focus-within {
		border-color: var(--amber-dim);
		box-shadow: 0 0 0 1px rgba(217, 168, 94, 0.25), 0 12px 40px rgba(217, 168, 94, 0.1);
	}
	.ps1 {
		color: var(--amber);
		flex: 0 0 auto;
		font-size: 0.92rem;
		user-select: none;
	}
	.prompt input {
		flex: 1 1 auto;
		min-width: 0;
		background: none;
		border: 0;
		outline: none;
		color: var(--paper);
		caret-color: var(--amber-bright);
		font-family: var(--mono);
		font-size: 0.92rem;
	}
	.prompt input::placeholder {
		color: var(--amber-dim);
		opacity: 0.7;
	}
	.run {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 0.82rem;
		color: var(--amber-bright);
		background: none;
		border: 0;
		cursor: pointer;
		letter-spacing: 0.04em;
		transition: text-shadow 0.2s, opacity 0.2s;
	}
	.run:hover:not(:disabled) {
		text-shadow: 0 0 12px rgba(246, 205, 132, 0.6);
	}
	.run:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.suggest {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
		margin-top: 1.4rem;
		width: 100%;
		max-width: 36rem;
	}
	.sug {
		font-family: var(--mono);
		font-size: 0.82rem;
		color: var(--paper-dim);
		background: none;
		border: 0;
		padding: 0.2rem 0;
		cursor: pointer;
		text-align: left;
		transition: color 0.18s;
		animation: rise 0.6s both;
	}
	.sug .caret {
		color: var(--amber-dim);
	}
	.sug:hover {
		color: var(--amber-bright);
	}
	.sug:hover .caret {
		color: var(--amber-bright);
	}

	.error {
		margin-top: 2rem;
		font-size: 0.85rem;
		color: #e6915a;
		max-width: 36rem;
		width: 100%;
	}

	.response {
		width: 100%;
		margin-top: 2.6rem;
		animation: rise 0.5s both;
	}

	.echo {
		font-size: 0.86rem;
		color: var(--amber-dim);
		margin-bottom: 1.1rem;
		word-break: break-word;
	}
	.echo .cmd {
		color: var(--paper);
	}

	.out {
		min-height: 1.5em;
	}
	.working {
		font-size: 0.92rem;
		color: var(--amber);
	}
	.blink {
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

	.refs {
		margin-top: 2.4rem;
	}
	.refs-head {
		font-size: 0.71rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--amber-dim);
		margin-bottom: 0.8rem;
	}
	.ref-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.followups {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
	}
	.fu-head {
		font-size: 0.71rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--amber-dim);
		margin-bottom: 0.5rem;
	}

	footer {
		margin-top: 4rem;
		font-size: 0.67rem;
		letter-spacing: 0.04em;
		color: var(--amber-dim);
		text-align: center;
		max-width: 36rem;
		line-height: 1.7;
		opacity: 0.7;
	}

	@media (max-width: 560px) {
		.name {
			letter-spacing: 0.3em;
		}
	}
</style>
