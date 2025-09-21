import type * as jadin from 'jadin';
import { keyboard, MidiNumber } from './keyboard';

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
	timeScale = 10
}: DrawOptions) {
	const lowMidiNumber = new MidiNumber(lowNumber);
	const highMidiNumber = new MidiNumber(highNumber);

	// Calculate scale to fit the piano roll in the canvas
	const pianoWidth = highMidiNumber.x - lowMidiNumber.x + highMidiNumber.width;
	const scale = width / pianoWidth;
	const duration = endTime - startTime;

	// Clear and setup canvas transform
	ctx.resetTransform();
	ctx.clearRect(0, 0, width, height);

	// Set up coordinate system: flip Y axis and position
	ctx.translate(0, height);
	ctx.scale(scale, -scale);
	ctx.translate(-lowMidiNumber.x, 0);
	ctx.translate(0, keyboard.IVORY_HEIGHT);
	ctx.translate(0, -startTime * timeScale);

	// Draw all notes in the time range
	for (const track of midi.tracks) {
		for (const note of track.notesOnDuring(startTime - 1, endTime + 1)) {
			const midiNumber = new MidiNumber(note.number!);

			// Set colors
			ctx.fillStyle =
				midiNumber.noteColors[track.index % midiNumber.noteColors.length] || '#95B7DB';
			ctx.strokeStyle = '#202020';
			ctx.lineWidth = midiNumber.width / 16;

			// Calculate note position and dimensions
			const x = midiNumber.x + ctx.lineWidth / 2;
			const y = note.onSecond! * timeScale;
			const w = midiNumber.width - ctx.lineWidth;
			const h = note.duration * timeScale;
			const r = midiNumber.width / 4;

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
