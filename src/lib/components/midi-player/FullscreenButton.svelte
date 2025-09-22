<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';

	const playerState = getPlayerContext();
</script>

<button
	class="flex aspect-square h-full cursor-pointer items-center justify-center"
	onclick={() => (playerState.isFullscreen = !playerState.isFullscreen)}
	aria-label={playerState.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
>
	{#if playerState.isFullscreen}
		<!-- Exit fullscreen icon -->
		<svg
			class="h-8 w-8"
			fill="currentColor"
			viewBox="0 0 24 24"
			style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
		>
			<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
		</svg>
	{:else}
		<!-- Enter fullscreen icon -->
		<svg
			class="h-8 w-8"
			fill="currentColor"
			viewBox="0 0 24 24"
			style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
		>
			<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
		</svg>
	{/if}
</button>
