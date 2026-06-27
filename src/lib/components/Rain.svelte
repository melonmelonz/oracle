<script>
	import { onMount } from 'svelte';

	let canvas;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		const glyphs =
			'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾚ0123456789ABCDEFZ:."=*+-<>¦|'.split('');
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const fontSize = 15;
		let w, h, cols, drops, speeds;

		function resize() {
			w = canvas.width = window.innerWidth;
			h = canvas.height = window.innerHeight;
			cols = Math.ceil(w / fontSize);
			drops = new Array(cols).fill(0).map(() => Math.random() * -60);
			speeds = new Array(cols).fill(0).map(() => 0.35 + Math.random() * 0.55);
			ctx.fillStyle = '#030705';
			ctx.fillRect(0, 0, w, h);
		}
		resize();

		let raf;
		let last = 0;

		function frame(t) {
			raf = requestAnimationFrame(frame);
			if (t - last < 60) return; // ~16fps — calm, not seizure-inducing
			last = t;

			// fade the previous frame toward the void, leaving green trails
			ctx.fillStyle = 'rgba(3, 7, 5, 0.16)';
			ctx.fillRect(0, 0, w, h);
			ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
			ctx.textBaseline = 'top';

			for (let i = 0; i < cols; i++) {
				const ch = glyphs[(Math.random() * glyphs.length) | 0];
				const x = i * fontSize;
				const y = drops[i] * fontSize;

				// bright leading glyph, dim green tail
				if (Math.random() > 0.975) {
					ctx.fillStyle = 'rgba(220, 255, 230, 0.95)';
				} else {
					ctx.fillStyle = 'rgba(0, 255, 120, 0.32)';
				}
				if (y > -fontSize) ctx.fillText(ch, x, y);

				if (y > h && Math.random() > 0.97) drops[i] = Math.random() * -20;
				drops[i] += speeds[i];
			}
		}

		if (reduce) {
			// one static, very dim pass — no animation
			ctx.font = `${fontSize}px monospace`;
			ctx.fillStyle = 'rgba(0, 255, 120, 0.12)';
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < Math.random() * 8; j++) {
					ctx.fillText(
						glyphs[(Math.random() * glyphs.length) | 0],
						i * fontSize,
						Math.random() * h
					);
				}
			}
		} else {
			raf = requestAnimationFrame(frame);
		}

		window.addEventListener('resize', resize);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
		pointer-events: none;
		opacity: 0.5;
		/* keep the rain from competing with the reading column */
		mask-image: radial-gradient(120% 90% at 50% 30%, transparent 18%, #000 70%);
		-webkit-mask-image: radial-gradient(120% 90% at 50% 30%, transparent 18%, #000 70%);
	}
</style>
