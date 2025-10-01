import type * as jadin from 'jadin';
import { Keyboard, MidiNumber } from './keyboard';
import { createHorizontalGradient } from '$lib/utils/colorGradient';

interface DrawOptions {
	ctx: CanvasRenderingContext2D;
	midi: jadin.Midi;
	startTime: number;
	endTime: number;
	width: number;
	height: number;
	lowNumber?: number;
	highNumber?: number;
	timeScale?: number;
	showGridLines?: boolean;
}

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
			bpm: bpm,
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
				beatsPerMeasure: tsEvent.numerator,
			});
		}
	}

	// Default values if none found
	if (timeSignatures.length === 0) {
		timeSignatures.push({
			second: 0,
			numerator: 4,
			denominator: 4,
			beatsPerMeasure: 4,
		});
	}
	if (tempoChanges.length === 0) {
		tempoChanges.push({
			second: 0,
			bpm: 120,
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
		const measureDuration = (currentTs!.beatsPerMeasure / currentTempo!.bpm) * 60;

		// Add boundary if within range
		if (currentTime >= startTime && currentTime <= endTime) {
			boundaries.push(currentTime);
		}

		currentTime += measureDuration;
	}

	return boundaries;
}

export function drawPianoRoll({
	ctx,
	midi,
	startTime,
	endTime,
	width,
	height,
	lowNumber = 21,
	highNumber = 108,
	timeScale = 10,
	showGridLines = true,
}: DrawOptions) {
	const lowMidiNumber = new MidiNumber(lowNumber);
	const highMidiNumber = new MidiNumber(highNumber);

	// Calculate scale to fit the piano roll in the canvas
	const pianoWidth = highMidiNumber.x - lowMidiNumber.x + highMidiNumber.width;
	const scale = width / pianoWidth;

	// Clear and setup canvas transform
	ctx.resetTransform();
	ctx.clearRect(0, 0, width, height);

	// Set up coordinate system: flip Y axis and position
	ctx.translate(0, height);
	ctx.scale(scale, -scale);
	ctx.translate(-lowMidiNumber.x, 0);
	ctx.translate(0, Keyboard.IVORY_HEIGHT);
	ctx.translate(0, -startTime * timeScale);

	// Only draw grid lines if enabled
	if (showGridLines) {
		// Draw horizontal measure lines
		const measureBoundaries = getMeasureBoundaries(midi, startTime, endTime);
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
				ctx.moveTo(lineX, startTime * timeScale - Keyboard.IVORY_HEIGHT);
				ctx.lineTo(lineX, endTime * timeScale);
				ctx.stroke();
			}
		}
	}

	// Draw all notes in the time range
	for (const track of midi.tracks) {
		for (const note of track.notesOnDuring(startTime - 1, endTime + 1)) {
			const midiNumber = new MidiNumber(note.number!);

			// Get base color
			const baseColor =
				midiNumber.noteColors[track.index % midiNumber.noteColors.length] || '#95B7DB';

			ctx.strokeStyle = '#202020';
			ctx.lineWidth = midiNumber.width / 16;

			// Calculate note position and dimensions
			const x = midiNumber.x + ctx.lineWidth / 2;
			const y = note.onSecond! * timeScale;
			const w = midiNumber.width - ctx.lineWidth;
			const h = note.duration * timeScale;
			const r = midiNumber.width / 4;

			// Use culori-based gradient for perceptually uniform color manipulation
			const gradient = createHorizontalGradient(ctx, x, w, baseColor);
			ctx.fillStyle = gradient;

			// Draw rounded rectangle for the note
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
