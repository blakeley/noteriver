<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls, Grid } from '@threlte/extras';
	import * as THREE from 'three';
	import fragmentShader from '$lib/shaders/voronoi.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';

	let {
		color = '#4a90e2',
		geometry = 'circle',
		cells = 5.0,
	} = $props<{
		color?: string;
		geometry?: 'plane' | 'circle';
		cells?: number;
	}>();

	const colorObject = $derived(new THREE.Color(color));
	const geo = $derived(
		geometry === 'circle' ? new THREE.CircleGeometry(2, 32) : new THREE.PlaneGeometry(4, 4, 32, 32),
	);

	let time = $state(0);

	useTask((delta) => {
		time += delta;
	});
</script>

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
			uCells: { value: 0 },
			uTime: { value: 0 },
		}}
		uniforms.uColor.value={colorObject}
		uniforms.uCells.value={cells}
		uniforms.uTime.value={time}
	/>
</T.Mesh>
