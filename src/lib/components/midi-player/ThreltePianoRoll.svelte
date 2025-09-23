<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { T } from '@threlte/core';
	import { getPlayerContext } from '$lib/midi-player/context';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import ThreltePianoNote from './ThreltePianoNote.svelte';

	const playerState = getPlayerContext();

	const scale = $derived(
		playerState.width /
			(playerState.highMidiNumber.x -
				playerState.lowMidiNumber.x +
				playerState.highMidiNumber.width)
	);

	const cameraPosition = $derived<[number, number, number]>([
		playerState.width / 2,
		playerState.height / 2,
		100
	]);
	const cameraLeft = $derived(0);
	const cameraRight = $derived(playerState.width);
	const cameraTop = $derived(0);
	const cameraBottom = $derived(playerState.height);

	// Scene transformation to match canvas coordinate system
	const scenePosition = $derived([0, playerState.height, 0] as const);
	const sceneScale = $derived([scale, -scale, 1] as const);

	// Offset for piano roll - scrolls with time (notes move down)
	const pianoRollOffset = $derived([
		-playerState.lowMidiNumber.x,
		playerState.time * playerState.timeScale,
		0
	] as const);
</script>

<div class="absolute h-full w-full">
	<Canvas toneMapping={0}>
		<T.OrthographicCamera
			position={cameraPosition}
			left={cameraLeft}
			right={cameraRight}
			top={cameraTop}
			bottom={cameraBottom}
			near={0}
			far={100}
			makeDefault
		/>

		<T.Group position={scenePosition} scale={sceneScale}>
			<T.Group position={pianoRollOffset}>
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
	</Canvas>
</div>
