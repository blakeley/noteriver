<script lang="ts">
	import type * as jadin from 'jadin';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import SvgDefs from './SvgDefs.svelte';
	import IvoryKey from './IvoryKey.svelte';
	import EbonyKey from './EbonyKey.svelte';

	let { time, midi }: { time: number; midi: jadin.Midi } = $props();

	const lowNumber = 21;
	const highNumber = 108;

	let keyStates = $state<{ [key: number]: number | undefined }>({});
	let cursor = $state(midi.newCursor());
	let prevTime = $state(0);

	const vbx = $derived(new MidiNumber(lowNumber).x);
	const vbw = $derived(new MidiNumber(highNumber).x - vbx + keyboard.IVORY_WIDTH);
	const viewBox = $derived(`${vbx} 0 ${vbw} 1000`);

	$effect(() => {
		if (midi) {
			cursor = midi.newCursor();
			keyStates = {};
		}
	});

	$effect(() => {
		if (prevTime < time) {
			for (const event of cursor.forward(time)) {
				if (event.raw.type === 'channel') {
					if (event.raw.subtype === 'noteOn') {
						keyStates[event.raw.noteNumber] = event.track.index;
					} else if (event.raw.subtype === 'noteOff') {
						keyStates[event.raw.noteNumber] = undefined;
					}
				}
			}
		} else if (prevTime > time) {
			for (const event of cursor.backward(time)) {
				if (event.raw.type === 'channel') {
					if (event.raw.subtype === 'noteOn') {
						keyStates[event.raw.noteNumber] = undefined;
					} else if (event.raw.subtype === 'noteOff') {
						keyStates[event.raw.noteNumber] = event.track.index;
					}
				}
			}
		}
		prevTime = time;
	});
</script>

<svg class="h-full w-full scale-y-[-1]" {viewBox} preserveAspectRatio="xMidYMin slice">
	<SvgDefs />

	{#each keyboard.IVORY_MIDI_NUMBERS as midiNumber (midiNumber.number)}
		<IvoryKey x={midiNumber.x} pressed={keyStates[midiNumber.number]} />
	{/each}

	{#each keyboard.EBONY_MIDI_NUMBERS as midiNumber (midiNumber.number)}
		<EbonyKey x={midiNumber.x} pressed={keyStates[midiNumber.number]} />
	{/each}
</svg>
