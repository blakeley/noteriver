<script lang="ts">
	import { onMount } from 'svelte';
	import { Keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import { getPlayerContext } from '$lib/midi-player/context';

	const playerState = getPlayerContext();

	let canvasRef: HTMLCanvasElement;

	const scale = $derived(
		playerState.width /
			(playerState.highMidiNumber.x -
				playerState.lowMidiNumber.x +
				playerState.highMidiNumber.width),
	);

	function draw() {
		if (!canvasRef) return;
		const ctx = canvasRef.getContext('2d')!;

		ctx.resetTransform();
		ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

		ctx.translate(0, canvasRef.height);
		ctx.scale(scale, -scale);
		ctx.translate(-playerState.lowMidiNumber.x, 0);

		// Draw C note lines
		ctx.fillStyle = '#555555';
		for (const cMidiNumber of Keyboard.C_MIDI_NUMBERS) {
			const lineWidth = Keyboard.IVORY_WIDTH / 20;
			const x = cMidiNumber.x - lineWidth / 2;
			const y = 0;
			const lineHeight = canvasRef.height / scale;
			ctx.fillRect(x, y, lineWidth, lineHeight);
		}

		// Draw F note lines
		ctx.fillStyle = '#444444';
		for (const fMidiNumber of Keyboard.F_MIDI_NUMBERS) {
			const lineWidth = Keyboard.IVORY_WIDTH / 20;
			const x = fMidiNumber.x - lineWidth / 2;
			const y = 0;
			const lineHeight = canvasRef.height / scale;
			ctx.fillRect(x, y, lineWidth, lineHeight);
		}
	}

	onMount(() => {
		if (canvasRef) {
			draw();
		}
	});

	$effect(() => {
		draw();
	});
</script>

<canvas
	class="absolute h-full w-full"
	bind:this={canvasRef}
	height={playerState.height}
	width={playerState.width}
></canvas>
