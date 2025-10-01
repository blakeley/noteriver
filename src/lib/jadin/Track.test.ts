import Track from './Track';
import Midi from './Midi';
import Note from './Note';
import { Event } from './Event';
import type { NoteOnEvent, NoteOffEvent, TextEvent } from './Event';
import { expect, describe, it, beforeEach } from 'vitest';
import * as fs from 'fs';

var cScaleData = fs.readFileSync('./src/lib/jadin/fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

const tick = 0;

describe('Track', function () {
	let rawEvent: TextEvent;
	let rawNoteOnEvent: NoteOnEvent;
	let rawNoteOffEvent: NoteOffEvent;

	beforeEach(function () {
		rawEvent = {
			deltaTime: 60,
			type: 'meta',
			subtype: 'text',
			text: 'text',
		};

		rawNoteOnEvent = {
			deltaTime: 60,
			type: 'channel',
			subtype: 'noteOn',
			noteNumber: 60,
			velocity: 10,
			channel: 1,
		};

		rawNoteOffEvent = {
			type: 'channel',
			subtype: 'noteOff',
			deltaTime: 60,
			noteNumber: 60,
			velocity: 10,
			channel: 1,
		};
	});

	it('#constructor should construct a Track instance given binary track data', function () {
		expect(new Track('\x00\x91\x3e\x34\x00\x81\x3e\x34')).not.toBe(null);
	});

	it('#constructor should construct a Track instance given no arguments', function () {
		expect(new Track()).not.toBe(null);
	});

	it("#addEvent should add an event to this track's array of events", function () {
		const track = new Track();
		const initialLength = track.events.length;
		track.addEvent(rawEvent, tick);
		expect(track.events.length).toBe(initialLength + 1);
	});

	it('#addEvent should associate the event with the track', function () {
		const track = new Track();
		const event = track.addEvent(rawEvent, tick);
		expect(event.track).toBe(track);
	});

	it('#addEvent should create a new note from a noteOn/noteOff pair', function () {
		const track = new Track();
		const initialLength = track.notes.length;
		track.addEvent(rawNoteOnEvent, 1);
		track.addEvent(rawNoteOffEvent, 2);
		expect(track.notes.length).toBe(initialLength + 1);
	});

	it('#addEvent should create new events from a noteOn/noteOff pair', function () {
		const track = new Track();
		expect(track.events.length).toBe(0);

		let initialLength = track.events.length;
		track.addEvent(rawNoteOnEvent, 1);
		track.addEvent(rawNoteOffEvent, 2);
		expect(track.events.length).toBe(initialLength + 2);

		initialLength = track.events.length;
		track.addEvent({ ...rawNoteOnEvent, noteNumber: 72 }, 3);
		track.addEvent({ ...rawNoteOffEvent, noteNumber: 72 }, 4);
		expect(track.events.length).toBe(initialLength + 2);
	});

	it('addEvent should not create a new note from a removed noteOn event', function () {
		const track = new Track();
		track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 1);
		track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 2);
		track.addEvent({ ...rawNoteOffEvent, noteNumber: 60 }, 3);
		expect(track.events[0]).toBe(track.notes[0]['onEvent']);
	});

	it('#addEvent should ignore unpaired noteOff events', function () {
		const track = new Track();
		let initialLength = track.events.length;
		track.addEvent(rawNoteOffEvent, 0);
		expect(track.events.length).toBe(initialLength);

		initialLength = track.events.length;
		track.addEvent(rawNoteOnEvent, 0);
		track.addEvent({ ...rawNoteOffEvent, noteNumber: 72 }, 0);
		expect(track.events.length).toBe(initialLength + 1);
	});

	it('#patch should return the patch number for this track', function () {
		const track = new Track();
		expect(track.patch).toBe(0);

		track.addEvent(
			{
				deltaTime: 60,
				type: 'channel',
				channel: 0,
				subtype: 'programChange',
				value: 8,
			},
			0,
		);

		expect(track.patch).toBe(8);
	});

	it('#removeEvent should remove the given event from the events array', function () {
		const track = new Track();
		track.addEvent({ ...rawEvent }, 1);
		const removed = track.addEvent(rawEvent, 2);
		track.addEvent({ ...rawEvent }, 3);
		const initialLength = track.events.length;
		track.removeEvent(removed);
		expect(track.events.length).toBe(initialLength - 1);
	});

	it('#constructor should remove unpaired noteOn events', function () {
		const track = new Track('\x00\x91\x3e\x34');
		expect(track.events.length).toBe(0);
	});

	it('#events should return an array of all events', function () {
		expect(cScaleMidi.tracks[0].events).not.toBeUndefined();
		expect(cScaleMidi.tracks[0].events.length).toBe(6);
		expect(cScaleMidi.tracks[1].events.length).toBe(11);
	});

	it('#notes should return an array of all notes', function () {
		expect(cScaleMidi.tracks[1].notes).not.toBeUndefined();
		expect(cScaleMidi.tracks[1].notes.length).toBe(4);
		expect(cScaleMidi.tracks[1].notes[0].constructor).toBe(Note);
	});

	it('#midi should return the associated Midi object', function () {
		expect(cScaleMidi.tracks[1].midi).toBe(cScaleMidi);
	});

	it('#index should return the index of this track', function () {
		expect(cScaleMidi.tracks[0].index).toBe(0);
		expect(cScaleMidi.tracks[1].index).toBe(1);
		expect(cScaleMidi.tracks[2].index).toBe(2);
	});

	it('#notesOnAt should return the notes on this track which are on at the given time', function () {
		expect(cScaleMidi.tracks[2].notesOnAt(-1).length).toBe(0);
		expect(cScaleMidi.tracks[2].notesOnAt(0.5).length).toBe(2);
		expect(cScaleMidi.tracks[2].notesOnAt(0.5)[0]).toBe(cScaleMidi.tracks[2].notes[0]);
		expect(cScaleMidi.tracks[2].notesOnAt(1.9375).length).toBe(1);
		expect(cScaleMidi.tracks[1].notesOnAt(1.9375).length).toBe(1);
	});

	it('#index should return the index of this track', function () {
		expect(cScaleMidi.tracks[0].index).toBe(0);
		expect(cScaleMidi.tracks[1].index).toBe(1);
		expect(cScaleMidi.tracks[2].index).toBe(2);
	});

	it('#notesOnDuring should return the notes on this track which are on during the given time range', function () {
		expect(cScaleMidi.tracks[2].notesOnDuring(-2, -1).length).toBe(0);
		expect(cScaleMidi.tracks[2].notesOnDuring(0, 0.75).length).toBe(2);
		expect(cScaleMidi.tracks[2].notesOnDuring(0, 0.75)[0]).toBe(cScaleMidi.tracks[2].notes[0]);
		expect(cScaleMidi.tracks[2].notesOnDuring(0, 2).length).toBe(4);
	});
});
