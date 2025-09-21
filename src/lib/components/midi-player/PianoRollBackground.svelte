<script lang="ts">
	import { onMount } from 'svelte';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';

	let canvasRef: HTMLCanvasElement;
	let width = $state(1280);
	let height = $state(720);

	const lowNumber = 21;
	const highNumber = 108;

	const lowMidiNumber = $derived(new MidiNumber(lowNumber));
	const highMidiNumber = $derived(new MidiNumber(highNumber));

	const scale = $derived(width / (highMidiNumber.x - lowMidiNumber.x + highMidiNumber.width));

	function draw() {
		if (!canvasRef) return;
		const ctx = canvasRef.getContext('2d')!;

		ctx.resetTransform();
		ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

		ctx.translate(0, height);
		ctx.scale(scale, -scale);
		ctx.translate(-lowMidiNumber.x, 0);

		// Draw C note lines
		ctx.fillStyle = '#555555';
		for (const cMidiNumber of keyboard.C_MIDI_NUMBERS) {
			const lineWidth = keyboard.IVORY_WIDTH / 20;
			const x = cMidiNumber.x - lineWidth / 2;
			const y = 0;
			const lineHeight = height / scale;
			ctx.fillRect(x, y, lineWidth, lineHeight);
		}

		// Draw F note lines
		ctx.fillStyle = '#444444';
		for (const fMidiNumber of keyboard.F_MIDI_NUMBERS) {
			const lineWidth = keyboard.IVORY_WIDTH / 20;
			const x = fMidiNumber.x - lineWidth / 2;
			const y = 0;
			const lineHeight = height / scale;
			ctx.fillRect(x, y, lineWidth, lineHeight);
		}
	}

	onMount(() => {
		if (canvasRef) {
			height = canvasRef.clientHeight * window.devicePixelRatio;
			width = canvasRef.clientWidth * window.devicePixelRatio;
			draw();
		}
	});

	$effect(() => {
		draw();
	});
</script>

<canvas bind:this={canvasRef} {height} {width}></canvas>
