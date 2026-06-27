<script>
	/** @type {{ state?: 'idle' | 'divining' | 'spent' }} */
	let { state = 'idle' } = $props();
</script>

<figure class="portrait" data-state={state}>
	<img src="/oracle.png" alt="The Oracle, regarding you" />
	<div class="vignette"></div>
	<div class="sheen"></div>
</figure>

<style>
	.portrait {
		position: relative;
		margin: 0;
		width: min(380px, 80vw);
		aspect-ratio: 900 / 372;
		border-radius: 10px;
		overflow: hidden;
		background: #0c100e;
		box-shadow:
			0 0 0 1px rgba(143, 178, 156, 0.14),
			0 24px 60px rgba(0, 0, 0, 0.55);
		transition: width 0.5s, box-shadow 0.6s;
	}
	.portrait[data-state='divining'],
	.portrait[data-state='spent'] {
		width: min(310px, 72vw);
	}
	.portrait[data-state='divining'] {
		box-shadow:
			0 0 0 1px rgba(143, 178, 156, 0.28),
			0 0 40px rgba(143, 178, 156, 0.18),
			0 24px 60px rgba(0, 0, 0, 0.55);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(1) contrast(1.02);
		transition: filter 0.6s;
	}
	.portrait[data-state='divining'] img {
		filter: saturate(1.12) contrast(1.04) brightness(1.06);
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(125% 105% at 50% 42%, transparent 52%, rgba(0, 0, 0, 0.5));
		pointer-events: none;
	}
	.sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(192, 214, 200, 0.06), transparent 40%);
		pointer-events: none;
	}
</style>
