<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let searchValue = page.url.searchParams.get('s') || '';

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const search = formData.get('search') as string;

		if (search) {
			goto(`/midis?s=${encodeURIComponent(search)}`);
		} else {
			goto('/midis');
		}
	}
</script>

<form on:submit={handleSubmit} class="w-full">
	<div class="relative">
		<input
			type="text"
			name="search"
			bind:value={searchValue}
			placeholder="Search MIDI files..."
			class="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
		/>
		<button
			type="submit"
			aria-label="Search"
			class="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				></path>
			</svg>
		</button>
	</div>
</form>