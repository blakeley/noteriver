<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { getPlayerContext } from '$lib/midi-player/context';
	import { Keyboard } from '$lib/midi-player/keyboard';
	import ThreltePianoNotes from './ThreltePianoNotes.svelte';
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

	let { thumbnail = false } = $props();
</script>

<div class="absolute h-full w-full">
	<Canvas toneMapping={0}>
		<T.OrthographicCamera position={cameraPosition} near={0} far={100} makeDefault />

		<!-- Piano Roll Notes -->
		<ThreltePianoNotes {scale} />

		<!-- Keyboard at the bottom (only show when not thumbnail) -->
		{#if !thumbnail}
			<ThrelteKeyboard
				{scale}
				position={[-playerState.lowMidiNumber.x * scale, (Keyboard.IVORY_HEIGHT / 2) * scale, 0]}
			/>
		{/if}
	</Canvas>
</div>
