<script>
	import OracleScreen from '$lib/components/OracleScreen.svelte';
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
	const screenState = $derived(busy ? 'divining' : status === 'spent' ? 'spent' : 'idle');

	const INCANTATIONS = [
		'What are you?',
		'How do you know what you know?',
		'What is the Goolz hegemony?',
		'How does the Playing With Goolz enemy AI behave?',
		'Why is the BeaglePlay wifi broken?',
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
			errorMsg = 'The connection dropped. Try again.';
			status = 'error';
			return;
		}

		if (!res.ok || !res.body) {
			const e = await res.json().catch(() => ({ error: 'No answer came back.' }));
			errorMsg = e.error ?? 'No answer came back.';
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
					errorMsg = msg.message ?? 'Something went wrong.';
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

	function autofocus(node) {
		node.focus();
	}
</script>

<svelte:head>
	<title>The Oracle — an archive of the work</title>
</svelte:head>

<main>
	<section class="hero" class:compact={status !== 'idle'}>
		<OracleScreen state={screenState} />

		<h1 class="wordmark">ORACLE</h1>

		<p class="tagline">
			An archive of the work. It answers only from what is written, and it tells you when something
			is not there.
		</p>

		<form class="query" onsubmit={(e) => (e.preventDefault(), ask())}>
			<span class="sigil">&gt;</span>
			<input
				use:autofocus
				bind:value={question}
				placeholder="ask about the work&hellip;"
				spellcheck="false"
				autocomplete="off"
				maxlength="500"
				aria-label="Your question"
			/>
			<button class="cast" type="submit" disabled={busy}>
				{busy ? 'reading…' : 'ask'}
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
					{status === 'divining' ? 'looking through the archive…' : 'the answer'}
				</div>
				{#if answer || status !== 'divining'}
					<Answer
						text={answer}
						streaming={status === 'answering'}
						maxCite={sources.length}
						onhovercite={(n) => (hoveredCite = n)}
					/>
				{:else}
					<div class="scrying"><span></span><span></span><span></span></div>
				{/if}
			</div>

			{#if sources.length}
				<div class="panel sources">
					<div class="label sources-label">what is written · {sources.length}</div>
					<div class="source-list">
						{#each sources as s, i (s.n)}
							<SourceCard source={s} highlighted={hoveredCite === s.n} delay={i * 60} />
						{/each}
					</div>
				</div>
			{/if}
		</section>
	{/if}

	<footer>grounded retrieval &middot; Cloudflare Workers&nbsp;AI &middot; answers only from what is written</footer>
</main>

<style>
	main {
		position: relative;
		z-index: 1;
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
	}

	.wordmark {
		font-family: var(--display);
		font-weight: 600;
		font-size: clamp(2.5rem, 9vw, 4.4rem);
		letter-spacing: 0.26em;
		margin: 1.5rem 0 0;
		padding-left: 0.26em;
		background: linear-gradient(180deg, var(--bone) 0%, #cdd6cc 55%, var(--sage) 120%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 3px 22px rgba(143, 178, 156, 0.2));
		animation: rise 0.8s both 0.05s;
	}

	.tagline {
		font-family: var(--serif);
		font-size: clamp(0.98rem, 2.3vw, 1.12rem);
		line-height: 1.6;
		color: var(--bone-dim);
		max-width: 30rem;
		margin: 1rem 0 0;
		animation: rise 0.8s both 0.15s;
	}

	.query {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		max-width: 36rem;
		margin-top: 1.9rem;
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		background: linear-gradient(180deg, rgba(143, 178, 156, 0.035), rgba(0, 0, 0, 0.25));
		border: 1px solid var(--edge);
		border-radius: 13px;
		box-shadow: inset 0 1px 0 rgba(192, 214, 200, 0.04), 0 16px 44px rgba(0, 0, 0, 0.45);
		transition: border-color 0.3s, box-shadow 0.3s;
		animation: rise 0.8s both 0.25s;
	}
	.query:focus-within {
		border-color: var(--sage-dim);
		box-shadow: inset 0 1px 0 rgba(192, 214, 200, 0.06), 0 0 0 1px rgba(143, 178, 156, 0.22),
			0 16px 50px rgba(143, 178, 156, 0.12);
	}
	.sigil {
		color: var(--sage);
		font-family: var(--mono);
		font-size: 1rem;
		flex: 0 0 auto;
		opacity: 0.8;
	}
	.query input {
		flex: 1 1 auto;
		min-width: 0;
		background: none;
		border: 0;
		outline: none;
		color: var(--bone);
		font-family: var(--mono);
		font-size: 0.96rem;
		padding: 0.45rem 0;
	}
	.query input::placeholder {
		color: var(--bone-faint);
	}
	.cast {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #0b0f0d;
		background: linear-gradient(180deg, var(--sage-bright), var(--sage));
		border: 0;
		border-radius: 9px;
		padding: 0.7rem 1.25rem;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.25s, opacity 0.25s;
		box-shadow: 0 0 18px rgba(143, 178, 156, 0.22);
	}
	.cast:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0 26px rgba(143, 178, 156, 0.4);
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
		max-width: 38rem;
	}
	.incant {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--bone-dim);
		background: rgba(143, 178, 156, 0.025);
		border: 1px solid var(--edge-soft);
		border-radius: 100px;
		padding: 0.5rem 0.95rem;
		cursor: pointer;
		transition: all 0.22s;
		animation: rise 0.7s both;
	}
	.incant:hover {
		color: var(--sage-bright);
		border-color: var(--sage-dim);
		background: rgba(143, 178, 156, 0.07);
	}

	.error {
		margin-top: 2rem;
		font-family: var(--mono);
		font-size: 0.86rem;
		color: var(--gold);
		border: 1px solid rgba(205, 162, 94, 0.3);
		background: rgba(205, 162, 94, 0.06);
		padding: 0.85rem 1.1rem;
		border-radius: 10px;
		max-width: 36rem;
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
		font-size: 0.71rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--sage-dim);
		margin-bottom: 1.1rem;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--sage-dim);
	}
	.dot.live {
		background: var(--sage-bright);
		box-shadow: 0 0 9px rgba(192, 214, 200, 0.7);
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
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--sage);
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
		0%,
		100% {
			opacity: 0.25;
			transform: translateY(0);
		}
		50% {
			opacity: 1;
			transform: translateY(-4px);
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
		font-size: 0.67rem;
		letter-spacing: 0.08em;
		color: var(--bone-faint);
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
			letter-spacing: 0.18em;
		}
	}
</style>
