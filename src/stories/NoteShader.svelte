<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import * as THREE from 'three';
	import fragmentShader from '$lib/shaders/note.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';

	let {
		width = 24,
		height = 300,
		bottomColor = '#deb4e2',
		topColor = '#8fc0fb',
		borderBlend = 0.6,
		borderRadius = 4,
		borderWidth = 4,
	} = $props<{
		width?: number;
		height?: number;
		bottomColor?: string;
		topColor?: string;
		borderBlend?: number;
		borderRadius?: number;
		borderWidth?: number;
	}>();

	// Geometry dimensions in pixels (1 unit = 1 pixel)
	const geo = $derived(new THREE.PlaneGeometry(width, height, 32, 32));
	const bottomColorObject = $derived(new THREE.Color(bottomColor));
	const topColorObject = $derived(new THREE.Color(topColor));

	// Perspective camera for pixel-perfect rendering
	// Calculate distance so that visible height = 400 pixels
	const fov = 50; // degrees
	const visibleHeight = 400; // pixels
	const cameraDistance = visibleHeight / (2 * Math.tan((fov * Math.PI) / 180 / 2));
</script>

<T.PerspectiveCamera makeDefault {fov} position={[0, 0, cameraDistance]}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<T.Mesh geometry={geo}>
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		uniforms={{
			uWidth: { value: 100 },
			uHeight: { value: 100 },
			uBottomColor: { value: new THREE.Color() },
			uTopColor: { value: new THREE.Color() },
			uBorderBlend: { value: 0.6 },
			uBorderRadius: { value: 4 },
			uBorderWidth: { value: 4 },
		}}
		uniforms.uWidth.value={width}
		uniforms.uHeight.value={height}
		uniforms.uBottomColor.value={bottomColorObject}
		uniforms.uTopColor.value={topColorObject}
		uniforms.uBorderBlend.value={borderBlend}
		uniforms.uBorderRadius.value={borderRadius}
		uniforms.uBorderWidth.value={borderWidth}
		transparent={true}
	/>
</T.Mesh>
