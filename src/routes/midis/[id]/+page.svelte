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

<div class="midi-player-page">
	<div class="header">
		<h1 class="title">{data.midiData.title}</h1>
		{#if data.midiData.description}
			<p class="description">{data.midiData.description}</p>
		{/if}
		<div class="metadata">
			<span class="author">
				by {data.midiData.createdBy?.username || 'Unknown'}
			</span>
			<span class="duration">
				{Math.floor(data.midiData.duration / 60)}:{(data.midiData.duration % 60)
					.toFixed(0)
					.padStart(2, '0')}
			</span>
		</div>
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

	.metadata {
		display: flex;
		gap: 1rem;
		color: #808080;
		font-size: 0.875rem;
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
