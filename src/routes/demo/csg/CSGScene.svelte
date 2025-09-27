<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls, Portal, Outlines } from '@threlte/extras';
	import * as THREE from 'three';
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

	// Compute geometry based on smoothness
	const geometry = $derived.by(() => {
		// 1) Rect shape in XY (we'll extrude along +Z)
		const W = 1.0; // width (X)
		const D = W * 5.5; // depth (Y)
		const H = 1; // height (Z)
		const fillet = 0.15; // top edge rounding radius

		const shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(W / 6, 0);
		shape.lineTo(W, W / 2);
		shape.lineTo(W, D);
		shape.lineTo(0, D);
		shape.lineTo(0, 0);

		// 2) Extrude with bevel to round the *top* perimeter edges
		const geom = new THREE.ExtrudeGeometry(shape, {
			depth: H,

			bevelEnabled: true,
			bevelThickness: fillet, // thickness into the top face
			bevelSize: fillet, // how far in from the edge
			bevelSegments: 4,
			curveSegments: 4
		});

		geom.rotateY(-Math.PI / 2);
		geom.rotateZ(0);
		geom.rotateX(0);

		// Center it if you like
		geom.translate(W / 2, (-D * 1) / 16, 0);

		return geom;
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
