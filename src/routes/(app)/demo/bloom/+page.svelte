<script lang="ts">
	import { Canvas } from '@threlte/core';
	import * as THREE from 'three';
	import BloomScene from './BloomScene.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-200">
	<h1 class="text-2xl font-bold">Selective Bloom Demo</h1>
	<p class="text-sm text-gray-600">Demonstrating selective bloom effect on 3D objects</p>

	<div class="aspect-video w-full max-w-screen-lg border-4 border-dashed border-gray-500 bg-black">
		<Canvas toneMapping={THREE.NoToneMapping}>
			<BloomScene />
		</Canvas>
	</div>
</div>
