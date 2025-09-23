<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
</script>

<div class="flex h-full w-full items-center justify-center bg-neutral-200">
	<div class="aspect-video w-full max-w-screen-lg border-4 border-dashed border-gray-500">
		<Canvas>
			<Scene />
		</Canvas>
	</div>
</div>
