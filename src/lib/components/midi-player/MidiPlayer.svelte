<script lang="ts">
	import { setPlayerContext } from '$lib/midi-player/context';
	import { PLAYER_INITIAL_TIME_OFFSET, THUMBNAIL_INITIAL_TIME } from '$lib/midi-player/constants';
	import { MidiNumber } from '$lib/midi-player/keyboard';
	import { Synthesizer } from '$lib/midi-player/synthesizer';
	import * as jadin from 'jadin';
	import { onDestroy } from 'svelte';
	import CanvasPianoRoll from './CanvasPianoRoll.svelte';
	import PianoRollBackground from './PianoRollBackground.svelte';
	import PlayerControls from './PlayerControls.svelte';
	import PlayPauseFlash from './PlayPauseFlash.svelte';
	import ScrollOverlay from './ScrollOverlay.svelte';
	import SvgKeyboard from './SvgKeyboard.svelte';
	import ThreltePianoRoll from './ThreltePianoRoll.svelte';

	let {
		s3key,
		thumbnail = false,
	}: {
		s3key: string;
		thumbnail?: boolean;
	} = $props();

	let playerContainer: HTMLDivElement;

	// Create reactive state object for context - single $state with all properties
	const playerState = $state({
		time: thumbnail ? THUMBNAIL_INITIAL_TIME : PLAYER_INITIAL_TIME_OFFSET,
		duration: 0,
		isPlaying: false,
		isFullscreen: false,
		loadedMidi: null as jadin.Midi | null,
		scrollRatio: 0,
		width: 1280,
		height: 720,
		lowNumber: 21,
		highNumber: 108,
		lowMidiNumber: new MidiNumber(21),
		highMidiNumber: new MidiNumber(108),
		timeScale: 10, // Number of ivory key widths in one second of piano roll
		togglePlayPause: () => togglePlayPause(),
		visualMode: 'threlte' as 'threlte' | 'canvas',
	});

	let initialPositionSecond = 0;
	let initialDateNow = 0;
	const audioCursor = $derived(playerState.loadedMidi?.newCursor());
	let requestedAnimationFrame = 0;
	let timeoutId: number | NodeJS.Timeout = 0;

	// Function to load MIDI from S3
	async function loadMidiFromS3(key: string): Promise<jadin.Midi> {
		try {
			const response = await fetch(`/api/midis/s3/${encodeURIComponent(key)}`);
			if (response.ok) {
				const { midiBase64 } = await response.json();
				const binaryString = atob(midiBase64);
				const midiFile = new jadin.Midi(binaryString);
				playerState.loadedMidi = midiFile;
				if (!thumbnail) {
					loadAudioBuffers(midiFile);
				}
				return midiFile;
			} else {
				throw new Error('Failed to load MIDI from S3');
			}
		} catch (error) {
			console.error('Failed to load MIDI:', error);
			throw error;
		}
	}

	function animate() {
		if (playerState.isPlaying) {
			const elapsedSeconds = (Date.now() - initialDateNow) / 1000;
			playerState.time = initialPositionSecond + elapsedSeconds;
			requestedAnimationFrame = requestAnimationFrame(() => animate());
		}
	}

	function sonate() {
		const audioBufferDuration = 1.1; // MUST be > 1.0 because browsers cap setTimeout at 1000ms for inactive tabs

		if (playerState.isPlaying && audioCursor) {
			const elapsedSeconds = (Date.now() - initialDateNow) / 1000;
			const currentPosition = initialPositionSecond + elapsedSeconds;

			for (const event of audioCursor.forward(currentPosition + audioBufferDuration)) {
				if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
					const gainValue = event.raw.velocity / 127;
					Synthesizer.getInstance().playNote(
						event as jadin.Event<jadin.NoteOnEvent>,
						event.second - currentPosition,
						{ gainValue },
					);
				}
			}

			timeoutId = setTimeout(() => sonate(), audioBufferDuration * 500);
		}
	}

	async function loadAudioBuffers(midiFile: jadin.Midi) {
		for (const event of midiFile.events) {
			if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
				await Synthesizer.getInstance().loadBuffer(event as jadin.Event<jadin.NoteOnEvent>);
			}
		}
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			Synthesizer.getInstance().stopAudio();
			cancelAnimationFrame(requestedAnimationFrame);
			clearTimeout(timeoutId as NodeJS.Timeout);
			if (document.fullscreenElement) {
				document.exitFullscreen();
			}
		}
	});

	// Listen for fullscreen changes (e.g., when user presses ESC)
	$effect(() => {
		const handleFullscreenChange = () => {
			playerState.isFullscreen = !!document.fullscreenElement;
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	});

	// Handle fullscreen API when isFullscreen state changes
	$effect(async () => {
		const isCurrentlyFullscreen = !!document.fullscreenElement;

		if (playerState.isFullscreen && !isCurrentlyFullscreen && playerContainer) {
			try {
				await playerContainer.requestFullscreen();
			} catch (err) {
				console.error('Error attempting to enable fullscreen:', err);
				playerState.isFullscreen = false; // Revert on error
			}
		} else if (!playerState.isFullscreen && isCurrentlyFullscreen) {
			try {
				await document.exitFullscreen();
			} catch (err) {
				console.error('Error attempting to exit fullscreen:', err);
				playerState.isFullscreen = true; // Revert on error
			}
		}
	});

	function togglePlayPause() {
		if (playerState.isPlaying) {
			playerState.isPlaying = false;
			Synthesizer.getInstance().stopAudio();
		} else {
			initialPositionSecond = playerState.time;
			initialDateNow = Date.now();
			audioCursor?.backward(playerState.time);
			audioCursor?.forward(playerState.time);
			playerState.isPlaying = true;
			sonate();
			animate();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Toggle play/pause on spacebar
		if (event.key === ' ') {
			event.preventDefault(); // Prevent page scrolling
			if (!thumbnail && playerState.loadedMidi) {
				togglePlayPause();
			}
		}
		// Reset time to 0 on '0' key
		if (event.key === '0') {
			event.preventDefault();
			playerState.time = 0;
		}
	}

	// Update duration when loadedMidi changes
	$effect(() => {
		if (playerState.loadedMidi) {
			playerState.duration = playerState.loadedMidi.duration;
		}
	});

	// Set the player context
	setPlayerContext(playerState);
</script>

<div
	class="relative flex h-full w-full flex-col flex-nowrap overflow-hidden outline-none"
	bind:this={playerContainer}
	bind:clientWidth={playerState.width}
	bind:clientHeight={playerState.height}
	onkeydown={handleKeydown}
	tabindex="0"
	role="button"
>
	<div
		class="relative h-full w-full flex-1 overflow-hidden bg-[#2c2c2c] bg-[radial-gradient(circle_at_center_bottom,#2c2c2c_70%,#202020)]"
	>
		{#await loadMidiFromS3(s3key)}
			<div class="flex h-full items-center justify-center">
				<div
					class="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-gray-200"
				></div>
			</div>
		{:then midiFile}
			{#if !thumbnail}
				<ScrollOverlay />
				<PlayPauseFlash />
			{/if}
			<PianoRollBackground />
			{#if playerState.visualMode === 'canvas'}
				<CanvasPianoRoll indexParity={true} />
				<CanvasPianoRoll indexParity={false} />
			{:else}
				<ThreltePianoRoll />
			{/if}
			{#if !thumbnail}
				<SvgKeyboard />
				<PlayerControls />
			{/if}
		{:catch error}
			<div class="flex h-full items-center justify-center">
				<p class="text-red-500">Failed to load MIDI: {error?.message || error}</p>
			</div>
		{/await}
	</div>
</div>
