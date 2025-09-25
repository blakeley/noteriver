<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls, Portal, Outlines } from '@threlte/extras';
	import * as THREE from 'three';
	import { INTERSECTION, SUBTRACTION, Brush, Evaluator, ADDITION } from 'three-bvh-csg';
	import type { Mesh } from 'three';

	const { scene } = useThrelte();

	// props (Svelte 5 runes)
	let {
		rotationEnabled = true,
		smoothness = 8,
		lightX = 0,
		lightY = 0,
		lightZ = 0,
		lightIntensity = 1
	} = $props();

	// state
	let meshRef = $state.raw<Mesh>();
	let rotation = $state({ x: 0, y: 0, z: 0 });

	const evaluator = new Evaluator();
	// Compute geometry based on smoothness
	const geometry = $derived.by(() => {
		// Create unit cube (side length = 1)
		const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

		// Create second cube rotated 30° along X axis and positioned to form rhombus
		const rotatedBoxGeometry = new THREE.BoxGeometry(1, Math.sqrt(3) / 8, 1);
		const rotatedBoxBrush = new Brush(rotatedBoxGeometry);
		rotatedBoxBrush.rotation.x = -Math.PI / 6;
		// This math isn't quite right, but it's close enough
		rotatedBoxBrush.position.y = -2 / 3;
		rotatedBoxBrush.updateMatrixWorld();

		// Create sphere with radius sqrt(2)/2 centered at origin
		const sphereGeometry = new THREE.SphereGeometry(Math.SQRT2 / 2, 2 * smoothness, smoothness);

		// Create brushes at origin (0,0,0)
		const boxBrush = new Brush(boxGeometry);
		boxBrush.updateMatrixWorld();

		// Combine the two cubes
		const combinedCubes = evaluator.evaluate(boxBrush, rotatedBoxBrush, ADDITION);

		// Early return to investigate the rhombus shape
		combinedCubes.geometry.computeVertexNormals();
		boxGeometry.dispose();
		rotatedBoxGeometry.dispose();
		sphereGeometry.dispose();
		// return combinedCubes.geometry;

		const sphereBrush = new Brush(sphereGeometry);
		sphereBrush.updateMatrixWorld();

		// Perform intersection operation with combined cubes and sphere
		const intersectionResult = evaluator.evaluate(combinedCubes, sphereBrush, INTERSECTION);

		// Create a second cube offset by 0.5 in Y direction
		const offsetCubeGeometry = new THREE.BoxGeometry(1, 5.5);
		const offsetCubeBrush = new Brush(offsetCubeGeometry);
		offsetCubeBrush.position.y = offsetCubeGeometry.parameters.height / 2; // Position at edge of original cube
		offsetCubeBrush.updateMatrixWorld();

		// Subtract the offset cube from the intersection result
		const finalResult = evaluator.evaluate(intersectionResult, offsetCubeBrush, ADDITION);

		finalResult.geometry.computeVertexNormals();

		// Cleanup source geometries
		boxGeometry.dispose();
		rotatedBoxGeometry.dispose();
		sphereGeometry.dispose();
		offsetCubeGeometry.dispose();
		combinedCubes.geometry.dispose();
		intersectionResult.geometry.dispose();

		return finalResult.geometry;
	});

	// rotation animation
	useTask((delta) => {
		if (!meshRef || !rotationEnabled) return;
		rotation.x += delta * 4;
		rotation.y += delta * 2;
		rotation.z += delta * 1;
		meshRef.rotation.set(rotation.x, rotation.y, rotation.z);
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 50]}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1} />
<T.DirectionalLight position={[lightX, lightY, lightZ]} intensity={lightIntensity}>
	{#snippet children({ ref })}
		<T.Object3D attach="target" position={[0, 0, 0]} />
		<Portal object={scene}>
			<T.DirectionalLightHelper args={[ref, 0.5, 'red']} />
		</Portal>
	{/snippet}
</T.DirectionalLight>

<T.Mesh bind:ref={meshRef} {geometry} scale={4}>
	<T.MeshStandardMaterial color="hotpink" roughness={0.5} metalness={0.5} />
	<!-- <Outlines color="black" thickness={0.01} /> -->
</T.Mesh>
