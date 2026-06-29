<script>
	import { onMount } from 'svelte';
	import AsciiPortrait from './AsciiPortrait.svelte';
	import { ORACLE_ASCII } from '$lib/oracle-ascii.js';

	/** @type {{ phase?: 'idle' | 'divining' | 'spent' }} */
	let { phase = 'idle' } = $props();

	/** @type {HTMLDivElement | undefined} */
	let host = $state();
	let ready = $state(false); // the 3D canvas has rendered at least once

	// The render loop reads the live phase through this ref (kept synced below).
	let phaseRef = 'idle';
	$effect(() => {
		phaseRef = phase;
	});

	onMount(() => {
		// WebGL probe; if absent we keep the CSS ASCII portrait fallback.
		let gl = null;
		try {
			const c = document.createElement('canvas');
			gl = c.getContext('webgl2') || c.getContext('webgl');
		} catch {
			gl = null;
		}
		if (!gl || !host) return;

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let dispose = () => {};
		let alive = true;
		(async () => {
			const d = await initScene(host, reduce, () => phaseRef, () => (ready = true));
			if (!alive) d();
			else dispose = d;
		})();
		return () => {
			alive = false;
			dispose();
		};
	});

	/**
	 * Build the scene. Returns a disposer.
	 * @param {HTMLElement} mount
	 * @param {boolean} reduce
	 * @param {() => string} getPhase
	 * @param {() => void} onReady
	 */
	async function initScene(mount, reduce, getPhase, onReady) {
		const THREE = await import('three');
		try {
			await document.fonts.ready;
		} catch {
			/* fonts optional */
		}

		const W = () => mount.clientWidth || 320;
		const H = () => mount.clientHeight || 280;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(W(), H());
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:grab;';
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(32, W() / H(), 0.1, 100);
		camera.position.set(0, 0, 6.2);

		const group = new THREE.Group();
		scene.add(group);

		// Chassis: a dark, matte, deep CRT box. It recedes; no badges or buttons.
		const chassis = new THREE.Mesh(
			new THREE.BoxGeometry(3.4, 2.8, 1.7),
			new THREE.MeshStandardMaterial({ color: 0x141009, roughness: 0.9, metalness: 0.05 })
		);
		group.add(chassis);

		// Screen: a slightly bulged plane (subtle CRT glass curvature), set just
		// proud of the chassis front so the chassis face reads as the bezel.
		const screenGeo = new THREE.PlaneGeometry(2.62, 2.04, 40, 32);
		const pos = screenGeo.attributes.position;
		const hw = 2.62 / 2;
		const hh = 2.04 / 2;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const y = pos.getY(i);
			const bulge = 0.13 * (1 - (x / hw) ** 2) * (1 - (y / hh) ** 2);
			pos.setZ(i, bulge);
		}
		screenGeo.computeVertexNormals();

		const canvas = document.createElement('canvas');
		canvas.width = 560;
		canvas.height = 436;
		const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		let glow = 1;
		drawScreen(ctx, canvas.width, canvas.height, glow);

		const screen = new THREE.Mesh(
			screenGeo,
			new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
		);
		screen.position.z = 0.851;
		group.add(screen);

		// Light for the matte body; the screen lights itself.
		scene.add(new THREE.AmbientLight(0xfff0d8, 0.55));
		const key = new THREE.DirectionalLight(0xffd9a0, 0.75);
		key.position.set(-3, 4, 5);
		scene.add(key);
		const phosphor = new THREE.PointLight(0xffb84d, 0.6, 7);
		phosphor.position.set(0, 0, 2.2);
		scene.add(phosphor);

		// A quiet three-quarter resting pose.
		const baseY = -0.26;
		const baseX = -0.05;
		group.rotation.set(baseX, baseY, 0);

		// Drag to orbit; eases back toward rest when released.
		let targetY = baseY;
		let targetX = baseX;
		let dragging = false;
		let px = 0;
		let py = 0;
		/** @param {PointerEvent} e */
		const down = (e) => {
			dragging = true;
			px = e.clientX;
			py = e.clientY;
			renderer.domElement.style.cursor = 'grabbing';
			renderer.domElement.setPointerCapture?.(e.pointerId);
		};
		/** @param {PointerEvent} e */
		const move = (e) => {
			if (!dragging) return;
			targetY += (e.clientX - px) * 0.006;
			targetX += (e.clientY - py) * 0.006;
			targetX = Math.max(-0.5, Math.min(0.5, targetX));
			px = e.clientX;
			py = e.clientY;
		};
		const up = () => {
			dragging = false;
			renderer.domElement.style.cursor = 'grab';
		};
		renderer.domElement.addEventListener('pointerdown', down);
		renderer.domElement.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);

		// Resize.
		const ro = new ResizeObserver(() => {
			renderer.setSize(W(), H());
			camera.aspect = W() / H();
			camera.updateProjectionMatrix();
		});
		ro.observe(mount);

		// Visibility gating so the loop sleeps when offscreen or tab-hidden.
		let onscreen = true;
		const io = new IntersectionObserver((es) => (onscreen = es[0].isIntersecting), { threshold: 0.05 });
		io.observe(mount);
		const onVis = () => {};
		document.addEventListener('visibilitychange', onVis);

		let raf = 0;
		let t0 = 0;
		let lastGlow = -1;
		let firstFrame = true;
		/** @param {number} t */
		function frame(t) {
			raf = requestAnimationFrame(frame);
			if (!onscreen || document.hidden) return;
			if (!t0) t0 = t;
			const el = (t - t0) / 1000;

			// Idle sway, very small; off entirely under reduced motion.
			const drift = reduce ? 0 : Math.sin(el * 0.32) * 0.05;
			const aimY = dragging ? targetY : targetY + drift;
			group.rotation.y += (aimY - group.rotation.y) * 0.06;
			group.rotation.x += (targetX - group.rotation.x) * 0.06;

			// The screen breathes a touch brighter while divining.
			const st = getPhase();
			const want = st === 'divining' ? 1.18 : st === 'spent' ? 0.92 : 1;
			glow += (want - glow) * 0.08;
			if (Math.abs(glow - lastGlow) > 0.01) {
				drawScreen(ctx, canvas.width, canvas.height, glow);
				texture.needsUpdate = true;
				lastGlow = glow;
			}
			phosphor.intensity = 0.45 + glow * 0.25;

			renderer.render(scene, camera);
			if (firstFrame) {
				firstFrame = false;
				onReady();
			}

			// Under reduced motion, render a single settled frame and stop.
			if (reduce && Math.abs(group.rotation.y - aimY) < 0.001) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		}
		raf = requestAnimationFrame(frame);

		return () => {
			if (raf) cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			document.removeEventListener('visibilitychange', onVis);
			renderer.domElement.removeEventListener('pointerdown', down);
			renderer.domElement.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			screenGeo.dispose();
			texture.dispose();
			screen.material.dispose();
			chassis.geometry.dispose();
			/** @type {any} */ (chassis.material).dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}

	/**
	 * Draw the ASCII Oracle as amber phosphor with baked scanlines and a vignette.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} w
	 * @param {number} h
	 * @param {number} glow
	 */
	function drawScreen(ctx, w, h, glow) {
		ctx.fillStyle = '#0c0b08';
		ctx.fillRect(0, 0, w, h);

		const lines = ORACLE_ASCII.split('\n');
		const cols = Math.max(...lines.map((l) => l.length));
		const fs = Math.min(h / (lines.length + 3), w / (cols * 0.62));
		ctx.font = `${fs}px "IBM Plex Mono", ui-monospace, monospace`;
		ctx.textBaseline = 'top';
		const blockW = cols * fs * 0.6;
		const ox = (w - blockW) / 2;
		const oy = (h - lines.length * fs) / 2;

		ctx.save();
		ctx.globalAlpha = Math.min(1, 0.7 + glow * 0.25);
		ctx.fillStyle = '#d9a85e';
		ctx.shadowColor = 'rgba(217,168,94,0.55)';
		ctx.shadowBlur = 4 * glow;
		lines.forEach((ln, i) => ctx.fillText(ln, ox, oy + i * fs));
		ctx.restore();

		// Baked scanlines.
		ctx.fillStyle = 'rgba(0,0,0,0.16)';
		for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

		// Vignette.
		const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.72);
		g.addColorStop(0, 'rgba(0,0,0,0)');
		g.addColorStop(1, 'rgba(0,0,0,0.5)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
	}
</script>

<div class="monitor" bind:this={host} data-state={phase} class:live={ready}>
	{#if !ready}<div class="fallback"><AsciiPortrait state={phase} /></div>{/if}
</div>

<style>
	.monitor {
		position: relative;
		width: 100%;
		max-width: 340px;
		height: 280px;
		margin: 0 auto;
		touch-action: pan-y;
	}
	.fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
