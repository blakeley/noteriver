<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';

	const playerState = getPlayerContext();
</script>

<button
	class="flex aspect-square h-full cursor-pointer items-center justify-center"
	onclick={playerState.togglePlayPause}
	aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
>
	{#if playerState.isPlaying}
		<svg
			class="h-8 w-8"
			fill="currentColor"
			viewBox="0 0 24 24"
			style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
		>
			<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
		</svg>
	{:else}
		<svg
			class="h-8 w-8"
			fill="currentColor"
			viewBox="0 0 24 24"
			style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
		>
			<path d="M8 5v14l11-7z" />
		</svg>
	{/if}
</button>
