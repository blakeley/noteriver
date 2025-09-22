<script lang="ts">
	import { onMount } from 'svelte';
	import { getPlayerContext } from '$lib/midi-player/context';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import { createHorizontalGradient } from '$lib/utils/colorGradient';

	const playerState = getPlayerContext();

	let {
		indexParity
	}: {
		indexParity: boolean;
	} = $props();

	let canvasRef: HTMLCanvasElement;
	let index = $state(0);

	const scale = $derived(
		playerState.width /
			(playerState.highMidiNumber.x -
				playerState.lowMidiNumber.x +
				playerState.highMidiNumber.width)
	);

	const duration = $derived(playerState.height / (scale * playerState.timeScale));

	const currentIndex = $derived(() => {
		let idx = Math.floor(playerState.time / duration);
		if (indexParity === (idx % 2 === 0)) {
			idx += 1;
		}
		return idx;
	});

	const start = $derived(currentIndex() * duration);

	const translateY = $derived(-(100 * (start - playerState.time)) / duration);

	function draw() {
		if (!canvasRef || !playerState.loadedMidi) return;
		const ctx = canvasRef.getContext('2d')!;
		ctx.resetTransform();
		ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

		ctx.translate(0, canvasRef.height);
		ctx.scale(scale, -scale);
		ctx.translate(-playerState.lowMidiNumber.x, 0);
		ctx.translate(0, keyboard.IVORY_HEIGHT);
		ctx.translate(0, -start * playerState.timeScale);

		// Draw horizontal measure lines
		const measureBoundaries = playerState.loadedMidi!.getMeasureBoundaries(start, start + duration);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
		ctx.lineWidth = 1 / scale;

		for (const boundary of measureBoundaries) {
			const y = boundary * playerState.timeScale;
			ctx.beginPath();
			ctx.moveTo(playerState.lowMidiNumber.x, y);
			ctx.lineTo(playerState.highMidiNumber.x + playerState.highMidiNumber.width, y);
			ctx.stroke();
		}

		// Draw vertical guide lines between B-C and E-F
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 1 / scale; // Thin line that doesn't scale with zoom

		for (let noteNum = playerState.lowNumber; noteNum <= playerState.highNumber; noteNum++) {
			const noteMod = noteNum % 12;
			// Draw line after B (11) and after E (4)
			if (noteMod === 11 || noteMod === 4) {
				const midiNum = new MidiNumber(noteNum);
				const lineX = midiNum.x + midiNum.width;

				ctx.beginPath();
				ctx.moveTo(lineX, start * playerState.timeScale - keyboard.IVORY_HEIGHT);
				ctx.lineTo(lineX, (start + duration) * playerState.timeScale);
				ctx.stroke();
			}
		}

		for (const track of playerState.loadedMidi!.tracks) {
			for (const note of track.notesOnDuring(start - 1, start + duration)) {
				const midiNumber = new MidiNumber(note.number!);

				// Get base color
				const baseColor =
					midiNumber.noteColors[track.index % midiNumber.noteColors.length] || '#95B7DB';

				ctx.strokeStyle = '#202020';
				ctx.lineWidth = midiNumber.width / 16;

				const x = midiNumber.x + ctx.lineWidth / 2;
				const y = note.onSecond! * playerState.timeScale;
				const w = midiNumber.width - ctx.lineWidth;
				const h = note.duration * playerState.timeScale;
				const r = midiNumber.width / 4;

				// Use culori-based gradient for perceptually uniform color manipulation
				const gradient = createHorizontalGradient(ctx, x, w, baseColor);
				ctx.fillStyle = gradient;

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
				draw();
			});
		}
	});

	$effect(() => {
		let idx = Math.floor(playerState.time / duration);
		if (indexParity === (idx % 2 === 0)) {
			idx += 1;
		}
		index = idx;
	});

	$effect(() => {
		// Redraw when any dependencies change (including width/height)
		if (playerState.width > 0 && playerState.height > 0) {
			draw();
		}
	});
</script>

<canvas
	bind:this={canvasRef}
	height={playerState.height}
	width={playerState.width}
	style="transform: translateY({translateY}%)"
></canvas>
