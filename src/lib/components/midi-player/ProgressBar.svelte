<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';
	import { PLAYER_INITIAL_TIME_OFFSET } from '$lib/midi-player/constants';

	const playerState = getPlayerContext();

	let isDragging = $state(false);
	let wasPlaying = $state(playerState.isPlaying);
	let progressBarEl: HTMLElement;

	// Progress bar shows range from initial offset to duration + 1
	const totalRange = $derived(playerState.duration - PLAYER_INITIAL_TIME_OFFSET + 1); // from initial offset to duration + 1
	const progressPercent = $derived(
		Math.min(
			100,
			playerState.duration > 0
				? ((playerState.time - PLAYER_INITIAL_TIME_OFFSET) / totalRange) * 100
				: 0,
		),
	);

	function updateTimeFromPosition(clientX: number) {
		if (playerState.duration <= 0 || !progressBarEl) return;

		const rect = progressBarEl.getBoundingClientRect();
		const clickX = clientX - rect.left;
		const clickPercent = clickX / rect.width;
		// Map from 0-1 range to initial offset to duration+1 range
		const newTime = clickPercent * totalRange + PLAYER_INITIAL_TIME_OFFSET;
		playerState.seek(newTime);
	}

	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		wasPlaying = playerState.isPlaying;
		playerState.pause();
		updateTimeFromPosition(event.clientX);

		// Prevent text selection while dragging
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		updateTimeFromPosition(event.clientX);
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		if (wasPlaying) {
			playerState.play();
		}
	}
</script>

<svelte:document onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<!-- Container for progress bar -->
<div
	bind:this={progressBarEl}
	tabindex="0"
	class="group relative mx-2 flex h-8 cursor-pointer items-center"
	class:cursor-grabbing={isDragging}
	onmousedown={handleMouseDown}
	role="slider"
	aria-label="Seek"
	aria-valuenow={Math.round(progressPercent)}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<!-- Visual progress bar -->
	<div class="relative h-1 w-full rounded-full bg-white/30 transition-all group-hover:h-1.5">
		<!-- Progress Fill -->
		<div
			class="pointer-events-none absolute top-0 left-0 h-full rounded-full bg-primary-500"
			style="width: {progressPercent}%"
		>
			<!-- Progress Circle Indicator -->
			<div
				class="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 cursor-pointer rounded-full bg-primary-500 shadow-md transition-transform"
				class:scale-125={isDragging}
			></div>
		</div>
	</div>
</div>
