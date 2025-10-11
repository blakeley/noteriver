<script lang="ts">
	import { enhance } from '$app/forms';
	import GoogleLogo from '$lib/components/GoogleLogo.svg.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
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
				<form method="post" use:enhance class="flex flex-col gap-6">
					<div class="flex flex-col items-center gap-1 text-center">
						<h1 class="text-2xl font-bold">Login to your account</h1>
						<p class="text-muted-foreground text-sm text-balance">
							Enter your email below to login to your account
						</p>
					</div>

					<div class="grid gap-2">
						<label
							for="email"
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Email</label
						>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="m@example.com"
							required
							class="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						/>
					</div>

					<div class="grid gap-2">
						<div class="flex items-center">
							<label
								for="password"
								class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>Password</label
							>
							<a href="#" class="ml-auto text-sm underline-offset-4 hover:underline">
								Forgot your password?
							</a>
						</div>
						<input
							type="password"
							id="password"
							name="password"
							required
							class="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						/>
					</div>

					{#if form?.message}
						<p class="text-center text-sm text-red-600">{form.message}</p>
					{/if}

					<button
						type="submit"
						class="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/20 transition-colors hover:bg-primary-600 hover:shadow-primary-600/20 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						Login
					</button>

					<div class="flex flex-nowrap items-center justify-start text-sm">
						<div class="border-border flex-auto border-t"></div>
						<span class="text-muted-foreground flex-none px-4">Or continue with</span>
						<div class="border-border flex-auto border-t"></div>
					</div>

					<a
						href="/login/google"
						class="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
					>
						<GoogleLogo class="size-4" />
						Sign in with Google
					</a>

					<div class="text-center text-sm">
						Don&apos;t have an account?{' '}
						<a href="/signup" class="underline underline-offset-4"> Sign up </a>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="bg-muted relative hidden lg:block">
		<img
			src="/placeholder.svg"
			alt="Login background"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
