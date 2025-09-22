<script lang="ts">
	import { page } from '$app/state';
	import AuthenticationDialog from './AuthenticationDialog.svelte';
	import AvatarFallback from './AvatarFallback.svelte';

	const user = $derived(page.data.user);

	let showAuthDialog = $state(false);

	function openLoginDialog() {
		showAuthDialog = true;
	}

	function openSignupDialog() {
		showAuthDialog = true;
	}
</script>

{#if user}
	<div class="flex items-center space-x-2">
		<a
			href="/account-settings"
			class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
		>
			<AvatarFallback {user} size={24} />
			<span>{user.username}</span>
		</a>
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
			>
				Logout
			</button>
		</form>
	</div>
{:else}
	<div class="flex items-center space-x-2">
		<button
			onclick={openLoginDialog}
			class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
		>
			Login
		</button>
		<button
			onclick={openSignupDialog}
			class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
		>
			Sign Up
		</button>
	</div>
{/if}

<AuthenticationDialog open={showAuthDialog} onClose={() => (showAuthDialog = false)} />
