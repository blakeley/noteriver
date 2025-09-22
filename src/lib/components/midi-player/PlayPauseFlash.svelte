<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';

	const playerState = getPlayerContext();

	let showFlash = $state(false);
	let flashTimeout: number | NodeJS.Timeout;

	// Watch for isPlaying changes and trigger flash
	$effect(() => {
		// This effect only runs when isPlaying changes
		playerState.isPlaying;
		showFlash = true;
		clearTimeout(flashTimeout);
		flashTimeout = setTimeout(() => {
			showFlash = false;
		}, 400);
	});
</script>

{#if showFlash}
	<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
		<div class="animate-flash rounded-full bg-black/30 p-6">
			{#if !playerState.isPlaying}
				<svg class="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			{:else}
				<svg class="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
				</svg>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes flash {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.1);
		}
	}

	.animate-flash {
		animation: flash 0.4s ease-out forwards;
	}
</style>
