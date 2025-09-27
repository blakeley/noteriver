<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Keyboard } from '$lib/midi-player/keyboard';
	import {
		OrbitControls,
		Portal,
		RoundedBoxGeometry,
		InstancedMesh,
		Instance
	} from '@threlte/extras';
	import * as THREE from 'three';
	import { ebonyKeyGeometry } from '$lib/midi-player/ebonyKeyGeometry';

	// Props for light control
	let { lightX = 0, lightY = -100, lightZ = 200, lightIntensity = 1 } = $props();

	// Get viewport size and scene
	const { size, scene } = useThrelte();

	// Set scene background color
	scene.background = new THREE.Color('#2c2c2c');

	// Create anisotropy map for brushed metal effect
	const createAnisotropyMap = () => {
		const width = 256;
		const height = 256;
		const size = width * height;
		const data = new Uint8Array(3 * size);

		// Create vertical brushed pattern
		for (let i = 0; i < size; i++) {
			const x = i % width;
			const y = Math.floor(i / width);

			// Create vertical streaks with noise
			const streak = Math.sin(x * 0.5) * 0.3 + 0.7;
			const noise = (Math.random() - 0.5) * 0.1;
			const value = Math.min(255, Math.max(0, (streak + noise) * 255));

			data[i * 3] = value; // R
			data[i * 3 + 1] = value; // G
			data[i * 3 + 2] = value; // B
		}

		const texture = new THREE.DataTexture(data, width, height);
		texture.needsUpdate = true;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 4); // Stretch pattern vertically
		return texture;
	};

	const anisotropyMap = createAnisotropyMap();

	// Calculate actual keyboard dimensions
	const firstKey = Keyboard.MIDI_NUMBERS[0];
	if (!firstKey) throw new Error('No first key');
	const lastKey = Keyboard.MIDI_NUMBERS[Keyboard.MIDI_NUMBERS.length - 1];
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
	{#each Keyboard.IVORY_MIDI_NUMBERS as midiNumber}
		<T.Mesh position={[midiNumber.x + midiNumber.width / 2, 0, 0]}>
			<RoundedBoxGeometry
				args={[midiNumber.width * 0.95, Keyboard.IVORY_HEIGHT, Keyboard.IVORY_THICKNESS]}
				radius={midiNumber.width * 0.95 * 0.1}
				creaseAngle={100}
			/>
			<T.MeshStandardMaterial color="#fffff0" roughness={1} metalness={0} />
		</T.Mesh>
	{/each}

	<!-- Ebony Keys InstancedMesh -->
	<InstancedMesh geometry={ebonyKeyGeometry}>
		<T.MeshPhysicalMaterial
			color={Keyboard.EBONY_KEY_COLOR}
			roughness={0.5}
			metalness={0.5}
			clearcoat={0}
			clearcoatRoughness={0.1}
			side={THREE.DoubleSide}
		/>

		{#each Keyboard.EBONY_MIDI_NUMBERS as midiNumber}
			<Instance
				position={[
					midiNumber.x + midiNumber.width / 2,
					(Keyboard.IVORY_HEIGHT - Keyboard.EBONY_HEIGHT) / 2,
					Keyboard.EBONY_ELEVATION
				]}
				rotation={[0, 0, 0]}
				scale={[midiNumber.width, Keyboard.EBONY_HEIGHT / 7.5, Keyboard.EBONY_THICKNESS]}
			/>
		{/each}
	</InstancedMesh>
</T.Group>
