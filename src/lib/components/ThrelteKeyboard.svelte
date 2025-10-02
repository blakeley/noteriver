<script lang="ts">
	import { T, type Props } from '@threlte/core';
	import { Keyboard } from '$lib/midi-player/keyboard';
	import { RoundedBoxGeometry, InstancedMesh, Instance } from '@threlte/extras';
	import * as THREE from 'three';
	import { ebonyKeyGeometry } from '$lib/midi-player/ebonyKeyGeometry';

	// Props - using T.Group's prop types
	const props: Props<THREE.Group> = $props();

	// Calculate keyboard offset
	const firstKey = Keyboard.MIDI_NUMBERS[0];
	if (!firstKey) throw new Error('No first key');
</script>

<T.Group {...props}>
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
					Keyboard.EBONY_ELEVATION,
				]}
				rotation={[0, 0, 0]}
				scale={[midiNumber.width, Keyboard.EBONY_HEIGHT / 7.5, Keyboard.EBONY_THICKNESS]}
			/>
		{/each}
	</InstancedMesh>
</T.Group>
