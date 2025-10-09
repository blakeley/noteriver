<script lang="ts">
	import { OrbitControls, RoundedBoxGeometry, Portal, Outlines } from '@threlte/extras';
	import { T, useTask, useThrelte } from '@threlte/core';
	import type { Mesh } from 'three';

	const { scene } = useThrelte();

	let { rotationEnabled = true } = $props();

	let meshRef = $state.raw<Mesh>();
	let rotation = $state({ x: 0, y: 0, z: 0 });

	useTask((delta) => {
		if (!meshRef || !rotationEnabled) return;
		rotation.x += delta * 4;
		rotation.y += delta * 2;
		rotation.z += delta * 1;
		meshRef.rotation.set(rotation.x, rotation.y, rotation.z);
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 20]}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.2} />
<T.DirectionalLight position={[4, 4, 4]} intensity={1}>
	{#snippet children({ ref })}
		<T.Object3D attach="target" position={[0, 0, 0]} />
		<Portal object={scene}>
			<T.DirectionalLightHelper args={[ref, 0.5, 'red']} />
		</Portal>
	{/snippet}
</T.DirectionalLight>

<T.Mesh bind:ref={meshRef}>
	<RoundedBoxGeometry args={[2, 4, 1]} radius={0.1} />
	<T.MeshStandardMaterial color="hotpink" />
	<Outlines color="black" thickness={0.05} />
</T.Mesh>
