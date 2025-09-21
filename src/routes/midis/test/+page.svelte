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
				binaryString += String.fromCharCode(bytes[i]);
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

<div class="midi-player-page">
	<div class="header">
		<h1 class="title">Test MIDI Player</h1>
		<p class="description">Testing with local MIDI file</p>
	</div>

	<div class="player-container">
		{#if loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Loading MIDI player...</p>
			</div>
		{:else if error}
			<div class="error">
				<p>{error}</p>
			</div>
		{:else if midi}
			<MidiPlayer {midi} />
		{/if}
	</div>
</div>

<style>
	.midi-player-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #1a1a1a;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.header {
		padding: 1rem 2rem;
		background: #2a2a2a;
		border-bottom: 1px solid #3a3a3a;
		flex-shrink: 0;
	}

	.title {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		margin-bottom: 0.5rem;
	}

	.description {
		color: #a0a0a0;
		margin-bottom: 0.5rem;
	}

	.player-container {
		flex: 1;
		position: relative;
		overflow: hidden;
		min-height: 0;
	}

	.loading,
	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: white;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #333;
		border-top-color: #666;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		color: #ff6b6b;
	}
</style>
