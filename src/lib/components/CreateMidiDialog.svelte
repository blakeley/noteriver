<script lang="ts">
	import { goto } from '$app/navigation';

	let {
		open = false,
		onClose
	}: {
		open?: boolean;
		onClose?: () => void;
	} = $props();

	let fileInput = $state<HTMLInputElement>();
	let dragOver = $state(false);
	let uploadingFile = $state(false);
	let creatingMidi = $state(false);
	let fileName = $state('');
	let title = $state('');
	let description = $state('');
	let s3key = $state('');
	let duration = $state(0);
	let instruments = $state<number[]>([]);

	function closeDialog() {
		if (onClose) onClose();
		// Reset form after close animation
		setTimeout(() => {
			fileName = '';
			title = '';
			description = '';
			s3key = '';
			duration = 0;
			instruments = [];
			uploadingFile = false;
			creatingMidi = false;
		}, 300);
	}

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

	async function processFile(file: File) {
		uploadingFile = true;
		fileName = file.name;

		try {
			// Parse MIDI file client-side if needed
			// For now, we'll upload directly
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/files', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) throw new Error('File upload failed');

			const data = await response.json();
			s3key = data.s3key;
			duration = data.duration || 0;
			instruments = data.instruments || [];

			// Pre-fill title with filename without extension
			if (!title) {
				title = fileName.replace(/\.midi?$/i, '');
			}
		} catch (error) {
			console.error('Error processing file:', error);
			alert('Failed to process MIDI file');
		} finally {
			uploadingFile = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function createMidi() {
		if (!s3key || !title) return;

		creatingMidi = true;
		try {
			const response = await fetch('/api/midis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					s3key,
					title: title.trim(),
					description: description.trim(),
					duration,
					instruments
				})
			});

			if (!response.ok) throw new Error('Failed to create MIDI');

			const midi = await response.json();
			closeDialog();
			goto(`/midis/${midi.id}`);
		} catch (error) {
			console.error('Error creating MIDI:', error);
			alert('Failed to create MIDI');
		} finally {
			creatingMidi = false;
		}
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
						Upload MIDI
					</h3>

					<div class="space-y-4">
						<!-- File Upload Area -->
						<button
							type="button"
							onclick={() => fileInput?.click()}
							ondragover={handleDragOver}
							ondragleave={handleDragLeave}
							ondrop={handleDrop}
							class="w-full relative border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
							class:border-gray-300={!dragOver}
							class:border-primary-500={dragOver}
							class:bg-primary-50={dragOver}
						>
							{#if !fileName && !uploadingFile}
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
								<p class="mt-2 text-sm text-gray-600">
									Click to select MIDI file,<br />or drop MIDI file here
								</p>
							{:else if uploadingFile}
								<svg class="animate-spin mx-auto h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<p class="mt-2 text-sm text-gray-600">Processing...</p>
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
							{/if}
							<input
								bind:this={fileInput}
								type="file"
								accept=".mid,.midi"
								onchange={handleFileSelect}
								class="hidden"
							/>
						</button>

						<!-- Title Input -->
						<div>
							<label for="title" class="block text-sm font-medium text-gray-700">
								Title
							</label>
							<input
								type="text"
								id="title"
								bind:value={title}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
								placeholder="Enter MIDI title"
							/>
						</div>

						<!-- Description Input -->
						<div>
							<label for="description" class="block text-sm font-medium text-gray-700">
								Description (optional)
							</label>
							<textarea
								id="description"
								bind:value={description}
								rows="3"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
								placeholder="Enter description"
							></textarea>
						</div>
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
							type="button"
							onclick={createMidi}
							disabled={!s3key || !title || creatingMidi}
							class="inline-flex items-center justify-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if creatingMidi}
								<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							{:else}
								<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
							{/if}
							Upload
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}