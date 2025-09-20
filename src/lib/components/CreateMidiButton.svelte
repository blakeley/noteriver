<script lang="ts">
	import { page } from '$app/state';
	import CreateMidiDialog from './CreateMidiDialog.svelte';
	import AuthenticationDialog from './AuthenticationDialog.svelte';

	const user = $derived(page.data.user);

	let showCreateDialog = $state(false);
	let showAuthDialog = $state(false);

	function handleCreate() {
		if (!user) {
			showAuthDialog = true;
			return;
		}
		showCreateDialog = true;
	}
</script>

<button
	onclick={handleCreate}
	class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
>
	<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 4v16m8-8H4"
		></path>
	</svg>
	<span>Upload MIDI</span>
</button>

{#if user}
	<CreateMidiDialog
		open={showCreateDialog}
		onClose={() => showCreateDialog = false}
	/>
{:else}
	<AuthenticationDialog
		open={showAuthDialog}
		onClose={() => showAuthDialog = false}
	/>
{/if}