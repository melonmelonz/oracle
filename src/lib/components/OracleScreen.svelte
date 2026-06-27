<script>
	/** @type {{ state?: 'idle' | 'divining' | 'spent' }} */
	let { state = 'idle' } = $props();
</script>

<figure class="crt" data-state={state}>
	<div class="bezel">
		<img src="/oracle.png" alt="The Oracle, regarding you from her kitchen" />
		<div class="scan"></div>
		<div class="sweep"></div>
		<div class="vignette"></div>
		<div class="glass"></div>
		<span class="led" class:live={state === 'divining'}></span>
	</div>
	<figcaption>TEMET&nbsp;NOSCE</figcaption>
</figure>

<style>
	.crt {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		width: min(420px, 82vw);
		transition: width 0.5s;
	}
	.crt[data-state='divining'],
	.crt[data-state='spent'] {
		width: min(360px, 74vw);
	}

	.bezel {
		position: relative;
		width: 100%;
		aspect-ratio: 900 / 372;
		border-radius: 14px;
		overflow: hidden;
		background: #03110a;
		padding: 0;
		box-shadow:
			0 0 0 1px rgba(0, 255, 120, 0.25),
			0 0 34px rgba(0, 255, 120, 0.18),
			inset 0 0 60px rgba(0, 0, 0, 0.6);
		animation: flicker 7s steps(60) infinite;
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(1.1) contrast(1.05);
	}

	/* fine scanlines */
	.scan {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0) 0px,
			rgba(0, 0, 0, 0) 2px,
			rgba(0, 0, 0, 0.28) 3px
		);
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	/* slow scanning bar — like the Construct reading you */
	.sweep {
		position: absolute;
		left: 0;
		right: 0;
		height: 28%;
		top: -30%;
		background: linear-gradient(
			180deg,
			transparent,
			rgba(120, 255, 170, 0.12) 50%,
			transparent
		);
		animation: sweep 5.5s linear infinite;
		pointer-events: none;
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(120% 100% at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.55));
		pointer-events: none;
	}

	/* curved-glass highlight */
	.glass {
		position: absolute;
		inset: 0;
		background: radial-gradient(140% 80% at 50% -10%, rgba(180, 255, 200, 0.1), transparent 45%);
		pointer-events: none;
	}

	.led {
		position: absolute;
		bottom: 9px;
		right: 11px;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #1b7a3f;
		box-shadow: 0 0 6px rgba(0, 255, 120, 0.5);
	}
	.led.live {
		background: #6dffa0;
		box-shadow: 0 0 12px #6dffa0;
		animation: blink 1s steps(2) infinite;
	}

	figcaption {
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 0.42em;
		padding-left: 0.42em;
		color: var(--phosphor-dim);
		text-transform: uppercase;
	}

	.crt[data-state='divining'] .bezel {
		animation-duration: 0.5s;
		box-shadow:
			0 0 0 1px rgba(120, 255, 170, 0.5),
			0 0 50px rgba(0, 255, 120, 0.4),
			inset 0 0 60px rgba(0, 0, 0, 0.55);
	}
	.crt[data-state='divining'] .sweep {
		animation-duration: 2.4s;
	}

	@keyframes sweep {
		from {
			top: -30%;
		}
		to {
			top: 110%;
		}
	}
	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0.25;
		}
	}
	@keyframes flicker {
		0%,
		97%,
		100% {
			opacity: 1;
		}
		97.5% {
			opacity: 0.86;
		}
		98% {
			opacity: 0.97;
		}
		98.5% {
			opacity: 0.8;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sweep {
			display: none;
		}
		.bezel {
			animation: none;
		}
	}
</style>
