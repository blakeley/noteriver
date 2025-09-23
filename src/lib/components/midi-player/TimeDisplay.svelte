<script lang="ts">
	import { getPlayerContext } from '$lib/midi-player/context';
	import { formatTime } from '$lib/utils/formatTime';

	const playerState = getPlayerContext();

	const currentTime = $derived(formatTime(Math.max(0, playerState.time)));
	const totalTime = $derived(formatTime(playerState.duration));
</script>

<div class="flex-1 px-3 text-sm text-shadow-md">
	<span class="font-mono">{currentTime}</span>
	<span class="mx-1 opacity-90">/</span>
	<span class="font-mono opacity-90">{totalTime}</span>
</div>
