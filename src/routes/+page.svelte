<script>
	import Orb from '$lib/components/Orb.svelte';
	import Answer from '$lib/components/Answer.svelte';
	import SourceCard from '$lib/components/SourceCard.svelte';

	let question = $state('');
	/** @type {'idle' | 'divining' | 'answering' | 'spent' | 'error'} */
	let status = $state('idle');
	let answer = $state('');
	/** @type {Array<{n:number,doc:string,slug:string,section:string,score:number,text:string}>} */
	let sources = $state([]);
	let errorMsg = $state('');
	/** @type {number | null} */
	let hoveredCite = $state(null);

	const busy = $derived(status === 'divining' || status === 'answering');
	const orbState = $derived(busy ? 'divining' : status === 'spent' ? 'spent' : 'idle');

	const INCANTATIONS = [
		'What is the Goolz hegemony?',
		'How does the Playing With Goolz enemy AI behave?',
		'Why is the BeaglePlay wifi broken?',
		'What cooling does the point-cloud server use?',
		'What is MUTE about?'
	];

	async function ask() {
		const q = question.trim();
		if (!q || busy) return;

		status = 'divining';
		answer = '';
		sources = [];
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
			errorMsg = 'The oracle could not be reached.';
			status = 'error';
			return;
		}

		if (!res.ok || !res.body) {
			const e = await res.json().catch(() => ({ error: 'The oracle is silent.' }));
			errorMsg = e.error ?? 'The oracle is silent.';
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
				} else if (msg.type === 'token') {
					if (status === 'divining') status = 'answering';
					answer += msg.text;
				} else if (msg.type === 'error') {
					errorMsg = msg.message ?? 'The oracle faltered.';
					status = 'error';
				} else if (msg.type === 'done') {
					status = 'spent';
				}
			}
		}
		if (status === 'answering' || status === 'divining') status = 'spent';
	}

	function askWith(q) {
		question = q;
		ask();
	}
</script>

<svelte:head>
	<title>ORACLE — the archive of Penn's universe</title>
</svelte:head>

<main>
	<section class="hero" class:compact={status !== 'idle'}>
		<div class="orb-slot">
			<Orb state={orbState} size={status === 'idle' ? 138 : 96} />
		</div>
		<h1 class="wordmark">ORACLE</h1>
		<p class="subtitle">
			Archive-keeper of Penn's universe. Ask, and be answered only from what is written in the canon.
		</p>

		<form class="query" onsubmit={(e) => (e.preventDefault(), ask())}>
			<span class="sigil">&#10022;</span>
			<input
				bind:value={question}
				placeholder="inscribe your question to the archive&hellip;"
				spellcheck="false"
				autocomplete="off"
				maxlength="500"
				aria-label="Your question"
			/>
			<button class="cast" type="submit" disabled={busy}>
				{busy ? 'divining…' : 'scry'}
			</button>
		</form>

		{#if status === 'idle'}
			<div class="incantations">
				{#each INCANTATIONS as q, i}
					<button class="incant" style="animation-delay:{120 + i * 70}ms" onclick={() => askWith(q)}>
						{q}
					</button>
				{/each}
			</div>
		{/if}
	</section>

	{#if errorMsg}
		<div class="error">{errorMsg}</div>
	{/if}

	{#if busy || answer || sources.length}
		<section class="response">
			<div class="panel answer-panel">
				<div class="label">
					<span class="dot" class:live={status === 'answering'}></span>
					{status === 'divining' ? 'consulting the archive…' : 'the oracle speaks'}
				</div>
				{#if answer || status !== 'divining'}
					<Answer
						text={answer}
						streaming={status === 'answering'}
						maxCite={sources.length}
						onhovercite={(n) => (hoveredCite = n)}
					/>
				{:else}
					<div class="scrying">
						<span></span><span></span><span></span>
					</div>
				{/if}
			</div>

			{#if sources.length}
				<div class="panel sources">
					<div class="label sources-label">fragments of the canon · {sources.length}</div>
					<div class="source-list">
						{#each sources as s, i (s.n)}
							<SourceCard source={s} highlighted={hoveredCite === s.n} delay={i * 60} />
						{/each}
					</div>
				</div>
			{/if}
		</section>
	{/if}

	<footer>
		grounded retrieval &middot; brute-force cosine over Cloudflare Workers&nbsp;AI embeddings &middot; the
		model may speak only from the fragments above
	</footer>
</main>

<style>
	main {
		max-width: var(--maxw);
		margin: 0 auto;
		padding: clamp(2.4rem, 6vh, 5rem) 1.4rem 5rem;
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
		transition: gap 0.5s;
	}

	.orb-slot {
		height: 150px;
		display: grid;
		place-items: center;
		transition: height 0.5s;
	}
	.hero.compact .orb-slot {
		height: 110px;
	}

	.wordmark {
		font-family: var(--display);
		font-weight: 600;
		font-size: clamp(3rem, 11vw, 5.4rem);
		letter-spacing: 0.22em;
		margin: 0.4rem 0 0;
		padding-left: 0.22em;
		background: linear-gradient(180deg, #fff 0%, var(--violet-bright) 48%, var(--violet) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 4px 30px rgba(139, 108, 255, 0.35));
		animation: rise 0.8s both 0.05s;
	}

	.subtitle {
		font-family: var(--serif);
		font-style: italic;
		font-size: clamp(0.95rem, 2.4vw, 1.12rem);
		line-height: 1.5;
		color: var(--vellum-dim);
		max-width: 32rem;
		margin: 0.9rem 0 0;
		animation: rise 0.8s both 0.15s;
	}

	.query {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		max-width: 38rem;
		margin-top: 2.1rem;
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.25));
		border: 1px solid var(--edge);
		border-radius: 14px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 50px rgba(0, 0, 0, 0.45);
		transition: border-color 0.3s, box-shadow 0.3s;
		animation: rise 0.8s both 0.25s;
	}
	.query:focus-within {
		border-color: var(--violet);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(139, 108, 255, 0.3),
			0 18px 60px rgba(139, 108, 255, 0.18);
	}
	.sigil {
		color: var(--violet);
		font-size: 1.05rem;
		flex: 0 0 auto;
		text-shadow: 0 0 14px rgba(139, 108, 255, 0.6);
	}
	.query input {
		flex: 1 1 auto;
		min-width: 0;
		background: none;
		border: 0;
		outline: none;
		color: var(--vellum);
		font-family: var(--mono);
		font-size: 0.98rem;
		padding: 0.45rem 0;
	}
	.query input::placeholder {
		color: var(--vellum-faint);
	}
	.cast {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--void);
		background: linear-gradient(180deg, var(--violet-bright), var(--violet));
		border: 0;
		border-radius: 9px;
		padding: 0.7rem 1.25rem;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.25s, opacity 0.25s;
		box-shadow: 0 0 22px rgba(139, 108, 255, 0.4);
	}
	.cast:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0 32px rgba(139, 108, 255, 0.7);
	}
	.cast:disabled {
		opacity: 0.55;
		cursor: progress;
	}

	.incantations {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.55rem;
		margin-top: 1.6rem;
		max-width: 40rem;
	}
	.incant {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--vellum-dim);
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--edge-soft);
		border-radius: 100px;
		padding: 0.5rem 0.95rem;
		cursor: pointer;
		transition: all 0.22s;
		animation: rise 0.7s both;
	}
	.incant:hover {
		color: var(--violet-bright);
		border-color: var(--violet);
		background: rgba(139, 108, 255, 0.08);
		box-shadow: 0 0 20px rgba(139, 108, 255, 0.18);
	}

	.error {
		margin-top: 2rem;
		font-family: var(--mono);
		font-size: 0.86rem;
		color: var(--ember);
		border: 1px solid rgba(232, 168, 124, 0.3);
		background: rgba(232, 168, 124, 0.06);
		padding: 0.85rem 1.1rem;
		border-radius: 10px;
		max-width: 38rem;
		text-align: center;
	}

	.response {
		width: 100%;
		margin-top: 2.8rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		animation: rise 0.6s both;
	}

	.panel {
		width: 100%;
	}
	.label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--vellum-faint);
		margin-bottom: 1.1rem;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--vellum-faint);
	}
	.dot.live {
		background: var(--violet-bright);
		box-shadow: 0 0 10px var(--violet-bright);
		animation: pulsedot 1.1s ease-in-out infinite;
	}
	@keyframes pulsedot {
		50% {
			opacity: 0.3;
		}
	}

	.answer-panel {
		border-left: 2px solid var(--edge);
		padding-left: clamp(1rem, 4vw, 1.8rem);
	}

	.scrying {
		display: flex;
		gap: 8px;
		padding: 0.5rem 0;
	}
	.scrying span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--violet);
		opacity: 0.4;
		animation: scry 1.2s ease-in-out infinite;
	}
	.scrying span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.scrying span:nth-child(3) {
		animation-delay: 0.4s;
	}
	@keyframes scry {
		0%, 100% {
			opacity: 0.25;
			transform: translateY(0);
		}
		50% {
			opacity: 1;
			transform: translateY(-5px);
		}
	}

	.source-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.sources-label {
		margin-bottom: 0.9rem;
	}

	footer {
		margin-top: 4rem;
		font-family: var(--mono);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		color: var(--vellum-faint);
		text-align: center;
		max-width: 34rem;
		line-height: 1.7;
		opacity: 0.7;
	}

	@media (max-width: 560px) {
		.query {
			flex-wrap: wrap;
		}
		.wordmark {
			letter-spacing: 0.16em;
		}
	}
</style>
