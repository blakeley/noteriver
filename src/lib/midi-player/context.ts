import { setContext, getContext } from 'svelte';
import type * as jadin from 'jadin';
import type { MidiNumber } from '$lib/midi-player/keyboard';

export interface PlayerState {
	time: number;
	duration: number;
	isPlaying: boolean;
	isFullscreen: boolean;
	loadedMidi: jadin.Midi | null;
	scrollRatio: number;
	width: number;
	height: number;
	lowNumber: number;
	highNumber: number;
	lowMidiNumber: MidiNumber;
	highMidiNumber: MidiNumber;
	timeScale: number;
	play: () => void;
	pause: () => void;
	seek: (newTime: number) => void;
	togglePlayPause: () => void;
	visualMode: 'canvas' | 'threlte';
}

const key: {} = {};

export function setPlayerContext(state: PlayerState): void {
	setContext<PlayerState>(key, state);
}

export function getPlayerContext(): PlayerState {
	return getContext<PlayerState>(key) as PlayerState;
}
