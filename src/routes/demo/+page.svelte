<script lang="ts">
	const demos = [
		{
			title: 'Lucia Auth',
			path: '/demo/lucia',
		},
		{
			title: '3D Scene',
			path: '/demo/scene',
		},
		{
			title: '3D Piano',
			path: '/demo/piano',
		},
		{
			title: 'CSG Demo',
			path: '/demo/csg',
		},
	];
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-8 bg-neutral-200">
	<h1 class="text-4xl font-bold">Available Demos</h1>
	<div class="flex flex-col gap-4">
		{#each demos as demo}
			<a
				href={demo.path}
				class="rounded-lg border-2 border-gray-400 bg-white px-8 py-4 text-center text-xl font-medium shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
			>
				{demo.title}
			</a>
		{/each}
	</div>
</div>
