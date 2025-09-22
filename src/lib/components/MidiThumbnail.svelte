<script lang="ts">
	import { onMount } from 'svelte';
	import * as jadin from 'jadin';
	import { drawPianoRoll } from '$lib/midi-player/pianoRollRenderer';

	let {
		s3key,
		width = 160,
		height = 90,
		startTime = 0,
		endTime = 5,
		class: className = ''
	}: {
		s3key: string;
		width?: number;
		height?: number;
		startTime?: number;
		endTime?: number;
		class?: string;
	} = $props();

	let canvasRef: HTMLCanvasElement;
	let midi: jadin.Midi | null = null;

	async function loadAndRenderMidi() {
		try {
			// Fetch MIDI from S3 via API
			const response = await fetch(`/api/midis/s3/${encodeURIComponent(s3key)}`);
			if (!response.ok) {
				console.warn(`Failed to load thumbnail for ${s3key}: ${response.status}`);
				return; // Silently fail, keeping the gray background
			}
			const { midiBase64 } = await response.json();

			// Convert base64 to binary string for jadin
			const binaryString = atob(midiBase64);

			// Parse MIDI
			midi = new jadin.Midi(binaryString);

			// Render to canvas
			if (canvasRef) {
				const ctx = canvasRef.getContext('2d');
				if (ctx) {
					// Set canvas dimensions with device pixel ratio for sharpness
					const dpr = window.devicePixelRatio || 1;
					canvasRef.width = width * dpr;
					canvasRef.height = height * dpr;

					// Scale context to match device pixel ratio
					ctx.scale(dpr, dpr);

					drawPianoRoll({
						ctx,
						midi,
						startTime,
						endTime,
						width: width, // Use CSS dimensions, not scaled
						height: height,
						showGridLines: false // Don't show grid lines in thumbnails
					});
				}
			}
		} catch (error) {
			console.error('Failed to load MIDI thumbnail:', error);
			// On error, canvas stays with background color
		}
	}

	onMount(() => {
		if (s3key) {
			loadAndRenderMidi();
		}
	});

	$effect(() => {
		// Re-render if props change
		if (s3key && canvasRef) {
			loadAndRenderMidi();
		}
	});
</script>

<canvas
	bind:this={canvasRef}
	class="bg-[#2c2c2c] {className}"
	style="width: {width}px; height: {height}px;"
></canvas>
