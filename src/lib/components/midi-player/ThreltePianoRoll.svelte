<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { T } from '@threlte/core';
	import { getPlayerContext } from '$lib/midi-player/context';
	import { Keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import ThreltePianoNote from './ThreltePianoNote.svelte';
	import ThrelteKeyboard from '$lib/components/ThrelteKeyboard.svelte';

	const playerState = getPlayerContext();

	const scale = $derived(
		playerState.width /
			(playerState.highMidiNumber.x -
				playerState.lowMidiNumber.x +
				playerState.highMidiNumber.width),
	);

	const cameraPosition = $derived<[number, number, number]>([
		playerState.width / 2,
		playerState.height / 2,
		100,
	]);
</script>

<div class="absolute h-full w-full">
	<Canvas toneMapping={0}>
		<T.OrthographicCamera position={cameraPosition} near={0} far={100} makeDefault />

		<T.Group scale={[scale, -scale, 1]}>
			<T.Group
				position={[
					-playerState.lowMidiNumber.x,
					playerState.time * playerState.timeScale - Keyboard.IVORY_HEIGHT,
					0,
				]}
			>
				{#if playerState.loadedMidi}
					<T.Group scale={[1, playerState.timeScale, 1]}>
						{#each playerState.loadedMidi.tracks as track}
							{#each track.notes as note}
								<ThreltePianoNote {note} />
							{/each}
						{/each}
					</T.Group>
				{/if}
			</T.Group>
		</T.Group>

		<!-- Keyboard at the bottom of the viewport -->
		<ThrelteKeyboard
			{scale}
			position={[-playerState.lowMidiNumber.x * scale, Keyboard.IVORY_HEIGHT / 2, 0]}
		/>
	</Canvas>
</div>
