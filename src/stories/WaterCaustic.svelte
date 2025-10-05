<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls, Grid } from '@threlte/extras';
	import * as THREE from 'three';
	import fragmentShader from '$lib/shaders/watercaustic.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';

	let { color = '#005980' } = $props<{
		color?: string;
	}>();

	const geometry = new THREE.PlaneGeometry(4, 4, 32, 32);
	const colorObject = $derived(new THREE.Color(color));

	let time = $state(0);

	useTask((delta) => {
		time += delta;
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 5]}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>
<Grid cellSize={0.5} sectionSize={2} gridSize={[20, 20]} />
<T.Mesh {geometry}>
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		uniforms={{
			uTime: { value: 0 },
			uResolution: { value: new THREE.Vector2(800, 800) },
			uColor: { value: new THREE.Color() },
		}}
		uniforms.uTime.value={time}
		uniforms.uColor.value={colorObject}
	/>
</T.Mesh>
