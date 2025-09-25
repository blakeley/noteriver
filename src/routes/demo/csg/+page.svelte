<script lang="ts">
	import { Canvas } from '@threlte/core';
	import CSGScene from './CSGScene.svelte';
	import * as THREE from 'three';

	let rotationEnabled = $state(false);
	let smoothness = $state(16);

	// Light control state
	let lightX = $state(0);
	let lightY = $state(-1);
	let lightZ = $state(10);
	let lightIntensity = $state(3);
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-200">
	<h1 class="text-2xl font-bold">CSG Demo</h1>

	<div class="flex items-center gap-4">
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={rotationEnabled} class="h-4 w-4" />
			<span>Enable Rotation</span>
		</label>

		<label class="flex items-center gap-2">
			<span class="text-sm">Smoothness:</span>
			<input type="range" bind:value={smoothness} min={4} max={64} class="w-32" />
			<span class="w-8 text-sm text-gray-600">{smoothness}</span>
		</label>
	</div>

	<!-- Light Controls -->
	<div class="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-lg">
		<h2 class="text-sm font-semibold">Light Controls</h2>
		<div class="flex flex-wrap gap-4">
			<label class="flex items-center gap-2">
				<span class="w-12 text-sm">X:</span>
				<input type="range" bind:value={lightX} min={-10} max={10} step={0.1} class="w-32" />
				<span class="w-12 text-sm text-gray-600">{lightX}</span>
			</label>
			<label class="flex items-center gap-2">
				<span class="w-12 text-sm">Y:</span>
				<input type="range" bind:value={lightY} min={-10} max={10} step={0.1} class="w-32" />
				<span class="w-12 text-sm text-gray-600">{lightY}</span>
			</label>
			<label class="flex items-center gap-2">
				<span class="w-12 text-sm">Z:</span>
				<input type="range" bind:value={lightZ} min={0} max={10} step={0.1} class="w-32" />
				<span class="w-12 text-sm text-gray-600">{lightZ}</span>
			</label>
			<label class="flex items-center gap-2">
				<span class="w-20 text-sm">Intensity:</span>
				<input type="range" bind:value={lightIntensity} min={0} max={10} step={0.2} class="w-32" />
				<span class="w-12 text-sm text-gray-600">{lightIntensity}</span>
			</label>
		</div>
	</div>

	<div class="aspect-video w-full max-w-screen-lg border-4 border-dashed border-gray-500">
		<Canvas toneMapping={THREE.NoToneMapping}>
			<CSGScene {rotationEnabled} {smoothness} {lightX} {lightY} {lightZ} {lightIntensity} />
		</Canvas>
	</div>
</div>
