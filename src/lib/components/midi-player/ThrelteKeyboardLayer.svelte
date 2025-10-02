<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { getPlayerContext } from '$lib/midi-player/context';
	import { Keyboard } from '$lib/midi-player/keyboard';
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

<div class="pointer-events-none absolute right-0 bottom-0 left-0 h-[100px]">
	<Canvas toneMapping={0}>
		<T.OrthographicCamera
			position={cameraPosition}
			left={0}
			right={playerState.width}
			top={100}
			bottom={0}
			near={-1000}
			far={1000}
			makeDefault
		/>

		<ThrelteKeyboard
			{scale}
			position={[-playerState.lowMidiNumber.x * scale, Keyboard.IVORY_HEIGHT / 2, 0]}
		/>
	</Canvas>
</div>
