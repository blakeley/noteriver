<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { keyboard } from '$lib/midi-player/keyboard';
	import { OrbitControls, Portal, RoundedBoxGeometry } from '@threlte/extras';
	import * as THREE from 'three';

	// Props for light control
	let { lightX = 0, lightY = -100, lightZ = 200, lightIntensity = 1 } = $props();

	// Get viewport size and scene
	const { size, scene } = useThrelte();

	// Set scene background color
	scene.background = new THREE.Color('#2c2c2c');

	// Calculate actual keyboard dimensions
	const firstKey = keyboard.MIDI_NUMBERS[0];
	if (!firstKey) throw new Error('No first key');
	const lastKey = keyboard.MIDI_NUMBERS[keyboard.MIDI_NUMBERS.length - 1];
	if (!lastKey) throw new Error('No last key');
	const actualKeyboardWidth = lastKey.x - firstKey.x + lastKey.width;

	// Use viewport pixel dimensions (matching ThreltePianoRoll pattern)
	const viewportWidth = $derived(size.current.width);
	const viewportHeight = $derived(size.current.height);

	// Scale keyboard to match viewport width in pixels
	const scale = $derived(viewportWidth / actualKeyboardWidth);

	// Camera position in pixel coordinates
	const cameraPosition = $derived<[number, number, number]>([
		viewportWidth / 2,
		viewportHeight / 2,
		100
	]);
</script>

<T.OrthographicCamera
	makeDefault
	position={cameraPosition}
	left={0}
	right={viewportWidth}
	top={viewportHeight}
	bottom={0}
	near={-1000}
	far={1000}
>
	<OrbitControls enableDamping target={[viewportWidth / 2, viewportHeight / 2, 0]} />
</T.OrthographicCamera>

<T.DirectionalLight
	position={[viewportWidth / 2 + lightX, viewportHeight / 2 + lightY, lightZ]}
	intensity={lightIntensity}
	color="white"
>
	{#snippet children({ ref })}
		<T.Object3D attach="target" position={[viewportWidth / 2, viewportHeight / 2, 0]} />
		<Portal object={scene}>
			<T.DirectionalLightHelper args={[ref, 50, 'white']} />
		</Portal>
	{/snippet}
</T.DirectionalLight>

<!-- Piano Keyboard Group -->
<T.Group {scale} position={[-firstKey.x * scale, viewportHeight / 2, 0]}>
	<!-- Ivory Keys -->
	{#each keyboard.IVORY_MIDI_NUMBERS as midiNumber}
		<T.Mesh position={[midiNumber.x + midiNumber.width / 2, 0, 0]}>
			<RoundedBoxGeometry
				args={[midiNumber.width * 0.95, keyboard.IVORY_HEIGHT, keyboard.IVORY_THICKNESS]}
				radius={midiNumber.width * 0.95 * 0.1}
				creaseAngle={100}
			/>
			<T.MeshStandardMaterial color="#fffff0" roughness={1} metalness={0} />
		</T.Mesh>
	{/each}

	<!-- Ebony Keys -->
	{#each keyboard.EBONY_MIDI_NUMBERS as midiNumber}
		<T.Mesh
			position={[
				midiNumber.x + midiNumber.width / 2,
				(keyboard.IVORY_HEIGHT - keyboard.EBONY_HEIGHT) / 2,
				keyboard.EBONY_ELEVATION
			]}
		>
			<RoundedBoxGeometry
				args={[midiNumber.width, keyboard.EBONY_HEIGHT, keyboard.EBONY_THICKNESS]}
				radius={midiNumber.width / 4}
				creaseAngle={100}
			/>
			<T.MeshStandardMaterial color="#0D0D12" roughness={0.5} metalness={0.5} />
		</T.Mesh>
	{/each}
</T.Group>
