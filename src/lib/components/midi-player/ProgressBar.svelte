<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';

	const playerState = getPlayerContext();

	let isDragging = $state(false);
	let progressBarEl: HTMLElement;

	// Progress bar shows range from -1 to duration + 1
	const totalRange = $derived(playerState.duration + 2); // +1 on each side
	const progressPercent = $derived(
		Math.min(100, playerState.duration > 0 ? ((playerState.time + 1) / totalRange) * 100 : 0)
	);

	function updateTimeFromPosition(clientX: number) {
		if (playerState.duration <= 0 || !progressBarEl) return;

		const rect = progressBarEl.getBoundingClientRect();
		const clickX = clientX - rect.left;
		const clickPercent = clickX / rect.width;
		// Map from 0-1 range to -1 to duration+1 range
		playerState.time = clickPercent * totalRange - 1;
	}

	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
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
	}
</script>

<svelte:document onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
	bind:this={progressBarEl}
	tabindex="0"
	class="absolute right-4 bottom-full left-4 h-1 cursor-pointer rounded-full bg-white/75 transition-all hover:h-1.5"
	class:cursor-grabbing={isDragging}
	onmousedown={handleMouseDown}
	role="slider"
	aria-label="Seek"
	aria-valuenow={Math.round(progressPercent)}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<!-- Progress Fill -->
	<div
		class="pointer-events-none absolute top-0 left-0 h-full rounded-full bg-primary-500"
		style="width: {progressPercent}%"
	>
		<!-- Progress Circle Indicator -->
		<div
			class="absolute top-1/2 -right-1.5 h-4 w-4 -translate-y-1/2 cursor-pointer rounded-full bg-primary-500 shadow-md transition-transform"
			class:scale-125={isDragging}
		></div>
	</div>
</div>
