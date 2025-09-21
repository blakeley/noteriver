<script lang="ts">
	import { onMount } from 'svelte';
	import type * as jadin from 'jadin';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';

	interface TimeSignatureChange {
		second: number;
		numerator: number;
		denominator: number;
		beatsPerMeasure: number;
	}

	interface TempoChange {
		second: number;
		bpm: number;
	}

	function getMeasureBoundaries(midi: jadin.Midi, startTime: number, endTime: number): number[] {
		const boundaries: number[] = [];

		// Extract time signatures from events
		const timeSignatures: TimeSignatureChange[] = [];
		const tempoChanges: TempoChange[] = [];

		// Get tempo events (already provided by jadin)
		for (const event of midi.tempoEvents) {
			const bpm = 60000000 / event.raw.microsecondsPerBeat;
			tempoChanges.push({
				second: event.second,
				bpm: bpm
			});
		}

		// Get time signature events from all events
		for (const event of midi.events) {
			if (event.raw.type === 'meta' && event.raw.subtype === 'timeSignature') {
				const tsEvent = event.raw as jadin.TimeSignatureEvent;
				timeSignatures.push({
					second: event.second,
					numerator: tsEvent.numerator,
					denominator: tsEvent.denominator,
					beatsPerMeasure: tsEvent.numerator
				});
			}
		}

		// Default values if none found
		if (timeSignatures.length === 0) {
			timeSignatures.push({
				second: 0,
				numerator: 4,
				denominator: 4,
				beatsPerMeasure: 4
			});
		}
		if (tempoChanges.length === 0) {
			tempoChanges.push({
				second: 0,
				bpm: 120
			});
		}

		// Calculate measure boundaries
		let currentTime = 0;
		let currentTsIndex = 0;
		let currentTempoIndex = 0;

		while (currentTime < endTime) {
			// Update indices if we've passed a change point
			while (
				currentTsIndex < timeSignatures.length - 1 &&
				timeSignatures[currentTsIndex + 1].second <= currentTime
			) {
				currentTsIndex++;
			}
			while (
				currentTempoIndex < tempoChanges.length - 1 &&
				tempoChanges[currentTempoIndex + 1].second <= currentTime
			) {
				currentTempoIndex++;
			}

			const currentTs = timeSignatures[currentTsIndex];
			const currentTempo = tempoChanges[currentTempoIndex];

			// Calculate measure duration in seconds
			const measureDuration = (currentTs.beatsPerMeasure / currentTempo.bpm) * 60;

			// Add boundary if within range
			if (currentTime >= startTime && currentTime <= endTime) {
				boundaries.push(currentTime);
			}

			currentTime += measureDuration;
		}

		return boundaries;
	}

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

		// Draw horizontal measure lines
		const measureBoundaries = getMeasureBoundaries(midi, start, start + duration);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
		ctx.lineWidth = 1 / scale;

		for (const boundary of measureBoundaries) {
			const y = boundary * timeScale;
			ctx.beginPath();
			ctx.moveTo(lowMidiNumber.x, y);
			ctx.lineTo(highMidiNumber.x + highMidiNumber.width, y);
			ctx.stroke();
		}

		// Draw vertical guide lines between B-C and E-F
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 1 / scale; // Thin line that doesn't scale with zoom

		for (let noteNum = lowNumber; noteNum <= highNumber; noteNum++) {
			const noteMod = noteNum % 12;
			// Draw line after B (11) and after E (4)
			if (noteMod === 11 || noteMod === 4) {
				const midiNum = new MidiNumber(noteNum);
				const lineX = midiNum.x + midiNum.width;

				ctx.beginPath();
				ctx.moveTo(lineX, start * timeScale - keyboard.IVORY_HEIGHT);
				ctx.lineTo(lineX, (start + duration) * timeScale);
				ctx.stroke();
			}
		}

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
