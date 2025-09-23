<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';

	const playerState = getPlayerContext();
</script>

<button
	onclick={() => {
		playerState.visualMode = playerState.visualMode === 'canvas' ? 'threlte' : 'canvas';
	}}
	class="group h-12 w-12 cursor-pointer p-1"
	title="Toggle visualization mode"
>
	<div
		class="flex h-full w-full items-center justify-center rounded-md bg-white/10 text-xs font-light tracking-wider text-white group-hover:bg-white/20 group-hover:text-white"
	>
		{playerState.visualMode === 'canvas' ? '2D' : '3D'}
	</div>
</button>
