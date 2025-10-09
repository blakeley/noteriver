<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import * as THREE from 'three';
	import SelectiveBloom from './SelectiveBloom.svelte';
	import PerlinNoiseLine from '$lib/components/PerlinNoiseLine.svelte';

	// Set proper color management - using legacy API for compatibility
	// @ts-ignore - legacyMode exists but not in types
	THREE.ColorManagement.legacyMode = false;
</script>

<!-- Camera and controls -->
<T.PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40}>
	<OrbitControls
		enableDamping
		dampingFactor={0.05}
		maxPolarAngle={Math.PI * 0.5}
		minDistance={1}
		maxDistance={100}
	/>
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.1} />

<!-- Perlin noise line above the shapes -->
<PerlinNoiseLine
	position={[0, 1, 0]}
	color={'hotpink'}
	opacity={0.8}
	linewidth={3}
	amplitude={0.2}
	length={10}
/>

<!-- This mesh will glow with emissive -->
<T.Mesh position={[-3, -1, 0]} scale={1}>
	<T.SphereGeometry args={[1, 32, 16]} />
	<T.MeshStandardMaterial toneMapped={false} emissive="cyan" emissiveIntensity={1.5} />
</T.Mesh>

<!-- This mesh will also glow with high RGB values -->
<T.Mesh position={[3, -1, 0]} scale={2}>
	<T.BoxGeometry args={[1, 1, 1]} />
	<T.MeshBasicMaterial toneMapped={false} color={new THREE.Color().setRGB(1, 1, 2)} />
</T.Mesh>

<!-- Rectangle stage (no bloom) -->
<T.Mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
	<T.PlaneGeometry args={[12, 8]} />
	<T.MeshBasicMaterial color={0x222222} />
</T.Mesh>

<!-- Selective bloom effect -->
<SelectiveBloom />
