<script>
	/** @type {{ state?: 'idle' | 'divining' | 'spent', size?: number }} */
	let { state = 'idle', size = 132 } = $props();
</script>

<div class="orb-wrap" style="--size:{size}px" data-state={state}>
	<div class="halo"></div>
	<div class="orb">
		<div class="swirl"></div>
		<div class="swirl swirl-2"></div>
		<div class="sheen"></div>
		<div class="core"></div>
	</div>
	<div class="ring"></div>
</div>

<style>
	.orb-wrap {
		position: relative;
		width: var(--size);
		height: var(--size);
		display: grid;
		place-items: center;
	}

	.halo {
		position: absolute;
		inset: -55%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(139, 108, 255, 0.45), transparent 62%);
		filter: blur(14px);
		animation: breathe 6s ease-in-out infinite;
	}

	.orb {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
		background:
			radial-gradient(circle at 38% 32%, #2a1d57 0%, #150f2c 55%, #07050f 100%);
		box-shadow:
			inset 0 0 34px rgba(0, 0, 0, 0.8),
			inset -6px -8px 26px rgba(0, 0, 0, 0.6),
			0 0 50px rgba(139, 108, 255, 0.28);
		animation: float 7s ease-in-out infinite;
	}

	/* Roiling violet smoke inside the glass */
	.swirl {
		position: absolute;
		inset: -30%;
		background: conic-gradient(
			from 0deg,
			transparent 0deg,
			rgba(139, 108, 255, 0.55) 70deg,
			transparent 150deg,
			rgba(74, 50, 168, 0.6) 230deg,
			transparent 320deg
		);
		filter: blur(8px);
		animation: spin 14s linear infinite;
	}
	.swirl-2 {
		inset: -20%;
		background: conic-gradient(
			from 180deg,
			transparent 0deg,
			rgba(201, 184, 255, 0.4) 60deg,
			transparent 180deg,
			rgba(139, 108, 255, 0.3) 280deg,
			transparent 360deg
		);
		animation: spin 9s linear infinite reverse;
		mix-blend-mode: screen;
	}

	.sheen {
		position: absolute;
		top: 12%;
		left: 18%;
		width: 42%;
		height: 30%;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 70%);
		filter: blur(2px);
	}

	.core {
		position: absolute;
		inset: 38%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(201, 184, 255, 0.9), rgba(139, 108, 255, 0.2) 70%, transparent);
		filter: blur(3px);
		animation: pulse 4s ease-in-out infinite;
	}

	.ring {
		position: absolute;
		inset: -14%;
		border-radius: 50%;
		border: 1px solid rgba(139, 108, 255, 0.25);
		animation: spin 28s linear infinite;
	}
	.ring::before {
		content: '';
		position: absolute;
		top: -3px;
		left: 50%;
		width: 5px;
		height: 5px;
		margin-left: -2.5px;
		border-radius: 50%;
		background: var(--violet-bright);
		box-shadow: 0 0 10px var(--violet-bright);
	}

	/* DIVINING — the orb wakes, smoke quickens, light flares */
	.orb-wrap[data-state='divining'] .swirl {
		animation-duration: 3.4s;
	}
	.orb-wrap[data-state='divining'] .swirl-2 {
		animation-duration: 2.2s;
	}
	.orb-wrap[data-state='divining'] .core {
		animation-duration: 1.1s;
	}
	.orb-wrap[data-state='divining'] .halo {
		animation-duration: 2.4s;
		background: radial-gradient(circle, rgba(201, 184, 255, 0.6), transparent 60%);
	}
	.orb-wrap[data-state='divining'] .ring {
		animation-duration: 6s;
		border-color: rgba(201, 184, 255, 0.45);
	}

	/* SPENT — settles, dimmer, slow */
	.orb-wrap[data-state='spent'] .swirl {
		animation-duration: 22s;
		opacity: 0.7;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes breathe {
		0%, 100% {
			opacity: 0.7;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.06);
		}
	}
	@keyframes pulse {
		0%, 100% {
			opacity: 0.7;
			transform: scale(0.92);
		}
		50% {
			opacity: 1;
			transform: scale(1.08);
		}
	}
	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-6px);
		}
	}
</style>
