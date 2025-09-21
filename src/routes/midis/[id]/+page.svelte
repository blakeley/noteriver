<script lang="ts">
	import { onMount } from 'svelte';
	import * as jadin from 'jadin';
	import type { PageData } from './$types';
	import MidiPlayer from '$lib/components/midi-player/MidiPlayer.svelte';
	import AvatarFallback from '$lib/components/AvatarFallback.svelte';

	let { data }: { data: PageData } = $props();

	let midi = $state<jadin.Midi | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showFullDescription = $state(false);

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

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	}
</script>

<svelte:head>
	<title>{data.midiData.title} - NoteRiver</title>
</svelte:head>

<div class="flex min-h-screen bg-neutral-50 text-gray-900">
	<!-- Main Content Area -->
	<div class="mx-auto flex w-full max-w-[1800px] gap-6 px-6 py-6">
		<!-- Left Column - Player and Info -->
		<div class="flex-1">
			<!-- 16:9 Aspect Ratio Container for Player -->
			<div
				class="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-xl after:absolute after:inset-0 after:rounded-xl after:border-2 after:border-black/50"
			>
				{#if loading}
					<div class="flex h-full items-center justify-center">
						<div
							class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700"
						></div>
					</div>
				{:else if error}
					<div class="flex h-full items-center justify-center text-red-500">
						<p>{error}</p>
					</div>
				{:else if midi}
					<MidiPlayer {midi} />
				{/if}
			</div>

			<!-- Video Title -->
			<h1 class="mt-4 text-xl font-semibold text-gray-900">{data.midiData.title}</h1>

			<!-- Author Info and Stats -->
			<div class="mt-3 flex items-center justify-between border-b border-gray-200 pb-4">
				<div class="flex items-center gap-3">
					<!-- Avatar -->
					<div class="h-10 w-10">
						<AvatarFallback user={data.midiData.createdBy} />
					</div>
					<div>
						<div class="font-semibold text-gray-900">
							{data.midiData.createdBy?.username || 'Unknown'}
						</div>
						<div class="text-xs text-gray-600">
							{formatDate(data.midiData.createdAt.toISOString())}
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex items-center gap-2">
					<button
						class="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.85-1.26l3.03-7.86c.09-.23.12-.47.12-.72v-1.91l-.01-.01L23 10z"
							/>
						</svg>
						Like
					</button>
					<button
						class="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
						aria-label="Dislike"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M15 3H6c-.83 0-1.54.5-1.85 1.26l-3.03 7.86c-.09.23-.12.47-.12.72v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"
							/>
						</svg>
					</button>
					<button
						class="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
						aria-label="Share"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Description Section -->
			<div class="mt-4 rounded-xl bg-gray-100 p-4">
				<div class="mb-2 text-sm font-semibold text-gray-900">
					{formatDuration(data.midiData.duration)}
				</div>
				{#if data.midiData.description}
					<div class="text-sm text-gray-700">
						{#if showFullDescription || data.midiData.description.length <= 200}
							{data.midiData.description}
						{:else}
							{data.midiData.description.slice(0, 200)}...
						{/if}
						{#if data.midiData.description.length > 200}
							<button
								class="ml-1 font-semibold text-gray-900 hover:underline"
								onclick={() => (showFullDescription = !showFullDescription)}
							>
								{showFullDescription ? 'Show less' : 'Show more'}
							</button>
						{/if}
					</div>
				{:else}
					<p class="text-sm text-gray-600">No description provided</p>
				{/if}
			</div>

			<!-- Comments Section -->
			<div class="mt-6">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Comments</h2>
				<div class="rounded-xl bg-gray-100 p-8 text-center text-gray-600">Comments coming soon</div>
			</div>
		</div>

		<!-- Right Sidebar - Other Midis -->
		<div class="w-[400px] flex-shrink-0">
			<div class="space-y-4">
				{#each data.otherMidis as midi}
					<a href="/midis/{midi.id}" class="flex gap-3 rounded-lg hover:bg-gray-100">
						<!-- Thumbnail placeholder -->
						<div
							class="h-24 w-40 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600"
						></div>

						<div class="min-w-0 flex-1">
							<h4 class="line-clamp-2 text-sm font-semibold text-gray-900">
								{midi.title}
							</h4>
							<p class="mt-1 text-xs text-gray-600">
								{midi.createdBy?.username || 'Unknown'}
							</p>
							<p class="text-xs text-gray-600">
								{formatDuration(midi.duration)} • {formatDate(midi.createdAt.toISOString())}
							</p>
						</div>
					</a>
				{:else}
					<p class="text-gray-600">No other MIDIs available</p>
				{/each}
			</div>
		</div>
	</div>
</div>
