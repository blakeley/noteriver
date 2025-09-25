export class MidiNumber {
	number: number;

	constructor(number: number) {
		this.number = number;
	}

	get isC() {
		return this.number % 12 === 0;
	}

	get isF() {
		return this.number % 12 === 5;
	}

	get isEbony() {
		return [1, 3, 6, 8, 10].includes(this.number % 12);
	}

	get isIvory() {
		return !this.isEbony;
	}

	get width() {
		return this.isIvory ? keyboard.IVORY_WIDTH : keyboard.EBONY_WIDTH;
	}

	get offset() {
		return (
			Math.floor(this.number / 12) * keyboard.IVORY_WIDTH * 7 +
			(keyboard.OFFSETS[this.number % 12] || 0)
		);
	}

	get x() {
		return this.offset;
	}

	get noteColors() {
		return this.isIvory ? keyboard.IVORY_NOTE_COLORS : keyboard.EBONY_NOTE_COLORS;
	}

	get keyColors() {
		return this.isIvory ? keyboard.IVORY_KEY_COLORS : keyboard.EBONY_KEY_COLORS;
	}
}

export class Keyboard {
	IVORY_WIDTH = 24 / 24;
	EBONY_WIDTH = 14 / 24;
	IVORY_HEIGHT = 132 / 24; // IVORY_WIDTH * 5.5
	EBONY_HEIGHT = 77 / 24; // EBONY_WIDTH * 5.5
	IVORY_THICKNESS = 20 / 24;
	EBONY_THICKNESS = 11.5 / 24;
	EBONY_ELEVATION = 10 / 24;
	OFFSETS = [0, 15, 24, 44, 48, 72, 85, 96, 113, 120, 141, 144].map((offset) => offset / 24);
	MIDI_NUMBERS = [
		21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
		45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68,
		69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
		93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108
	].map((number) => new MidiNumber(number));
	IVORY_KEY_COLORS = ['#729FCF', '#8AE234', '#FCEB57', '#FCAF3E', '#EE5E5E', '#AD68B4'];
	EBONY_KEY_COLORS = ['#3768A5', '#569D11', '#DAC300', '#F57900', '#E93131', '#6C4C71'];
	IVORY_NOTE_COLORS = ['#95B7DB', '#AAEA6A', '#FCF084', '#FCC36E', '#F28989', '#CCA1D0'];
	EBONY_NOTE_COLORS = ['#4975AE', '#6AA92D', '#E2D038', '#F79433', '#ED5656', '#8A708D'];
	IVORY_MIDI_NUMBERS = this.MIDI_NUMBERS.filter((midiNumber) => midiNumber.isIvory);
	EBONY_MIDI_NUMBERS = this.MIDI_NUMBERS.filter((midiNumber) => midiNumber.isEbony);
	C_MIDI_NUMBERS = this.MIDI_NUMBERS.filter((midiNumber) => midiNumber.isC);
	F_MIDI_NUMBERS = this.MIDI_NUMBERS.filter((midiNumber) => midiNumber.isF);
}

export const keyboard = new Keyboard();
