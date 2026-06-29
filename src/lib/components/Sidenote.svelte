<script module>
	// Stable, SSR-safe unique ids without Math.random (which would break hydration).
	let counter = 0;
</script>

<script>
	/** @type {{ marker?: string, children: import('svelte').Snippet }} */
	let { marker = '+', children } = $props();
	const id = `sn-${counter++}`;
</script>

<label class="marker" for={id}>{marker}</label>
<input type="checkbox" {id} class="toggle" />
<span class="note">{@render children()}</span>

<style>
	.marker {
		font-family: var(--mono);
		font-size: 0.7em;
		color: var(--cool-bright);
		cursor: pointer;
		vertical-align: super;
		padding: 0 0.15em;
	}
	.toggle {
		display: none;
	}
	.note {
		font-family: var(--mono);
		font-size: 0.74rem;
		line-height: 1.55;
		color: var(--text-dim);
	}

	/* Wide: the note lives in the right gutter beside the reading column. */
	@media (min-width: 1180px) {
		.marker {
			display: inline;
		}
		.note {
			float: right;
			clear: right;
			width: 13rem;
			margin-right: -15rem;
			margin-bottom: 0.6rem;
			text-align: left;
		}
	}

	/* Narrow: hidden until the marker is tapped, then revealed inline. */
	@media (max-width: 1179px) {
		.note {
			display: none;
			margin: 0.4rem 0;
			padding-left: 0.7rem;
			border-left: 2px solid var(--cool-deep);
		}
		.toggle:checked ~ .note {
			display: block;
		}
	}
</style>
