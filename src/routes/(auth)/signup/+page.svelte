<script lang="ts">
	import GoogleLogo from '$lib/components/GoogleLogo.svg.svelte';
</script>

<div class="bg-background">
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
					<form class="flex flex-col gap-6">
						<div
							data-slot="field-group"
							class="group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4"
						>
							<div class="flex flex-col items-center gap-1 text-center">
								<h1 class="text-2xl font-bold">Create your account</h1>
								<p class="text-muted-foreground text-sm text-balance">
									Fill in the form below to create your account
								</p>
							</div>

							<div
								role="group"
								data-slot="field"
								data-orientation="vertical"
								class="group/field data-[invalid=true]:text-destructive flex w-full flex-col gap-3 [&>*]:w-full [&>.sr-only]:w-auto"
							>
								<label
									data-slot="field-label"
									class="group/field-label peer/field-label has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10 flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 group-data-[disabled=true]/field:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4"
									for="name">Full Name</label
								>
								<input
									type="text"
									data-slot="input"
									class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									id="name"
									placeholder="John Doe"
									required
								/>
							</div>

							<div
								role="group"
								data-slot="field"
								data-orientation="vertical"
								class="group/field data-[invalid=true]:text-destructive flex w-full flex-col gap-3 [&>*]:w-full [&>.sr-only]:w-auto"
							>
								<label
									data-slot="field-label"
									class="group/field-label peer/field-label has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10 flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 group-data-[disabled=true]/field:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4"
									for="email">Email</label
								>
								<input
									type="email"
									data-slot="input"
									class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									id="email"
									placeholder="m@example.com"
									required
								/>
								<p
									data-slot="field-description"
									class="text-muted-foreground [&>a:hover]:text-primary text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [[data-variant=legend]+&]:-mt-1.5"
								>
									We'll use this to contact you. We will not share your email with anyone else.
								</p>
							</div>

							<div
								role="group"
								data-slot="field"
								data-orientation="vertical"
								class="group/field data-[invalid=true]:text-destructive flex w-full flex-col gap-3 [&>*]:w-full [&>.sr-only]:w-auto"
							>
								<label
									data-slot="field-label"
									class="group/field-label peer/field-label has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10 flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 group-data-[disabled=true]/field:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4"
									for="password">Password</label
								>
								<input
									type="password"
									data-slot="input"
									class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									id="password"
									required
								/>
								<p
									data-slot="field-description"
									class="text-muted-foreground [&>a:hover]:text-primary text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [[data-variant=legend]+&]:-mt-1.5"
								>
									Must be at least 8 characters long.
								</p>
							</div>

							<div
								role="group"
								data-slot="field"
								data-orientation="vertical"
								class="group/field data-[invalid=true]:text-destructive flex w-full flex-col gap-3 [&>*]:w-full [&>.sr-only]:w-auto"
							>
								<label
									data-slot="field-label"
									class="group/field-label peer/field-label has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10 flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 group-data-[disabled=true]/field:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4"
									for="confirm-password">Confirm Password</label
								>
								<input
									type="password"
									data-slot="input"
									class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									id="confirm-password"
									required
								/>
								<p
									data-slot="field-description"
									class="text-muted-foreground [&>a:hover]:text-primary text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [[data-variant=legend]+&]:-mt-1.5"
								>
									Please confirm your password.
								</p>
							</div>

							<div
								role="group"
								data-slot="field"
								data-orientation="vertical"
								class="group/field data-[invalid=true]:text-destructive flex w-full flex-col gap-3 [&>*]:w-full [&>.sr-only]:w-auto"
							>
								<button
									data-slot="button"
									class="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 has-[>svg]:px-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
									type="submit">Create Account</button
								>
							</div>

							<div class="flex items-center text-sm">
								<span
									class="text-muted-foreground before:border-border px-4 before:flex-1 before:border-t before:content-['']"
									>Or continue with</span
								>
								<div class="border-border flex-1 border-t"></div>
							</div>

							<div
								role="group"
								data-slot="field"
								data-orientation="vertical"
								class="group/field data-[invalid=true]:text-destructive flex w-full flex-col gap-3 [&>*]:w-full [&>.sr-only]:w-auto"
							>
								<button
									data-slot="button"
									class="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 has-[>svg]:px-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
									type="button"
								>
									<GoogleLogo class="size-4" />
									Sign up with Google
								</button>
								<p
									data-slot="field-description"
									class="text-muted-foreground [&>a:hover]:text-primary px-6 text-center text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [[data-variant=legend]+&]:-mt-1.5"
								>
									Already have an account? <a href="/login">Sign in</a>
								</p>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>

		<div class="bg-muted relative hidden lg:block">
			<img
				src="/placeholder.svg"
				alt="Image"
				class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
			/>
		</div>
	</div>
</div>
