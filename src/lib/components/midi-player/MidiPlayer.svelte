<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type * as jadin from 'jadin';
	import { Synthesizer } from '$lib/midi-player/synthesizer';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import CanvasPianoRoll from './CanvasPianoRoll.svelte';
	import PianoRollBackground from './PianoRollBackground.svelte';
	import PlayerControls from './PlayerControls.svelte';
	import ScrollOverlay from './ScrollOverlay.svelte';
	import SvgKeyboard from './SvgKeyboard.svelte';

	let { midi }: { midi: jadin.Midi } = $props();

	const lowNumber = 21;
	const highNumber = 108;
	const width = 1280;
	const height = 720;

	let time = $state(-1);
	let isPlaying = $state(false);
	let scrollRatio = $state(0);

	let initialPositionSecond = 0;
	let initialDateNow = 0;
	let audioCursor = midi.newCursor();
	let requestedAnimationFrame = 0;
	let timeoutId: number | NodeJS.Timeout = 0;

	const lowMidiNumber = new MidiNumber(lowNumber);
	const highMidiNumber = new MidiNumber(highNumber);

	const windowHeightInSeconds = $derived(midi.duration + 2);

	const durationInPixels = $derived(
		midi.duration *
			10 /* timeScale */ *
			(width / height) *
			(highMidiNumber.x - lowMidiNumber.x + keyboard.IVORY_WIDTH)
	);

	function onScroll(ratio: number) {
		scrollRatio = ratio;
		time = ratio * windowHeightInSeconds - 1;
	}

	function toggleIsPlaying() {
		if (isPlaying) {
			isPlaying = false;
			Synthesizer.getInstance().stopAudio();
		} else {
			initialPositionSecond = time;
			initialDateNow = Date.now();
			audioCursor.backward(time);
			audioCursor.forward(time);

			isPlaying = true;
			sonate();
			animate();
		}
	}

	function animate() {
		if (isPlaying) {
			const elapsedSeconds = (Date.now() - initialDateNow) / 1000;
			time = initialPositionSecond + elapsedSeconds;
			requestedAnimationFrame = requestAnimationFrame(() => animate());
		}
	}

	function sonate() {
		const audioBufferDuration = 1.1; // MUST be > 1.0 because browsers cap setTimeout at 1000ms for inactive tabs

		if (isPlaying) {
			const elapsedSeconds = (Date.now() - initialDateNow) / 1000;
			const currentPosition = initialPositionSecond + elapsedSeconds;

			for (const event of audioCursor.forward(currentPosition + audioBufferDuration)) {
				if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
					const gainValue = event.raw.velocity / 127;
					Synthesizer.getInstance().playNote(
						event as jadin.Event<jadin.NoteOnEvent>,
						event.second - currentPosition,
						{ gainValue }
					);
				}
			}

			timeoutId = setTimeout(() => sonate(), audioBufferDuration * 500);
		}
	}

	onMount(async () => {
		// Load audio buffers for all notes
		for (const event of midi.events) {
			if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
				await Synthesizer.getInstance().loadBuffer(event as jadin.Event<jadin.NoteOnEvent>);
			}
		}
	});

	onDestroy(() => {
		Synthesizer.getInstance().stopAudio();
		cancelAnimationFrame(requestedAnimationFrame);
		clearTimeout(timeoutId as NodeJS.Timeout);
	});

	$effect(() => {
		if (midi) {
			cancelAnimationFrame(requestedAnimationFrame);
			clearTimeout(timeoutId as NodeJS.Timeout);
			time = -1;
			isPlaying = false;
			Synthesizer.getInstance().stopAudio();
			audioCursor = midi.newCursor();

			// Load audio buffers for all notes
			for (const event of midi.events) {
				if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
					Synthesizer.getInstance().loadBuffer(event as jadin.Event<jadin.NoteOnEvent>);
				}
			}
		}
	});
</script>

<div class="relative flex h-full w-full flex-col flex-nowrap overflow-hidden">
	<PlayerControls {time} onClick={toggleIsPlaying} {isPlaying} />

	<div
		class="relative h-full w-full flex-1 overflow-hidden bg-[#2c2c2c] bg-[radial-gradient(circle_at_center_bottom,#2c2c2c_70%,#202020)] [&_canvas]:absolute [&_canvas]:h-full [&_canvas]:w-full [&_svg]:absolute [&_svg]:h-full [&_svg]:w-full"
	>
		<ScrollOverlay
			{onScroll}
			height={durationInPixels}
			scrollRatio={isPlaying ? (time + 1) / windowHeightInSeconds : scrollRatio}
		/>
		<PianoRollBackground />
		<CanvasPianoRoll {midi} {time} indexParity={true} />
		<CanvasPianoRoll {midi} {time} indexParity={false} />
		<SvgKeyboard {midi} {time} />
	</div>
</div>
