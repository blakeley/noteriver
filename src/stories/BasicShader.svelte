<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls, Grid } from '@threlte/extras';
	import * as THREE from 'three';
	import fragmentShader from '$lib/shaders/basic.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';

	let { color = '#ff6b6b', geometry = 'circle' } = $props<{
		color?: string;
		geometry?: 'plane' | 'circle';
	}>();

	const colorObject = $derived(new THREE.Color(color));
	const geo = $derived(
		geometry === 'circle' ? new THREE.CircleGeometry(2, 32) : new THREE.PlaneGeometry(4, 4, 32, 32),
	);
</script>

<div class="h-96 w-full">
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[0, 0, 5]}>
			<OrbitControls enableDamping />
		</T.PerspectiveCamera>
		<Grid cellSize={0.5} sectionSize={2} gridSize={[20, 20]} />
		<T.Mesh geometry={geo}>
			<T.ShaderMaterial
				{vertexShader}
				{fragmentShader}
				uniforms={{
					uColor: { value: new THREE.Color() },
				}}
				uniforms.uColor.value={colorObject}
			/>
		</T.Mesh>
	</Canvas>
</div>
