<script lang="ts">
	import NoteriverAppBar from '$lib/components/NoteriverAppBar.svelte';

	let { children } = $props();
</script>

<div class="fixed inset-0 flex flex-col">
	<NoteriverAppBar />
	<main class="flex-1 overflow-y-auto bg-gray-50">
		{@render children()}
	</main>
</div>
