import MidiReader from './MidiReader';
import Track from './Track';
import Cursor from './Cursor';
import { Event } from './Event';
import type { RawEvent, SetTempoEvent, TimeSignatureEvent } from './Event';
import type Note from './Note';

declare global {
	interface Array<T> {
		last(): T | undefined;
	}
}

Array.prototype.last = function () {
	return this[this.length - 1];
};

export default class Midi {
	format: number;
	ppqn: number;
	tracks: Track[];
	private _tickToSecond: { [key: number]: number };
	private _tempoEvents: Event<SetTempoEvent>[];

	constructor(data?: string) {
		this.format = 0;
		this.ppqn = 480;
		this.tracks = [];
		this._tickToSecond = {};
		this._tempoEvents = [];

		if (!!data) {
			const reader = new MidiReader(data);

			const headerChunk = reader.readChunk();
			const headerReader = new MidiReader(headerChunk.data);
			this.format = headerReader.readInt(2);
			if (this.format == 2) throw 'MIDI format 2 not supported';
			const numberOfTracks = headerReader.readInt(2);
			this.ppqn = headerReader.readInt(2); // assumes metrical timing

			for (let i = 0; i < numberOfTracks; i++) {
				const trackChunk = reader.readChunk();
				this.createTrack(trackChunk.data);
			}
		} else {
			const tempoTrack = this.createTrack();
		}
	}

	createTrack(data?: string) {
		const track = new Track(data);
		track.midi = this;
		this.tracks.push(track);
		return track;
	}

	newCursor() {
		return new Cursor(this.events.sort((e1, e2) => e1.tick! - e2.tick!));
	}

	get notes() {
		return this.tracks.map((track) => track.notes).reduce((a, b) => a.concat(b));
	}

	get events() {
		return this.tracks.map((track) => track.events).reduce((a, b) => a.concat(b));
		//.sort((e1,e2) => e1.tick < e2.tick);
	}

	get tempoEvents(): Event<SetTempoEvent>[] {
		if (this._tempoEvents.length > 0) return this._tempoEvents; // return if memoized

		function isSetTempoEvent(event: Event<RawEvent>): event is Event<SetTempoEvent> {
			return event.raw.type === 'meta' && event.raw.subtype === 'setTempo';
		}

		// format 0: All events are on the zeroth track, including tempo events
		// format 1: All tempo events are on the zeroth track
		// format 2: Every track has tempo events (not supported)
		return this.tracks[0].events.filter(isSetTempoEvent);
	}

	get duration() {
		return Math.max(...this.tracks.map((track) => track.notes.last()?.offSecond || 0));
	}

	tickToSecond(tick: number) {
		if (tick === 0) return 0;
		if (this._tickToSecond[tick]) return this._tickToSecond[tick];

		let mostRecentSetTempoEvent: Event<SetTempoEvent> = new Event(
			{
				type: 'meta',
				subtype: 'setTempo',
				deltaTime: 0,
				microsecondsPerBeat: 500_000
			},
			this.tracks[0],
			0
		);

		for (let setTempoEvent of this.tempoEvents) {
			if (setTempoEvent.tick < tick) {
				mostRecentSetTempoEvent = setTempoEvent;
			} else {
				break;
			}
		}

		const totalSeconds =
			mostRecentSetTempoEvent.second +
			(((tick - mostRecentSetTempoEvent.tick) / this.ppqn) *
				mostRecentSetTempoEvent.raw.microsecondsPerBeat) /
				1_000_000.0;
		this._tickToSecond[tick] = totalSeconds;

		return totalSeconds;
	}

	notesOnAt(second: number): Note[] {
		return [].concat(...(this.tracks.map((track) => track.notesOnAt(second)) as any));
	}

	notesOnDuring(onSecond: number, offSecond: number): Note[] {
		return [].concat(
			...(this.tracks.map((track) => track.notesOnDuring(onSecond, offSecond)) as any)
		);
	}

	getMeasureBoundaries(startTime: number, endTime: number) {
		const boundaries = [];
		const timeSignatures = [];
		const tempoChanges = [];

		// Get tempo events
		for (const event of this.tempoEvents) {
			const bpm = 60000000 / event.raw.microsecondsPerBeat;
			tempoChanges.push({
				second: event.second,
				bpm: bpm
			});
		}

		// Get time signature events from all events
		for (const event of this.events) {
			if (event.raw.type === 'meta' && event.raw.subtype === 'timeSignature') {
				const tsEvent = event.raw as TimeSignatureEvent;
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

			if (!currentTs || !currentTempo) break;

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
}
