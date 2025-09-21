<script lang="ts">
	import '~/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import NoteriverAppBar from '$lib/components/NoteriverAppBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="fixed inset-0 flex flex-col">
	<NoteriverAppBar />
	<main class="flex-1 overflow-y-auto bg-gray-50">
		{@render children()}
	</main>
</div>
