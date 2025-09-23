import { Event } from './Event';
import type { NoteOnEvent, NoteOffEvent } from './Event';
import type Track from './Track';

export default class Note {
	constructor(
		private readonly onEvent: Event<NoteOnEvent>,
		private readonly offEvent: Event<NoteOffEvent>,
		readonly track: Track
	) {}

	get onTick() {
		return this.onEvent.tick;
	}

	get offTick() {
		return this.offEvent.tick!;
	}

	get midi() {
		return this.track.midi;
	}

	get number() {
		return this.onEvent.raw.noteNumber;
	}

	get onSecond() {
		return this.onEvent.second;
	}

	get offSecond() {
		return this.offEvent.second;
	}

	get duration() {
		return this.offSecond! - this.onSecond!;
	}

	onAt(second: number) {
		return this.onSecond! <= second && second <= this.offSecond!;
	}

	onDuring(onSecond: number, offSecond: number) {
		return this.onSecond! <= offSecond && this.offSecond! >= onSecond;
	}
}
