<script lang="ts">
	import SearchBox from './SearchBox.svelte';
	import AuthenticationButtons from './AuthenticationButtons.svelte';
</script>

<header class="z-10 bg-white shadow-md shadow-black/20">
	<div class="flex h-16 items-center">
		<a href="/midis" class="flex h-full items-center px-4 transition-opacity hover:bg-neutral-100">
			<img src="/logo.svg" alt="NoteRiver Logo" class="h-10 w-10" />
			<img src="/product.svg" alt="NoteRiver" class="ml-[5px] h-6 pb-1" />
		</a>

		<div class="mx-4 max-w-2xl flex-1">
			<SearchBox />
		</div>

		<div class="flex items-center space-x-2">
			<a
				href="/midis/new"
				class="flex items-center space-x-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
					></path>
				</svg>
				<span>Upload MIDI</span>
			</a>
			<AuthenticationButtons />
		</div>
	</div>
</header>
