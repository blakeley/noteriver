<script lang="ts">
	import SearchBox from './SearchBox.svelte';
	import AuthenticationButtons from './AuthenticationButtons.svelte';
	import CreateMidiButton from './CreateMidiButton.svelte';
</script>

<header class="bg-white shadow-md shadow-black/20">
	<div class="flex h-16 items-center px-4">
		<a href="/midis" class="flex h-full items-center px-4 transition-opacity hover:bg-neutral-100">
			<img src="/logo.svg" alt="NoteRiver Logo" class="h-10 w-10" />
			<img src="/product.svg" alt="NoteRiver" class="ml-[5px] h-6 pb-1" />
		</a>

		<div class="mx-4 max-w-2xl flex-1">
			<SearchBox />
		</div>

		<div class="flex items-center space-x-2">
			<CreateMidiButton />
			<AuthenticationButtons />
		</div>
	</div>
</header>
