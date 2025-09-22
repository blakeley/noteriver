import Midi from './Midi';
import { expect, describe, it } from 'vitest';
import * as fs from 'fs';
import Cursor from './Cursor';

const cScaleBinaryString = fs.readFileSync('./src/lib/jadin/fixtures/c.mid', 'binary');
const cScaleMidi = new Midi(cScaleBinaryString);

describe('Midi', function () {
	describe('#constructor', () => {
		it('constructs a Midi instance given an array buffer', () => {});

		it('constructs a Midi instance given a binary string', function () {
			expect(cScaleMidi).not.toBe(null);
		});

		it('constructs a default Midi instance given no arguments', function () {
			const defaultMidi = new Midi();
			expect(defaultMidi).not.toBe(null);
			expect(defaultMidi.format).toBe(0);
			expect(defaultMidi.ppqn).toBe(480);
			expect(defaultMidi.notes).not.toBe(null);
			expect(defaultMidi.notesOnAt(0)).not.toBe(null);
			expect(defaultMidi.duration).toBe(0);
			expect(defaultMidi.tickToSecond(960)).toBe(1);
		});
	});

	it('#format should return the MIDI format', function () {
		expect(cScaleMidi.format).toBe(1);
	});

	it('#ppqn should return the number of pulses per quarter note', function () {
		expect(cScaleMidi.ppqn).toBe(480);
	});

	it('#tracks should return an array of all tracks', function () {
		expect(cScaleMidi.tracks.length).toBe(3);
	});

	it('#createTrack should create a new Track', function () {
		const defaultMidi = new Midi();
		expect(defaultMidi.tracks.length).toBe(1);
		defaultMidi.createTrack();
		expect(defaultMidi.tracks.length).toBe(2);
	});

	it('#events should return an array of all events', function () {
		expect(cScaleMidi.events).not.toBeUndefined();
		expect(cScaleMidi.events.length).toBe(28);
	});

	it('#events.@each.tick should return the MIDI tick at which this event starts', function () {
		expect(cScaleMidi.events[0].tick).toBe(0);
		expect(cScaleMidi.events[6].tick).toBe(0);
		expect(cScaleMidi.events[8].tick).toBe(1920);
		expect(cScaleMidi.events[9].tick).toBe(2400);
		expect(cScaleMidi.events[10].tick).toBe(2400);
		expect(cScaleMidi.events[11].tick).toBe(2880);
		expect(cScaleMidi.events[17].tick).toBe(0);
		expect(cScaleMidi.events[20].tick).toBe(480);
	});

	it('#notes should return an array of all notes', function () {
		expect(cScaleMidi.notes).not.toBeUndefined();
		expect(cScaleMidi.notes.length).toBe(8);
	});

	it('#tickToSecond should convert a MIDI ticks to playback seconds', function () {
		expect(cScaleMidi.tickToSecond(0)).toBe(0);
		expect(cScaleMidi.tickToSecond(480)).toBe(0.5);
		expect(cScaleMidi.tickToSecond(960)).toBe(1.0);
		expect(cScaleMidi.tickToSecond(1200)).toBe(1.25);
	});

	it('#tickToSecond should account for tempo changes', function () {
		expect(cScaleMidi.tickToSecond(1920)).toBe(1.9375);
		expect(cScaleMidi.tickToSecond(2400)).toBe(2.1875);
		expect(cScaleMidi.tickToSecond(4800)).toBe(3.4375);
		expect(cScaleMidi.tickToSecond(48000)).toBe(25.9375);
	});

	it('#tickToSecond should be memoized', function () {
		expect(cScaleMidi.tickToSecond(960)).toBe(1.0);
		expect(cScaleMidi.tickToSecond(960)).toBe(1.0);
		expect(cScaleMidi['_tickToSecond'][960]).toBe(1.0);
	});

	it('#tempoEvents should return all setTempo events', function () {
		expect(cScaleMidi.tempoEvents).not.toBeUndefined();
		expect(cScaleMidi.tempoEvents.length).toBe(2);
	});

	it('#duration should return the duration of this Midi in seconds', function () {
		expect(cScaleMidi.duration).toBe(2.9375);
	});

	it('#notesOnAt should return all notes on at the given second', function () {
		expect(cScaleMidi.notesOnAt(-1).length).toBe(0);
		expect(cScaleMidi.notesOnAt(0.5).length).toBe(2);
		expect(cScaleMidi.notesOnAt(0.5)[0]).toBe(cScaleMidi.tracks[2].notes[0]);
		expect(cScaleMidi.notesOnAt(1.9375).length).toBe(2);
		expect(cScaleMidi.notesOnAt(1.9375)[0]).toBe(cScaleMidi.tracks[1].notes[0]);
		expect(cScaleMidi.notesOnAt(1.9375)[1]).toBe(cScaleMidi.tracks[2].notes[3]);
	});

	it('#notesOnDuring should return all notes on at the given second', function () {
		expect(cScaleMidi.notesOnDuring(-2, -1).length).toBe(0);
		expect(cScaleMidi.notesOnDuring(0, 0.75).length).toBe(2);
		expect(cScaleMidi.notesOnDuring(0, 0.75)[0]).toBe(cScaleMidi.tracks[2].notes[0]);
		expect(cScaleMidi.notesOnDuring(0, 2).length).toBe(5);
		expect(cScaleMidi.notesOnDuring(0, 2)[0]).toBe(cScaleMidi.tracks[1].notes[0]);
		expect(cScaleMidi.notesOnDuring(0, 2)[1]).toBe(cScaleMidi.tracks[2].notes[0]);
	});

	it('#newCursor should create a new cursor', function () {
		expect(cScaleMidi.newCursor()).toBeInstanceOf(Cursor);
	});

	it('#newCursor should order its events by ascending tick', function () {
		const cursor = cScaleMidi.newCursor();

		expect(cursor['events'][0].tick!).toBeLessThanOrEqual(cursor['events'][1].tick!);
		expect(cursor['events'][1].tick!).toBeLessThanOrEqual(cursor['events'][2].tick!);
		expect(cursor['events'][2].tick!).toBeLessThanOrEqual(cursor['events'][3].tick!);
	});
});
