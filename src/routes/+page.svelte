<script>
	import { onMount } from 'svelte';
	import Rain from '$lib/components/Rain.svelte';
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

	// Her words — rotated beneath the wordmark while you decide what to ask.
	const QUOTES = [
		'Know thyself.',
		'You have the gift, but it looks like you are waiting for something.',
		'We can never see past the choices we do not understand.',
		'Everything that has a beginning has an end.',
		'You did not come here to make the choice. You are here to understand why you made it.',
		'I would offer you a cookie, but you already know how it tastes.'
	];
	let quoteIdx = $state(0);

	// What she murmurs while she looks you over.
	const DIVINING = [
		'I know what you are going to ask.',
		'Hmm. Let me take a look at you.',
		'Sit down. ...you were not going to anyway.',
		'Let me see what is written.'
	];
	let diviningLine = $state(DIVINING[0]);

	const INCANTATIONS = [
		'What are you?',
		'How do you know what you know?',
		'What is the Goolz hegemony?',
		'How does the Playing With Goolz enemy AI behave?',
		'Why is the BeaglePlay wifi broken?',
		'What is MUTE about?'
	];

	let ateCookie = $state(false);

	onMount(() => {
		const id = setInterval(() => {
			if (status === 'idle') quoteIdx = (quoteIdx + 1) % QUOTES.length;
		}, 5200);
		return () => clearInterval(id);
	});

	async function ask() {
		const q = question.trim();
		if (!q || busy) return;

		diviningLine = DIVINING[(quoteIdx + q.length) % DIVINING.length];
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
			errorMsg = 'The line to the kitchen went quiet. Try again.';
			status = 'error';
			return;
		}

		if (!res.ok || !res.body) {
			const e = await res.json().catch(() => ({ error: 'She is not answering just now.' }));
			errorMsg = e.error ?? 'She is not answering just now.';
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
					errorMsg = msg.message ?? 'She lost the thread.';
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
	<title>THE ORACLE — she speaks only from what is written</title>
</svelte:head>

<Rain />

<main>
	<section class="hero" class:compact={status !== 'idle'}>
		<OracleScreen state={screenState} />

		<p class="eyebrow">// the oracle will see you now</p>
		<h1 class="wordmark">ORACLE</h1>

		<div class="quote-slot">
			{#key quoteIdx}
				<p class="quote">&ldquo;{QUOTES[quoteIdx]}&rdquo;</p>
			{/key}
		</div>

		<form class="query" onsubmit={(e) => (e.preventDefault(), ask())}>
			<span class="sigil">&gt;_</span>
			<input
				use:autofocus
				bind:value={question}
				placeholder="ask her something&hellip;"
				spellcheck="false"
				autocomplete="off"
				maxlength="500"
				aria-label="Your question"
			/>
			<button class="cast" type="submit" disabled={busy}>
				{busy ? 'seeing…' : 'ask'}
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
					{status === 'divining' ? diviningLine : 'the oracle speaks'}
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

	<footer>
		<button class="candy" onclick={() => (ateCookie = !ateCookie)}>
			{ateCookie ? "right as rain \u{1F36A}" : 'candy?'}
		</button>
		<p>grounded retrieval &middot; Cloudflare Workers&nbsp;AI &middot; she speaks only from what is written</p>
	</footer>
</main>

<style>
	main {
		position: relative;
		z-index: 1;
		max-width: var(--maxw);
		margin: 0 auto;
		padding: clamp(2rem, 5vh, 4rem) 1.4rem 5rem;
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

	.eyebrow {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--phosphor);
		margin: 1.4rem 0 0;
		opacity: 0.85;
		animation: rise 0.8s both;
	}

	.wordmark {
		font-family: var(--display);
		font-weight: 700;
		font-size: clamp(2.7rem, 10vw, 5rem);
		letter-spacing: 0.24em;
		margin: 0.35rem 0 0;
		padding-left: 0.24em;
		background: linear-gradient(180deg, #f4fff6 0%, var(--phosphor-bright) 45%, var(--phosphor) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 4px 26px rgba(61, 240, 140, 0.35));
		animation: rise 0.8s both 0.05s;
	}

	.quote-slot {
		min-height: 3.4em;
		display: grid;
		place-items: center;
		max-width: 32rem;
		margin-top: 0.9rem;
	}
	.quote {
		font-family: var(--serif);
		font-style: italic;
		font-size: clamp(1rem, 2.5vw, 1.18rem);
		line-height: 1.5;
		color: var(--cream-dim);
		margin: 0;
		animation: quotefade 0.9s both;
	}
	@keyframes quotefade {
		from {
			opacity: 0;
			transform: translateY(6px);
			filter: blur(2px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	.query {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		max-width: 38rem;
		margin-top: 1.4rem;
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		background: linear-gradient(180deg, rgba(61, 240, 140, 0.04), rgba(0, 0, 0, 0.3));
		border: 1px solid var(--edge);
		border-radius: 14px;
		box-shadow: inset 0 1px 0 rgba(120, 255, 170, 0.05), 0 18px 50px rgba(0, 0, 0, 0.5);
		transition: border-color 0.3s, box-shadow 0.3s;
		animation: rise 0.8s both 0.25s;
	}
	.query:focus-within {
		border-color: var(--phosphor);
		box-shadow: inset 0 1px 0 rgba(120, 255, 170, 0.07), 0 0 0 1px rgba(61, 240, 140, 0.3),
			0 18px 60px rgba(61, 240, 140, 0.16);
	}
	.sigil {
		color: var(--phosphor);
		font-family: var(--mono);
		font-size: 1rem;
		flex: 0 0 auto;
		text-shadow: 0 0 14px rgba(61, 240, 140, 0.6);
	}
	.query input {
		flex: 1 1 auto;
		min-width: 0;
		background: none;
		border: 0;
		outline: none;
		color: var(--cream);
		font-family: var(--mono);
		font-size: 0.98rem;
		padding: 0.45rem 0;
	}
	.query input::placeholder {
		color: var(--phosphor-dim);
	}
	.cast {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #03140a;
		background: linear-gradient(180deg, var(--phosphor-bright), var(--phosphor));
		border: 0;
		border-radius: 9px;
		padding: 0.7rem 1.3rem;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.25s, opacity 0.25s;
		box-shadow: 0 0 22px rgba(61, 240, 140, 0.4);
	}
	.cast:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0 32px rgba(61, 240, 140, 0.7);
	}
	.cast:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.incantations {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.55rem;
		margin-top: 1.5rem;
		max-width: 40rem;
	}
	.incant {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--cream-dim);
		background: rgba(61, 240, 140, 0.03);
		border: 1px solid var(--edge-soft);
		border-radius: 100px;
		padding: 0.5rem 0.95rem;
		cursor: pointer;
		transition: all 0.22s;
		animation: rise 0.7s both;
	}
	.incant:hover {
		color: var(--phosphor-bright);
		border-color: var(--phosphor);
		background: rgba(61, 240, 140, 0.09);
		box-shadow: 0 0 20px rgba(61, 240, 140, 0.18);
	}

	.error {
		margin-top: 2rem;
		font-family: var(--mono);
		font-size: 0.86rem;
		color: var(--amber);
		border: 1px solid rgba(233, 178, 74, 0.32);
		background: rgba(233, 178, 74, 0.06);
		padding: 0.85rem 1.1rem;
		border-radius: 10px;
		max-width: 38rem;
		text-align: center;
	}

	.response {
		width: 100%;
		margin-top: 2.6rem;
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
		color: var(--phosphor-dim);
		margin-bottom: 1.1rem;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--phosphor-dim);
	}
	.dot.live {
		background: var(--phosphor-bright);
		box-shadow: 0 0 10px var(--phosphor-bright);
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
		background: var(--phosphor);
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
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
		text-align: center;
	}
	.candy {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--amber);
		background: rgba(233, 178, 74, 0.06);
		border: 1px solid rgba(233, 178, 74, 0.28);
		border-radius: 100px;
		padding: 0.45rem 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	.candy:hover {
		background: rgba(233, 178, 74, 0.14);
		box-shadow: 0 0 18px rgba(233, 178, 74, 0.25);
	}
	footer p {
		margin: 0;
		font-family: var(--mono);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		color: var(--phosphor-dim);
		max-width: 34rem;
		line-height: 1.7;
		opacity: 0.75;
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
