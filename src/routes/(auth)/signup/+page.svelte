<script lang="ts">
	import { enhance } from '$app/forms';
	import GoogleLogo from '$lib/components/GoogleLogo.svg.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Client-side step management like the example
	let step = $state<1 | 2 | 3>(1);
	let email = $state('');
	let code = $state('');
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	// Update step when server responds successfully
	$effect(() => {
		if (form?.success && form?.step) {
			step = form.step as 1 | 2 | 3;
			if (form?.email) email = form.email;
			if (form?.code) code = form.code;
		}
	});
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center md:justify-start">
			<a href="/" class="flex items-center">
				<img src="/logo.svg" alt="NoteRiver Logo" class="h-10 w-10" />
				<img src="/product.svg" alt="NoteRiver" class="ml-[5px] h-6 pb-1" />
			</a>
		</div>

		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<!-- Progress Indicator -->
				<div class="mb-6 flex items-center justify-center gap-2">
					<div
						class="flex size-8 items-center justify-center rounded-full {step >= 1
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'}"
					>
						1
					</div>
					<div class="h-0.5 w-12 {step >= 2 ? 'bg-primary' : 'bg-muted'}"></div>
					<div
						class="flex size-8 items-center justify-center rounded-full {step >= 2
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'}"
					>
						2
					</div>
					<div class="h-0.5 w-12 {step >= 3 ? 'bg-primary' : 'bg-muted'}"></div>
					<div
						class="flex size-8 items-center justify-center rounded-full {step >= 3
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'}"
					>
						3
					</div>
				</div>

				{#if step === 1}
					<!-- Step 1: Email -->
					<form method="post" action="?/sendCode" use:enhance class="flex flex-col gap-6">
						<div class="flex flex-col items-center gap-1 text-center">
							<h1 class="text-2xl font-bold">Create your account</h1>
							<p class="text-muted-foreground text-sm text-balance">
								Enter your email to get started
							</p>
						</div>

						<div class="grid gap-2">
							<label for="email" class="text-sm font-medium">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								bind:value={email}
								placeholder="m@example.com"
								required
								class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						{#if form?.message}
							<p class="text-center text-sm text-red-600">{form.message}</p>
						{/if}

						<button
							type="submit"
							class="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary-600 focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:outline-none cursor-pointer disabled:pointer-events-none disabled:opacity-50"
						>
							Continue
						</button>

						<div class="flex flex-nowrap items-center justify-start text-sm">
							<div class="border-border flex-auto border-t"></div>
							<span class="text-muted-foreground flex-none px-4">Or continue with</span>
							<div class="border-border flex-auto border-t"></div>
						</div>

						<button
							type="button"
							class="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none cursor-pointer disabled:pointer-events-none disabled:opacity-50"
						>
							<GoogleLogo class="size-4" />
							Sign up with Google
						</button>

						<p class="text-center text-sm">
							Already have an account?{' '}
							<a href="/login" class="underline underline-offset-4">Sign in</a>
						</p>
					</form>
				{:else if step === 2}
					<!-- Step 2: Verify Code -->
					<div class="flex flex-col gap-6">
						<div class="flex flex-col items-center gap-1 text-center">
							<h1 class="text-2xl font-bold">Verify your email</h1>
							<p class="text-muted-foreground text-sm text-balance">
								We sent a verification code to <strong>{email}</strong>
							</p>
						</div>

						<form
							method="post"
							action="?/verifyCode"
							class="flex flex-col gap-6"
							onsubmit={(e) => {
								console.log('Form submitting! Email:', email, 'Code:', code);
							}}
						>
							<input type="hidden" name="email" value={email} />

							<div class="grid gap-2">
								<label for="code" class="text-sm font-medium">Verification Code</label>
								<input
									type="text"
									id="code"
									name="code"
									bind:value={code}
									placeholder="123456"
									pattern="[0-9]{'{'}6{'}'}"
									maxlength="6"
									required
									class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-center text-2xl font-bold tracking-widest shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>

							{#if form?.message}
								<p class="text-center text-sm text-red-600">{form.message}</p>
							{/if}

							<button
								type="submit"
								class="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary-600 focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:outline-none cursor-pointer disabled:pointer-events-none disabled:opacity-50"
							>
								Verify Code
							</button>
						</form>

						<form method="post" action="?/sendCode" use:enhance>
							<input type="hidden" name="email" value={email} />
							<button
								type="submit"
								class="text-muted-foreground hover:text-foreground w-full text-center text-sm underline-offset-4 hover:underline"
							>
								Didn't receive the code? Resend
							</button>
						</form>

						<button
							type="button"
							onclick={() => (step = 1)}
							class="text-muted-foreground hover:text-foreground w-full text-center text-sm underline-offset-4 hover:underline"
						>
							Change email address
						</button>
					</div>
				{:else if step === 3}
					<!-- Step 3: Create Account -->
					<form method="post" action="?/createAccount" use:enhance class="flex flex-col gap-6">
						<div class="flex flex-col items-center gap-1 text-center">
							<h1 class="text-2xl font-bold">Create your account</h1>
							<p class="text-muted-foreground text-sm text-balance">
								Choose a username and password
							</p>
						</div>

						<input type="hidden" name="email" value={email} />
						<input type="hidden" name="code" value={code} />

						<div class="grid gap-2">
							<label for="username" class="text-sm font-medium">Username</label>
							<input
								type="text"
								id="username"
								name="username"
								bind:value={username}
								placeholder="johndoe"
								pattern="[-a-z0-9_]{'{'}3,31{'}'}"
								required
								class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							/>
							<p class="text-muted-foreground text-xs">
								3-31 characters, lowercase letters, numbers, underscores, and hyphens only
							</p>
						</div>

						<div class="grid gap-2">
							<label for="password" class="text-sm font-medium">Password</label>
							<input
								type="password"
								id="password"
								name="password"
								bind:value={password}
								required
								class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							/>
							<p class="text-muted-foreground text-xs">At least 6 characters</p>
						</div>

						<div class="grid gap-2">
							<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								bind:value={confirmPassword}
								required
								class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						{#if form?.message}
							<p class="text-center text-sm text-red-600">{form.message}</p>
						{/if}

						<button
							type="submit"
							class="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary-600 focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:outline-none cursor-pointer disabled:pointer-events-none disabled:opacity-50"
						>
							Create Account
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>

	<div class="bg-muted relative hidden lg:block">
		<img
			src="/placeholder.svg"
			alt="Signup background"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
