<script lang="ts">
	import { T } from '@threlte/core';
	import { getPlayerContext } from '$lib/midi-player/context';
	import { Keyboard } from '$lib/midi-player/keyboard';
	import ThreltePianoNote from './ThreltePianoNote.svelte';

	const playerState = getPlayerContext();

	let { scale }: { scale: number } = $props();
</script>

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
