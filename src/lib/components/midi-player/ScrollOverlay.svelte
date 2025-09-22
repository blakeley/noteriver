<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';
	import { keyboard } from '$lib/midi-player/keyboard';

	const playerState = getPlayerContext();
	let scrollDiv: HTMLDivElement;

	// Calculate window height in seconds (same as in MidiPlayer)
	const windowHeightInSeconds = $derived(
		playerState.loadedMidi ? playerState.loadedMidi.duration + 2 : 1
	);

	// Calculate duration in pixels for the scrollable height
	const durationInPixels = $derived(
		playerState.loadedMidi
			? playerState.loadedMidi.duration *
					playerState.timeScale *
					(playerState.width / playerState.height) *
					(playerState.highMidiNumber.x - playerState.lowMidiNumber.x + keyboard.IVORY_WIDTH)
			: 0
	);

	function onscroll() {
		if (!scrollDiv) return;
		const scrollTop = scrollDiv.scrollTop;
		const elementHeight = scrollDiv.clientHeight;
		const ratio = scrollTop / (durationInPixels - elementHeight);
		playerState.time = ratio * windowHeightInSeconds - 1;
	}

	// Update scroll position when time changes
	$effect(() => {
		if (!scrollDiv) return;
		const scrollRatio = (playerState.time + 1) / windowHeightInSeconds;
		scrollDiv.scrollTop = scrollRatio * (durationInPixels - scrollDiv.clientHeight);
	});
</script>

<div
	bind:this={scrollDiv}
	{onscroll}
	class="absolute top-0 right-0 bottom-0 left-0 z-[1] overflow-scroll"
>
	<div style:height={durationInPixels + 'px'}></div>
</div>
