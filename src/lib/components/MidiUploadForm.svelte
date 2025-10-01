<script lang="ts">
	import { goto } from '$app/navigation';

	let fileInput = $state<HTMLInputElement>();
	let dragOver = $state(false);
	let uploading = $state(false);
	let selectedFile = $state<File | null>(null);
	let fileName = $state('');
	let title = $state('');
	let description = $state('');
	let error = $state('');

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const files = e.dataTransfer?.files;
		if (files && files[0]) {
			processFile(files[0]);
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			processFile(input.files[0]);
		}
	}

	function processFile(file: File) {
		if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
			error = 'Please select a valid MIDI file (.mid or .midi)';
			return;
		}

		selectedFile = file;
		fileName = file.name;
		error = '';

		// Pre-fill title with filename without extension
		if (!title) {
			title = fileName.replace(/\.midi?$/i, '');
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!selectedFile || !title.trim()) {
			error = 'Please select a file and provide a title';
			return;
		}

		uploading = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('file', selectedFile);
			formData.append('title', title.trim());
			formData.append('description', description.trim());

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Upload failed');
			}

			const data = await response.json();
			goto(`/midis/${data.midi.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred during upload';
			console.error('Upload error:', err);
		} finally {
			uploading = false;
		}
	}

	function resetForm() {
		selectedFile = null;
		fileName = '';
		title = '';
		description = '';
		error = '';
		if (fileInput) fileInput.value = '';
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- File Upload Area -->
	<div>
		<div class="mb-2 block text-sm font-medium text-gray-700">MIDI File</div>
		<button
			type="button"
			onclick={() => fileInput?.click()}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			class="relative w-full rounded-lg border-2 border-dashed p-8 text-center transition-all hover:border-gray-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
			class:border-gray-300={!dragOver && !fileName}
			class:border-yellow-500={dragOver}
			class:bg-yellow-50={dragOver}
			class:border-green-500={fileName && !uploading}
			class:bg-green-50={fileName && !uploading}
			disabled={uploading}
		>
			{#if !fileName && !uploading}
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p class="mt-2 text-sm text-gray-600">Click to select MIDI file, or drop MIDI file here</p>
				<p class="mt-1 text-xs text-gray-500">.mid or .midi files only</p>
			{:else if uploading}
				<svg class="mx-auto h-12 w-12 animate-spin text-yellow-600" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p class="mt-2 text-sm text-gray-600">Uploading...</p>
			{:else}
				<svg
					class="mx-auto h-12 w-12 text-green-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="mt-2 text-lg font-medium text-gray-900">{fileName}</p>
				<span class="mt-2 cursor-pointer text-sm text-yellow-600 hover:text-yellow-500">
					Change file
				</span>
			{/if}
			<input
				bind:this={fileInput}
				type="file"
				accept=".mid,.midi"
				onchange={handleFileSelect}
				class="hidden"
				disabled={uploading}
			/>
		</button>
	</div>

	<!-- Title Input -->
	<div>
		<label for="title" class="mb-2 block text-sm font-medium text-gray-700"> Title </label>
		<input
			type="text"
			id="title"
			bind:value={title}
			placeholder="Enter MIDI title"
			required
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
			disabled={uploading}
		/>
	</div>

	<!-- Description Input -->
	<div>
		<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
			Description (optional)
		</label>
		<textarea
			id="description"
			bind:value={description}
			rows="4"
			placeholder="Enter a description for your MIDI file"
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
			disabled={uploading}
		></textarea>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="rounded-md border border-red-200 bg-red-50 p-4">
			<p class="text-sm text-red-700">{error}</p>
		</div>
	{/if}

	<!-- Submit Buttons -->
	<div class="flex items-center justify-between space-x-3">
		<button
			type="button"
			onclick={resetForm}
			class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
			disabled={uploading}
		>
			Clear
		</button>

		<button
			type="submit"
			disabled={!selectedFile || !title || uploading}
			class="flex items-center justify-center rounded-md bg-yellow-600 px-6 py-2 text-sm font-medium text-white hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if uploading}
				<svg class="mr-2 -ml-1 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				Uploading...
			{:else}
				<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				Upload MIDI
			{/if}
		</button>
	</div>
</form>
