<script lang="ts">
	let {
		time,
		isPlaying,
		onClick
	}: {
		time: number;
		isPlaying: boolean;
		onClick: () => void;
	} = $props();
</script>

<button
	class="absolute top-4 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
	onclick={onClick}
	aria-label={isPlaying ? 'Pause' : 'Play'}
>
	{#if isPlaying}
		<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
			<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
		</svg>
	{:else}
		<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
			<path d="M8 5v14l11-7z" />
		</svg>
	{/if}
</button>
