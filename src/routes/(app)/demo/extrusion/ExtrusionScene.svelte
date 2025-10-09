<script lang="ts">
	import { OrbitControls, Portal } from '@threlte/extras';
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { ebonyKeyGeometry } from '$lib/midi-player/ebonyKeyGeometry';

	const { scene: threlteScene } = useThrelte();

	let { rotationEnabled = true, lightX = 5, lightY = 5, lightZ = 5, lightIntensity = 3 } = $props();

	let meshRef = $state.raw<THREE.Mesh>();
	let rotation = $state({ x: 0, y: 0, z: 0 });

	useTask((delta) => {
		if (!meshRef || !rotationEnabled) return;
		rotation.x += delta * 4;
		rotation.y += delta * 2;
		rotation.z += delta * 1;
		meshRef.rotation.set(rotation.x, rotation.y, rotation.z);
	});
</script>

<!-- Camera positioned for better heightmap view -->
<T.PerspectiveCamera makeDefault position={[0, 0, 10]}>
	<OrbitControls
		enableDamping
		target={[0, -3, 0]}
		enablePan={true}
		enableZoom={true}
		enableRotate={true}
		dampingFactor={0.05}
		rotateSpeed={1}
		panSpeed={1}
		zoomSpeed={1}
	/>
</T.PerspectiveCamera>

<!-- Lighting -->
<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[lightX, lightY, lightZ]} intensity={lightIntensity}>
	{#snippet children({ ref })}
		<T.Object3D attach="target" position={[lightX, lightY, 0]} />
		<Portal object={threlteScene}>
			<T.DirectionalLightHelper args={[ref, 0.5, 'red']} />
		</Portal>
	{/snippet}
</T.DirectionalLight>

<!-- Grid helper on XY plane (rotated 90 degrees around X axis) -->
<T.GridHelper args={[30, 20]} rotation={[Math.PI / 2, 0, 0]} />

<!-- Axes helper to see orientation -->
<T.AxesHelper args={[5]} />

<!-- Ebony Key Mesh -->
<T.Mesh bind:ref={meshRef} position={[-1, 0, 0]} geometry={ebonyKeyGeometry}>
	<T.MeshStandardMaterial
		color={0x3768a5}
		roughness={0.5}
		metalness={0.5}
		side={THREE.DoubleSide}
		wireframe={false}
	/>
</T.Mesh>

<T.Mesh bind:ref={meshRef} position={[1, 0, 0]} geometry={ebonyKeyGeometry}>
	<T.MeshPhysicalMaterial
		color={0x3768a5}
		roughness={0.5}
		metalness={0.5}
		side={THREE.DoubleSide}
		wireframe={false}
	/>
</T.Mesh>
