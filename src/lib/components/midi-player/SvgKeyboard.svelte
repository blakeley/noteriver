<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';
	import { Keyboard } from '$lib/midi-player/keyboard';
	import EbonyKey from './EbonyKey.svelte';
	import IvoryKey from './IvoryKey.svelte';
	import SvgDefs from './SvgDefs.svelte';

	const playerState = getPlayerContext();

	const vbx = $derived(playerState.lowMidiNumber.x);
	const vbw = $derived(playerState.highMidiNumber.x - vbx + Keyboard.IVORY_WIDTH);
	const viewBox = $derived(`${vbx} 0 ${vbw} 1000`);

	// Derive key states directly from notesOnAt
	const keyStates = $derived(
		playerState.loadedMidi?.tracks
			.flatMap((track) =>
				track
					.notesOnAt(playerState.time)
					.filter((note) => note.number !== undefined)
					.map((note) => ({ noteNumber: note.number!, trackIndex: track.index })),
			)
			.reduce(
				(states, { noteNumber, trackIndex }) => ({
					...states,
					[noteNumber]: trackIndex,
				}),
				{},
			) || {},
	);
</script>

<div class="absolute inset-x-px top-0 bottom-px">
	<svg class="h-full w-full scale-y-[-1]" {viewBox} preserveAspectRatio="xMidYMin slice">
		<SvgDefs />

		{#each Keyboard.IVORY_MIDI_NUMBERS as midiNumber (midiNumber.number)}
			<IvoryKey x={midiNumber.x} pressed={keyStates[midiNumber.number]} />
		{/each}

		<!-- Burgundy bar at the top of the keys -->
		<rect x={vbx} y={Keyboard.IVORY_HEIGHT - 0.12} width={vbw} height={0.12} fill="#800020" />

		{#each Keyboard.EBONY_MIDI_NUMBERS as midiNumber (midiNumber.number)}
			<EbonyKey x={midiNumber.x} pressed={keyStates[midiNumber.number]} />
		{/each}

		<!-- Gray felt line above keys -->
		<rect x={vbx} y={Keyboard.IVORY_HEIGHT} width={vbw} height={0.125} fill="#3a3a3a" />
		<rect x={vbx} y={Keyboard.IVORY_HEIGHT} width={vbw} height={0.025} fill="#1a1a1a" />
	</svg>
</div>
