<script lang="ts">
	import type { MidiWithRelations } from '$lib/server/midi';
	import InstrumentList from './InstrumentList.svelte';
	import AvatarFallback from './AvatarFallback.svelte';

	let { midi }: { midi: MidiWithRelations } = $props();

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<li class="border-b border-gray-200 transition-colors hover:bg-gray-50">
	<a href={`/midis/${midi.id}`} class="block p-4">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<h3 class="text-lg font-semibold text-gray-900 hover:text-primary-600">
					{midi.title}
				</h3>

				{#if midi.description}
					<p class="mt-1 line-clamp-2 text-sm text-gray-600">
						{midi.description}
					</p>
				{/if}

				<div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
					<span class="flex items-center space-x-1">
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
							/>
						</svg>
						<span>{midi.favoritesCount || 0}</span>
					</span>
					<span class="flex items-center space-x-1">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
						<span>{midi.commentsCount || 0}</span>
					</span>
					<span class="flex items-center space-x-1">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{formatDuration(midi.duration)}</span>
					</span>
					<span class="flex items-center space-x-1">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span>{formatDate(midi.createdAt)}</span>
					</span>
				</div>
			</div>

			<InstrumentList instruments={midi.instruments || []} />

			<div class="ml-8">
				<AvatarFallback user={midi.createdBy} size={24} />
			</div>
		</div>
	</a>
</li>
