import Midi from './Midi';
import { Event } from './Event';
import type { TextEvent } from './Event';
import { expect, describe, it } from 'vitest';

let midi = new Midi();
let track = midi.createTrack();
let textEvent: TextEvent = {
	deltaTime: 50,
	type: 'meta',
	text: '~',
	subtype: 'text'
};
let event = new Event<TextEvent>(textEvent, track, 480);
(track as any).addEvent(event);

describe('Event', function () {
	it('#new should construct an Event instance', function () {
		expect(event).not.toBe(null);
	});

	it('#midi should return the associated Midi object', function () {
		expect(event.midi).toBe(midi);
	});

	it('#second should return the second of this Event', function () {
		expect(midi.tickToSecond(event.tick)).toBe(0.5);
	});
});
