<script lang="ts">
	import { OrbitControls, Portal } from '@threlte/extras';
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import EbonyKey from './EbonyKey.svelte';

	console.log('GLBScene');

	const { scene: threlteScene, camera } = useThrelte();

	let { rotationEnabled = true, lightX = 5, lightY = 5, lightZ = 5, lightIntensity = 3 } = $props();

	let modelRef = $state.raw<THREE.Group>();
	let rotation = $state({ x: 0, y: 0, z: 0 });
	let modelScale = $state(0.5); // Smaller scale to see more
	let modelPosition = $state<[number, number, number]>([0, 0, 0]);

	useTask((delta) => {
		if (!modelRef || !rotationEnabled) return;
		rotation.z += delta * 0.5;
		modelRef.rotation.z = rotation.z;
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 30]}>
	<OrbitControls
		enableDamping
		target={[0, 0, 0]}
		enablePan={true}
		enableZoom={true}
		enableRotate={true}
		dampingFactor={0.05}
		rotateSpeed={1}
		panSpeed={1}
		zoomSpeed={1}
	/>
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[lightX, lightY, lightZ]} intensity={lightIntensity}>
	{#snippet children({ ref })}
		<T.Object3D attach="target" position={[0, 0, 0]} />
		<Portal object={threlteScene}>
			<T.DirectionalLightHelper args={[ref, 0.5, 'red']} />
		</Portal>
	{/snippet}
</T.DirectionalLight>

<!-- Grid helper on XY plane (rotated 90 degrees around X axis) -->
<T.GridHelper args={[30, 20]} rotation={[Math.PI / 2, 0, 0]} />

<!-- Axes helper to see orientation -->
<!-- <T.AxesHelper args={[5]} /> -->

<!-- The GLTF model with auto-centering and scaling -->
<T.Group bind:ref={modelRef} scale={modelScale} position={modelPosition} rotation={[Math.PI, 0, 0]}>
	<EbonyKey fallback={null} error={null} children={null} />
</T.Group>
