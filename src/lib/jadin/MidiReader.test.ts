import {
	SequenceNumberEvent,
	ProgramNameEvent,
	DeviceNameEvent,
	TextEvent,
	CopyrightNoticeEvent,
	TrackNameEvent,
	InstrumentNameEvent,
	LyricsEvent,
	MarkerEvent,
	CuePointEvent,
	ChannelPrefixEvent,
	PortPrefixEvent,
	EndOfTrackEvent,
	SetTempoEvent,
	SmpteOffsetEvent,
	TimeSignatureEvent,
	KeySignatureEvent,
	SequencerSpecificEvent,
	SysExEvent,
	NoteOffEvent,
	NoteOnEvent,
	NoteAftertouchEvent,
	ControllerEvent,
	ProgramChangeEvent,
	ChannelAftertouchEvent,
	PitchBendEvent
} from './event';

import MidiReader from './MidiReader';
import { expect, describe, it } from 'vitest';
import * as fs from 'fs';

const cScaleData = fs.readFileSync('./src/lib/jadin/fixtures/c.mid', 'binary');

describe('MidiReader', function () {
	it('should construct a MidiReader instance', function () {
		const cScaleMidiReader = new MidiReader(cScaleData);
		expect(cScaleMidiReader).not.toBe(null);
	});

	it('#read should read and return the requested number of bytes', function () {
		const reader = new MidiReader('MThd\x00etc.');
		expect(reader.read(4)).toBe('MThd');
		expect(reader.position).toBe(4);
		expect(reader.read(1)).toBe('\x00');
		expect(reader.position).toBe(5);
	});

	it('#readInt(1) should read an the next byte as an 8-bit integer', function () {
		const reader = new MidiReader('\x00\x01\x02\x03');
		expect(reader.readInt(1)).toBe(0);
		expect(reader.position).toBe(1);
		expect(reader.readInt(1)).toBe(1);
		expect(reader.position).toBe(2);
		expect(reader.readInt(1)).toBe(2);
		expect(reader.readInt(1)).toBe(3);
	});

	it('#readInt(2) should read the next 2 bytes as a 16-bit integer', function () {
		const reader = new MidiReader('\x00\x01\x02\x03');
		expect(reader.readInt(2)).toBe(1);
		expect(reader.position).toBe(2);
		expect(reader.readInt(2)).toBe(2 * 256 + 3);
		expect(reader.position).toBe(4);
	});

	it('#readInt(3) should read the next 3 bytes as a 24-bit integer', function () {
		const reader = new MidiReader('\x00\x00\x00\x01\x02\x03');
		expect(reader.readInt(3)).toBe(0);
		expect(reader.position).toBe(3);
		expect(reader.readInt(3)).toBe(1 * 256 * 256 + 2 * 256 + 3);
		expect(reader.position).toBe(6);
	});

	it('#readInt(4) should read the next 4 bytes as a 32-bit integer', function () {
		const reader = new MidiReader('\x00\x00\x00\x00\x01\x02\x03\x04');
		expect(reader.readInt(4)).toBe(0);
		expect(reader.position).toBe(4);
		expect(reader.readInt(4)).toBe(16909060);
		expect(reader.position).toBe(8);
	});

	it('#readVLQ should read the next constiable number of bytes as a constiable length quantity', function () {
		const reader = new MidiReader('\x00\x08\x81\x00\x86\xc3\x17');
		expect(reader.readVLQ()).toBe(0);
		expect(reader.position).toBe(1);
		expect(reader.readVLQ()).toBe(8);
		expect(reader.position).toBe(2);
		expect(reader.readVLQ()).toBe(128);
		expect(reader.position).toBe(4);
		expect(reader.readVLQ()).toBe(106903);
		expect(reader.position).toBe(7);
	});

	it('#readChunk should read a MIDI "chunk"', function () {
		const cScaleMidiReader = new MidiReader(cScaleData);
		const chunk = cScaleMidiReader.readChunk();
		expect(chunk.type).toBe('MThd');
		expect(chunk.length).toBe(6);
		expect(chunk.data).toBe('\x00\x01\x00\x03\x01à');
		expect(cScaleMidiReader.position).toBe(14);
	});

	it('#isAtEndOfFile should return false before reading the entire file', function () {
		const cScaleMidiReader = new MidiReader(cScaleData);
		expect(cScaleMidiReader.isAtEndOfFile()).toBe(false);
		const header = cScaleMidiReader.readChunk();
		expect(cScaleMidiReader.isAtEndOfFile()).toBe(false);
		const track1 = cScaleMidiReader.readChunk();
		expect(cScaleMidiReader.isAtEndOfFile()).toBe(false);
		const track2 = cScaleMidiReader.readChunk();
		expect(cScaleMidiReader.isAtEndOfFile()).toBe(false);
	});

	it('#isAtEndOfFile should return true after reading the entire file', function () {
		const cScaleMidiReader = new MidiReader(cScaleData);
		const header = cScaleMidiReader.readChunk();
		const track1 = cScaleMidiReader.readChunk();
		const track2 = cScaleMidiReader.readChunk();
		const finalTrack = cScaleMidiReader.readChunk();
		expect(cScaleMidiReader.isAtEndOfFile()).toBe(true);
	});

	it('#readEvent should read a noteOff event', function () {
		// deltaTime, 8n, number, velocity
		const reader = new MidiReader('\x00\x81\x3c\x32');
		const event = reader.readEvent() as NoteOffEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('noteOff');
		expect(event.channel).toBe(1);
		expect(event.noteNumber).toBe(60);
		expect(event.velocity).toBe(50);
	});

	it('#readEvent should read a noteOff event during a running status', function () {
		const reader = new MidiReader('\x00\x81\x3c\x32\x01\x3d\x33');
		reader.readEvent()!;
		const event = reader.readEvent() as NoteOffEvent;
		expect(event.deltaTime).toBe(1);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('noteOff');
		expect(event.channel).toBe(1);
		expect(event.noteNumber).toBe(61);
		expect(event.velocity).toBe(51);
	});

	it('#readEvent should read a noteOn event', function () {
		// deltaTime, 9n, number, velocity
		const reader = new MidiReader('\x00\x91\x3e\x34');
		const event = reader.readEvent() as NoteOnEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('noteOn');
		expect(event.channel).toBe(1);
		expect(event.noteNumber).toBe(62);
		expect(event.velocity).toBe(52);
	});

	it('#readEvent should read a noteOn event with velocity zero as a noteOff event', function () {
		const reader = new MidiReader('\x00\x91\x3f\x00');
		const event = reader.readEvent() as NoteOffEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('noteOff');
		expect(event.channel).toBe(1);
		expect(event.noteNumber).toBe(63);
		expect(event.velocity).toBe(0);
	});

	it('#readEvent should read an noteAftertouch event', function () {
		// deltaTime, an, number, pressure
		const reader = new MidiReader('\x00\xa1\x40\x35');
		const event = reader.readEvent() as NoteAftertouchEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('noteAftertouch');
		expect(event.channel).toBe(1);
		expect(event.noteNumber).toBe(64);
		expect(event.amount).toBe(53);
	});

	it('#readEvent should read a controller event', function () {
		// deltaTime, bn, controller, value
		const reader = new MidiReader('\x00\xb1\x41\x36');
		const event = reader.readEvent() as ControllerEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('controller');
		expect(event.controllerType).toBe(65);
		expect(event.value).toBe(54);
	});

	it('#readEvent should read a programChange event', function () {
		// deltaTime, cn, program
		const reader = new MidiReader('\x00\xc1\x42');
		const event = reader.readEvent() as ProgramChangeEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('programChange');
		expect(event.value).toBe(66);
	});

	it('#readEvent should read a channelPressure event', function () {
		// deltaTime, dn, pressure
		const reader = new MidiReader('\x00\xd1\x43');
		const event = reader.readEvent() as ChannelAftertouchEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('channelAftertouch');
		expect(event.amount).toBe(67);
	});

	it('#readEvent should read a pitchBend event', function () {
		// deltaTime, en, lsb, msb
		const reader = new MidiReader('\x00\xe1\x05\x03');
		const event = reader.readEvent() as PitchBendEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('channel');
		expect(event.subtype).toBe('pitchBend');
		expect(event.value).toBe(389);
	});

	it('#readEvent should read a sequenceNumber meta event', function () {
		const reader = new MidiReader('\x00\xff\x00\x02\x01\x03');
		const event = reader.readEvent() as SequenceNumberEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('sequenceNumber');
		expect(event.number).toBe(259);
	});

	it('#readEvent should read a text meta event', function () {
		const reader = new MidiReader('\x00\xff\x01\x09some text');
		const event = reader.readEvent() as TextEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('text');
		expect(event.text).toBe('some text');
	});

	it('#readEvent should read a copyright meta event', function () {
		const reader = new MidiReader('\x00\xff\x02\x0f© Noteriver.com');
		const event = reader.readEvent() as CopyrightNoticeEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('copyrightNotice');
		expect(event.text).toBe('© Noteriver.com');
	});

	it('#readEvent should read a trackName meta event', function () {
		const reader = new MidiReader('\x00\xff\x03\x0eUnknown Song 1');
		const event = reader.readEvent() as TrackNameEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('trackName');
		expect(event.text).toBe('Unknown Song 1');
	});

	it('#readEvent should read an instrumentName meta event', function () {
		const reader = new MidiReader('\x00\xff\x04\x07Cowbell');
		const event = reader.readEvent() as InstrumentNameEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('instrumentName');
		expect(event.text).toBe('Cowbell');
	});

	it('#readEvent should read a lyric meta event', function () {
		const reader = new MidiReader('\x00\xff\x05\x04hey!');
		const event = reader.readEvent() as LyricsEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('lyrics');
		expect(event.text).toBe('hey!');
	});

	it('#readEvent should read a marker meta event', function () {
		const reader = new MidiReader('\x00\xff\x06\x05Verse');
		const event = reader.readEvent() as MarkerEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('marker');
		expect(event.text).toBe('Verse');
	});

	it('#readEvent should read a cuePoint meta event', function () {
		const reader = new MidiReader('\x00\xff\x07\x05Solo');
		const event = reader.readEvent() as CuePointEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('cuePoint');
		expect(event.text).toBe('Solo');
	});

	it('#readEvent should read a programName meta event', function () {
		const reader = new MidiReader('\x00\xff\x08\x08drum kit');
		const event = reader.readEvent() as ProgramNameEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('programName');
		expect(event.text).toBe('drum kit');
	});

	it('#readEvent should read a deviceName meta event', function () {
		const reader = new MidiReader('\x00\xff\x09\x05Casio');
		const event = reader.readEvent() as DeviceNameEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('deviceName');
		expect(event.text).toBe('Casio');
	});

	it('#readEvent should read a channelPrefix meta event', function () {
		const reader = new MidiReader('\x00\xff\x20\x01\x02');
		const event = reader.readEvent() as ChannelPrefixEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('channelPrefix');
		expect(event.channel).toBe(2);
	});

	it('#readEvent should read a portPrefix meta event', function () {
		const reader = new MidiReader('\x00\xff\x21\x01\x03');
		const event = reader.readEvent() as PortPrefixEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('portPrefix');
		expect(event.port).toBe(3);
	});

	it('#readEvent should read an endOfTrack meta event', function () {
		const reader = new MidiReader('\x00\xff\x2f\x00');
		const event = reader.readEvent() as EndOfTrackEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('endOfTrack');
	});

	it('#readEvent should read a setTempo meta event', function () {
		const reader = new MidiReader('\x00\xff\x51\x03\x07\xA1\x20');
		const event = reader.readEvent() as SetTempoEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('setTempo');
		expect(event.microsecondsPerBeat).toBe(500000);
	});

	it('#readEvent should read a smpteOffset meta event', function () {
		const reader = new MidiReader('\x00\xff\x54\x05\xc1\x02\x03\x04\x05');
		const event = reader.readEvent() as SmpteOffsetEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('smpteOffset');
		expect(event.frameRate).toBe(30);
		expect(event.hours).toBe(1);
		expect(event.minutes).toBe(2);
		expect(event.seconds).toBe(3);
		expect(event.frames).toBe(4);
		expect(event.subframes).toBe(5);
	});

	it('#readEvent should read a timeSignature meta event', function () {
		const reader = new MidiReader('\x00\xff\x58\x04\x03\x02\x18\x08');
		const event = reader.readEvent() as TimeSignatureEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('timeSignature');
		expect(event.numerator).toBe(3);
		expect(event.denominator).toBe(4);
		expect(event.metronome).toBe(24);
		expect(event.thirtySeconds).toBe(8);
	});

	it('#readEvent should read a keySignature meta event', function () {
		const reader = new MidiReader('\x00\xff\x59\x02\x83\x01');
		const event = reader.readEvent() as KeySignatureEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('keySignature');
		expect(event.key).toBe(-3);
		expect(event.scale).toBe('minor');
	});

	it('#readEvent should read a sequencerSpecific meta event', function () {
		const reader = new MidiReader('\x00\xff\x7f\x04\x41\x04\x01\x56');
		const event = reader.readEvent() as SequencerSpecificEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('meta');
		expect(event.subtype).toBe('sequencerSpecific');
		expect(event.data).toBe('\x41\x04\x01\x56');
	});

	it('#readEvent should read sysEx events', function () {
		const reader = new MidiReader('\x00\xf0\x05\x7e\x00\x09\x01\xf7');
		const event = reader.readEvent() as SysExEvent;
		expect(event.deltaTime).toBe(0);
		expect(event.type).toBe('sysEx');
		expect(event.data).toBe('\x7e\x00\x09\x01\xf7');
	});
});
