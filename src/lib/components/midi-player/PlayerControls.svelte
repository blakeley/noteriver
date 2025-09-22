<script lang="ts">
	import { getContext } from 'svelte';
	import { PLAYER_CONTEXT_KEY } from '$lib/midi-player/context';

	const playerState = getContext(PLAYER_CONTEXT_KEY);

	function formatTime(seconds: number): string {
		if (!isFinite(seconds) || seconds < 0) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	const currentTime = $derived(formatTime(Math.max(0, playerState.time)));
	const totalTime = $derived(formatTime(playerState.duration));
</script>

<div
	class="absolute right-0 bottom-0 left-0 z-20 flex h-12 items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-3 text-white/95"
>
	<div class="flex h-full items-center">
		<!-- Play/Pause Button -->
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

		<!-- Time Display -->
		<div class="px-3 text-sm text-shadow-md">
			<span class="font-mono">{currentTime}</span>
			<span class="mx-1 opacity-90">/</span>
			<span class="font-mono opacity-90">{totalTime}</span>
		</div>
	</div>

	<!-- Fullscreen Button -->
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
</div>
