<script lang="ts">
	import { onMount } from 'svelte';
	import * as jadin from 'jadin';
	import type { PageData } from './$types';
	import MidiPlayer from '$lib/components/midi-player/MidiPlayer.svelte';

	let { data }: { data: PageData } = $props();

	let midi = $state<jadin.Midi | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// Convert base64 back to binary string
			const binaryString = atob(data.midiBase64);

			// Parse the MIDI file - jadin expects a binary string
			midi = new jadin.Midi(binaryString);
			loading = false;
		} catch (err) {
			console.error('Error parsing MIDI:', err);
			error = 'Failed to parse MIDI file';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{data.midiData.title} - NoteRiver</title>
</svelte:head>

<div class="flex h-full w-full flex-col bg-[#1a1a1a]">
	<div class="relative h-full w-full overflow-hidden">
		{#if loading}
			<div class="flex h-full flex-col items-center justify-center text-white">
				<div
					class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-gray-500"
				></div>
				<p>Loading MIDI player...</p>
			</div>
		{:else if error}
			<div class="flex h-full flex-col items-center justify-center text-[#ff6b6b]">
				<p>{error}</p>
			</div>
		{:else if midi}
			<MidiPlayer {midi} />
		{/if}
	</div>
</div>
