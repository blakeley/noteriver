<script lang="ts">
	import { onMount } from 'svelte';
	import type * as jadin from 'jadin';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';

	let {
		indexParity,
		time,
		midi
	}: {
		indexParity: boolean;
		time: number;
		midi: jadin.Midi;
	} = $props();

	let canvasRef: HTMLCanvasElement;
	let index = $state(0);
	let width = $state(1280);
	let height = $state(720);

	const lowNumber = 21;
	const highNumber = 108;
	const timeScale = 10; // Number of ivory key widths in one second of piano roll

	const lowMidiNumber = new MidiNumber(lowNumber);
	const highMidiNumber = new MidiNumber(highNumber);

	const scale = $derived(width / (highMidiNumber.x - lowMidiNumber.x + highMidiNumber.width));

	const duration = $derived(height / (scale * timeScale));

	const currentIndex = $derived(() => {
		let idx = Math.floor(time / duration);
		if (indexParity === (idx % 2 === 0)) {
			idx += 1;
		}
		return idx;
	});

	const start = $derived(currentIndex() * duration);

	const translateY = $derived(-(100 * (start - time)) / duration);

	function draw() {
		if (!canvasRef || !midi) return;
		const ctx = canvasRef.getContext('2d')!;
		ctx.resetTransform();
		ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

		ctx.translate(0, canvasRef.height);
		ctx.scale(scale, -scale);
		ctx.translate(-lowMidiNumber.x, 0);
		ctx.translate(0, keyboard.IVORY_HEIGHT);
		ctx.translate(0, -start * timeScale);

		for (const track of midi.tracks) {
			for (const note of track.notesOnDuring(start - 1, start + duration)) {
				const midiNumber = new MidiNumber(note.number!);
				ctx.fillStyle =
					midiNumber.noteColors[track.index % midiNumber.noteColors.length] || '#95B7DB';
				ctx.strokeStyle = '#202020';
				ctx.lineWidth = midiNumber.width / 16;

				const x = midiNumber.x + ctx.lineWidth / 2;
				const y = note.onSecond! * timeScale;
				const w = midiNumber.width - ctx.lineWidth;
				const h = note.duration * timeScale;
				const r = midiNumber.width / 4;

				ctx.beginPath();
				ctx.moveTo(x + r, y);
				ctx.arcTo(x + w, y, x + w, y + h, r);
				ctx.arcTo(x + w, y + h, x, y + h, r);
				ctx.arcTo(x, y + h, x, y, r);
				ctx.arcTo(x, y, x + w, y, r);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	}

	onMount(() => {
		if (canvasRef) {
			// Use requestAnimationFrame to ensure canvas is properly sized
			requestAnimationFrame(() => {
				height = canvasRef.clientHeight * window.devicePixelRatio;
				width = canvasRef.clientWidth * window.devicePixelRatio;
				draw();
			});
		}
	});

	$effect(() => {
		let idx = Math.floor(time / duration);
		if (indexParity === (idx % 2 === 0)) {
			idx += 1;
		}
		index = idx;
	});

	$effect(() => {
		// Redraw when any dependencies change (including width/height)
		if (width > 0 && height > 0) {
			draw();
		}
	});
</script>

<canvas bind:this={canvasRef} {height} {width} style="transform: translateY({translateY}%)"
></canvas>
