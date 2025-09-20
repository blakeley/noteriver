<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		open = false,
		onClose
	}: {
		open?: boolean;
		onClose?: () => void;
	} = $props();

	let isRegistering = $state(false);
	let email = $state('');
	let password = $state('');
	let username = $state('');
	let loading = $state(false);
	let emailError = $state('');
	let passwordError = $state('');

	function closeDialog() {
		if (onClose) onClose();
		// Reset form after close animation
		setTimeout(() => {
			email = '';
			password = '';
			username = '';
			emailError = '';
			passwordError = '';
			loading = false;
		}, 300);
	}

	function switchAuthMode() {
		isRegistering = !isRegistering;
		emailError = '';
		passwordError = '';
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex min-h-full items-center justify-center p-4 text-center">
			<!-- Backdrop -->
			<div
				class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
				onclick={closeDialog}
				onkeydown={(e) => e.key === 'Escape' && closeDialog()}
				role="button"
				tabindex="-1"
			></div>

			<!-- Dialog -->
			<div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
				<div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
					<h3 class="text-lg font-semibold leading-6 text-gray-900 mb-4">
						{isRegistering ? 'Create New Account' : 'Log in'}
					</h3>

					<div class="text-center text-sm mb-6">
						{#if isRegistering}
							<p>Join the NoteRiver community! Let's set up your account.</p>
							<p class="mt-2">
								Already have one?
								<button
									type="button"
									onclick={switchAuthMode}
									class="text-primary-600 hover:text-primary-500 font-medium"
								>
									Log in instead
								</button>
							</p>
						{:else}
							<p>Welcome back! Let's get you logged in.</p>
							<p class="mt-2">
								Don't have an account yet?
								<button
									type="button"
									onclick={switchAuthMode}
									class="text-primary-600 hover:text-primary-500 font-medium"
								>
									Create one instead
								</button>
							</p>
						{/if}
					</div>

					<form
						method="POST"
						action={isRegistering ? '/signup' : '/login'}
						use:enhance={() => {
							loading = true;
							return async ({ result, update }) => {
								loading = false;
								if (result.type === 'redirect') {
									closeDialog();
								} else if (result.type === 'failure') {
									const data = result.data as { error?: string };
									if (data?.error) {
										if (data.error.toLowerCase().includes('email')) {
											emailError = data.error;
										} else if (data.error.toLowerCase().includes('password')) {
											passwordError = data.error;
										}
									}
								}
								await update();
							};
						}}
					>
						<div class="space-y-4">
							<div>
								<label for="email" class="block text-sm font-medium text-gray-700">
									Email
								</label>
								<input
									type="email"
									id="email"
									name="email"
									bind:value={email}
									required
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
									class:border-red-500={emailError}
								/>
								{#if emailError}
									<p class="mt-1 text-sm text-red-600">{emailError}</p>
								{/if}
							</div>

							<div>
								<label for="password" class="block text-sm font-medium text-gray-700">
									Password
								</label>
								<input
									type="password"
									id="password"
									name="password"
									bind:value={password}
									required
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
									class:border-red-500={passwordError}
								/>
								{#if passwordError}
									<p class="mt-1 text-sm text-red-600">{passwordError}</p>
								{/if}
							</div>

							{#if isRegistering}
								<div>
									<label for="username" class="block text-sm font-medium text-gray-700">
										Username
									</label>
									<input
										type="text"
										id="username"
										name="username"
										bind:value={username}
										required
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
									/>
								</div>
							{/if}
						</div>

						<div class="mt-6 flex items-center justify-end space-x-3">
							<button
								type="button"
								onclick={closeDialog}
								class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								class="inline-flex justify-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{#if loading}
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{/if}
								{isRegistering ? 'Join NoteRiver!' : 'Log in'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}