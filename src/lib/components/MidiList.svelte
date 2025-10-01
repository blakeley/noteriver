<script lang="ts">
	import MidiListItem from './MidiListItem.svelte';
	import type { MidiWithRelations } from '$lib/server/midi';

	let {
		midis = [],
	}: {
		midis?: MidiWithRelations[];
	} = $props();
</script>

<div class="h-full overflow-y-auto">
	<div class="mx-auto my-4 max-w-4xl">
		{#if midis.length === 0}
			<div class="py-12 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
					></path>
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No MIDI files found</h3>
				<p class="mt-1 text-sm text-gray-500">Get started by uploading a MIDI file.</p>
			</div>
		{:else}
			<ul class="divide-y divide-gray-200 rounded-lg bg-white shadow-md shadow-black/20">
				{#each midis as midi (midi.id)}
					<MidiListItem {midi} />
				{/each}
			</ul>
		{/if}
	</div>
</div>
