<script lang="ts">
	const demos = [
		{
			title: '3D Scene Demo',
			description: 'A rotating cube with lighting and effects',
			path: '/demo/scene'
		},
		{
			title: '3D Piano Keyboard',
			description: 'An interactive 88-key piano keyboard in 3D',
			path: '/demo/piano'
		}
	];
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-8 bg-neutral-200">
	<h1 class="text-4xl font-bold">Threlte Demos</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each demos as demo}
			<a
				href={demo.path}
				class="rounded-lg border-2 border-gray-400 bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
			>
				<h2 class="mb-2 text-2xl font-semibold">{demo.title}</h2>
				<p class="text-gray-600">{demo.description}</p>
			</a>
		{/each}
	</div>
</div>
