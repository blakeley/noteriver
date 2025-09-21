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

<button class="player-control-button" onclick={onClick} aria-label={isPlaying ? 'Pause' : 'Play'}>
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

<style>
	.player-control-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 10;
		display: flex;
		height: 3rem;
		width: 3rem;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: white;
		color: #374151;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		transition: background-color 0.2s;
	}

	.player-control-button:hover {
		background-color: #f3f4f6;
	}
</style>
