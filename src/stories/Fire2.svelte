<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls, Grid } from '@threlte/extras';
	import * as THREE from 'three';
	import fragmentShader from '$lib/shaders/fire2.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';

	let {
		heightPoint = 0.3,
		width = 4,
		height = 4,
	} = $props<{
		heightPoint?: number;
		width?: number;
		height?: number;
	}>();

	const heightPoints = $derived([heightPoint, 0.5]);
	const heightPointsPadded = $derived([
		...heightPoints,
		...new Array(10 - heightPoints.length).fill(0),
	]);

	const geometry = $derived(new THREE.PlaneGeometry(width, height, 32, 32));
	const borderGeometry = $derived(new THREE.PlaneGeometry(width, height));

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
			uWidth: { value: 4 },
			uHeight: { value: 4 },
			uHeightPoints: { value: new Array(10).fill(0) },
			uHeightPointCount: { value: 0 },
		}}
		uniforms.uTime.value={time}
		uniforms.uWidth.value={width}
		uniforms.uHeight.value={height}
		uniforms.uHeightPoints.value={heightPointsPadded}
		uniforms.uHeightPointCount.value={heightPoints.length}
		transparent={true}
	/>
</T.Mesh>
<T.Mesh geometry={borderGeometry}>
	<T.MeshBasicMaterial color="white" wireframe={true} transparent={true} opacity={0.5} />
</T.Mesh>
