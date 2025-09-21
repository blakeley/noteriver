<script lang="ts">
	import MidiUploadForm from '$lib/components/MidiUploadForm.svelte';
</script>

<svelte:head>
	<title>Upload New MIDI - NoteRiver</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-2xl">
		<div class="rounded-lg bg-white shadow-sm">
			<div class="border-b border-gray-200 px-8 py-6">
				<h1 class="text-2xl font-bold text-gray-900">Upload New MIDI</h1>
				<p class="mt-1 text-sm text-gray-600">Share your MIDI file with the community</p>
			</div>

			<div class="px-8 py-6">
				<MidiUploadForm />
			</div>
		</div>
	</div>
</div>
