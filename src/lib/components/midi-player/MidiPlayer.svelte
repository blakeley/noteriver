<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as jadin from 'jadin';
	import { Synthesizer } from '$lib/midi-player/synthesizer';
	import { keyboard, MidiNumber } from '$lib/midi-player/keyboard';
	import CanvasPianoRoll from './CanvasPianoRoll.svelte';
	import PianoRollBackground from './PianoRollBackground.svelte';
	import PlayerControls from './PlayerControls.svelte';
	import ScrollOverlay from './ScrollOverlay.svelte';
	import SvgKeyboard from './SvgKeyboard.svelte';

	let {
		midi,
		s3key,
		thumbnail = false
	}: {
		midi?: jadin.Midi;
		s3key?: string;
		thumbnail?: boolean;
	} = $props();

	const lowNumber = 21;
	const highNumber = 108;
	const width = 1280;
	const height = 720;

	let time = $state(thumbnail ? 2 : -1);
	let isPlaying = $state(false);
	let scrollRatio = $state(0);
	let loadedMidi = $state<jadin.Midi | null>(midi || null);
	let loading = $state(!midi && !!s3key);

	let initialPositionSecond = 0;
	let initialDateNow = 0;
	const audioCursor = $derived(loadedMidi?.newCursor());
	let requestedAnimationFrame = 0;
	let timeoutId: number | NodeJS.Timeout = 0;

	const lowMidiNumber = new MidiNumber(lowNumber);
	const highMidiNumber = new MidiNumber(highNumber);

	const windowHeightInSeconds = $derived(loadedMidi ? loadedMidi.duration + 2 : 1);

	const durationInPixels = $derived(
		loadedMidi
			? loadedMidi.duration *
					10 /* timeScale */ *
					(width / height) *
					(highMidiNumber.x - lowMidiNumber.x + keyboard.IVORY_WIDTH)
			: 0
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
			audioCursor?.backward(time);
			audioCursor?.forward(time);

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

		if (isPlaying && audioCursor) {
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
		// Load MIDI if s3key provided
		if (s3key && !loadedMidi) {
			try {
				const response = await fetch(`/api/midis/s3/${encodeURIComponent(s3key)}`);
				if (response.ok) {
					const { midiBase64 } = await response.json();
					const binaryString = atob(midiBase64);
					loadedMidi = new jadin.Midi(binaryString);
					loading = false;
				}
			} catch (error) {
				console.error('Failed to load MIDI:', error);
				loading = false;
			}
		}

		// Load audio buffers for all notes
		if (loadedMidi) {
			for (const event of loadedMidi.events) {
				if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
					await Synthesizer.getInstance().loadBuffer(event as jadin.Event<jadin.NoteOnEvent>);
				}
			}
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			Synthesizer.getInstance().stopAudio();
			cancelAnimationFrame(requestedAnimationFrame);
			clearTimeout(timeoutId as NodeJS.Timeout);
		}
	});

	$effect(() => {
		if (midi && midi !== loadedMidi) {
			loadedMidi = midi;
			loading = false;
			if (typeof window !== 'undefined') {
				cancelAnimationFrame(requestedAnimationFrame);
				clearTimeout(timeoutId as NodeJS.Timeout);
				Synthesizer.getInstance().stopAudio();
			}
			time = thumbnail ? 2 : -1;
			isPlaying = false;

			// Load audio buffers for all notes
			for (const event of loadedMidi.events) {
				if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
					Synthesizer.getInstance().loadBuffer(event as jadin.Event<jadin.NoteOnEvent>);
				}
			}
		}
	});
</script>

<div class="relative flex h-full w-full flex-col flex-nowrap overflow-hidden">
	{#if !thumbnail}
		<PlayerControls {time} onClick={toggleIsPlaying} {isPlaying} />
	{/if}

	<div
		class="relative h-full w-full flex-1 overflow-hidden bg-[#2c2c2c] bg-[radial-gradient(circle_at_center_bottom,#2c2c2c_70%,#202020)] [&_canvas]:absolute [&_canvas]:h-full [&_canvas]:w-full [&_svg]:absolute [&_svg]:h-full [&_svg]:w-full"
	>
		{#if loading}
			<div class="flex h-full items-center justify-center">
				<div
					class="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-gray-200"
				></div>
			</div>
		{:else if loadedMidi}
			{#if !thumbnail}
				<ScrollOverlay
					{onScroll}
					height={durationInPixels}
					scrollRatio={isPlaying ? (time + 1) / windowHeightInSeconds : scrollRatio}
				/>
			{/if}
			<PianoRollBackground />
			<CanvasPianoRoll midi={loadedMidi} {time} indexParity={true} />
			<CanvasPianoRoll midi={loadedMidi} {time} indexParity={false} />
			{#if !thumbnail}
				<SvgKeyboard midi={loadedMidi} {time} />
			{/if}
		{/if}
	</div>
</div>
