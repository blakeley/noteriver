import type * as jadin from 'jadin';
import {
	MIDI_NOTE_NUMBER_TO_NOTE_NAME,
	PATCH_NUMBER_TO_INSTRUMENT_NAME,
} from './synthesizer-utils';

export class Synthesizer {
	private static instance: Synthesizer;
	private audioContext: AudioContext;
	private audioBuffers = new Map<string, AudioBuffer>();
	private audioBufferPromises = new Map<string, Promise<AudioBuffer>>();
	private audioBufferSourceNodes: AudioBufferSourceNode[] = [];
	private masterGain: GainNode;

	constructor() {
		if (typeof window !== 'undefined' && window.AudioContext) {
			this.audioContext = new AudioContext();
			this.masterGain = this.audioContext.createGain();
			this.masterGain.connect(this.audioContext.destination);
		}
	}

	public static getInstance(): Synthesizer {
		if (!Synthesizer.instance) {
			Synthesizer.instance = new Synthesizer();
		}
		return Synthesizer.instance;
	}

	noteToUrl(noteOnEvent: jadin.Event<jadin.NoteOnEvent>) {
		const noteName = MIDI_NOTE_NUMBER_TO_NOTE_NAME.get(noteOnEvent.raw.noteNumber);
		if (noteOnEvent.raw.channel === 9) {
			return `https://raw.githubusercontent.com/dave4mpls/midi-js-soundfonts-with-drums/gh-pages/FluidR3_GM/percussion-mp3/${noteName}.mp3`;
		} else {
			const patch = noteOnEvent.track.patch || 0;
			const instrument = PATCH_NUMBER_TO_INSTRUMENT_NAME[patch];
			return `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrument}-mp3/${noteName}.mp3`;
		}
	}

	async loadBuffer(noteOnEvent: jadin.Event<jadin.NoteOnEvent>) {
		const url = this.noteToUrl(noteOnEvent);
		if (!this.audioBufferPromises.has(url)) {
			const promise = this.fetchAndDecodeAudioFile(url);
			this.audioBufferPromises.set(url, promise);
		}

		const audioBuffer = await this.audioBufferPromises.get(url)!;
		this.audioBuffers.set(url, audioBuffer);
	}

	async fetchAndDecodeAudioFile(url: string) {
		if (!this.audioContext) return null as any;
		const response = await fetch(url);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
		return audioBuffer;
	}

	playNote(
		note: jadin.Event<jadin.NoteOnEvent>,
		startWhen: number = 0,
		{ gainValue = 1.0, startBufferOffset = 0, sustainDuration = 0.125, fadeDuration = 1.25 } = {},
	) {
		if (!this.audioContext) return;
		const key = this.noteToUrl(note);
		if (note.track.patch === null || note.track.patch === 0) {
			console.log('piano');
			sustainDuration = 3;
		}
		const audioBuffer = this.audioBuffers.get(key)!;
		if (!audioBuffer) {
			console.error(`Did not find audioBuffer ${key}`);
		}
		const audioBufferSourceNode = this.audioContext.createBufferSource();
		audioBufferSourceNode.buffer = audioBuffer;

		const gainNode = this.audioContext.createGain();
		gainNode.gain.value = gainValue;

		audioBufferSourceNode.connect(gainNode);
		gainNode.connect(this.masterGain);

		startWhen = this.audioContext.currentTime + Math.max(0, startWhen);
		const startFadeWhen = startWhen + sustainDuration;
		const endFadeWhen = startFadeWhen + fadeDuration;

		audioBufferSourceNode.start(startWhen, startBufferOffset);
		gainNode.gain.setValueAtTime(1.0, startFadeWhen);
		gainNode.gain.exponentialRampToValueAtTime(0.001, endFadeWhen);

		this.audioBufferSourceNodes.push(audioBufferSourceNode);
	}

	stopAudio() {
		for (const audioBufferSourceNode of this.audioBufferSourceNodes) {
			audioBufferSourceNode.stop();
		}
		this.audioBufferSourceNodes = [];
	}
}
