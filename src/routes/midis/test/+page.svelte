<script lang="ts">
	import { onMount } from 'svelte';
	import * as jadin from 'jadin';
	import MidiPlayer from '$lib/components/midi-player/MidiPlayer.svelte';

	let midi = $state<jadin.Midi | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// Load the test MIDI file
			const response = await fetch('/test.mid');
			if (!response.ok) {
				throw new Error('Failed to load test MIDI file');
			}

			const arrayBuffer = await response.arrayBuffer();
			// Convert ArrayBuffer to binary string for jadin
			let binaryString = '';
			const bytes = new Uint8Array(arrayBuffer);
			for (let i = 0; i < bytes.length; i++) {
				binaryString += String.fromCharCode(bytes[i]!);
			}
			midi = new jadin.Midi(binaryString);
			loading = false;
		} catch (err) {
			console.error('Error loading test MIDI:', err);
			error = 'Failed to load test MIDI file';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Test MIDI Player - NoteRiver</title>
</svelte:head>

<div class="flex h-full w-full flex-col bg-[#1a1a1a]">
	<div class="flex-shrink-0 border-b border-[#3a3a3a] bg-[#2a2a2a] px-8 py-4">
		<h1 class="mb-2 text-2xl font-bold text-white">Test MIDI Player</h1>
		<p class="mb-2 text-[#a0a0a0]">Testing with local MIDI file</p>
	</div>

	<div class="relative min-h-0 flex-1 overflow-hidden">
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
