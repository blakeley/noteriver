<script lang="ts">
	import { T, type Props } from '@threlte/core';
	import { Keyboard } from '$lib/midi-player/keyboard';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import * as THREE from 'three';
	import { ebonyKeyGeometry } from '$lib/midi-player/ebonyKeyGeometry';
	import { getPlayerContext } from '$lib/midi-player/context';

	// Props - using T.Group's prop types
	const props: Props<THREE.Group> = $props();

	// Get player state to track active notes
	const playerState = getPlayerContext();

	// Compute currently active notes
	const activeNotes = $derived(() => {
		const active = new Map<number, number>();
		if (playerState.loadedMidi) {
			for (const track of playerState.loadedMidi.tracks) {
				for (const note of track.notes) {
					if (note.number != null && note.onSecond != null) {
						const isActive =
							note.onSecond <= playerState.time && playerState.time < note.onSecond + note.duration;
						if (isActive) {
							active.set(note.number, track.index);
						}
					}
				}
			}
		}
		return active;
	});

	const keyboardWidth = Keyboard.LAST_KEY.x + Keyboard.LAST_KEY.width - Keyboard.FIRST_KEY.x;
	const keyboardCenterX = Keyboard.FIRST_KEY.x + keyboardWidth / 2;
</script>

<T.Group {...props}>
	<T.Mesh
		position={[keyboardCenterX, -Keyboard.IVORY_WIDTH * 0.95 * 0.1, Keyboard.IVORY_THICKNESS / 8]}
	>
		<T.PlaneGeometry args={[keyboardWidth, Keyboard.IVORY_HEIGHT]} />
		<T.MeshBasicMaterial color={0x000000} />
	</T.Mesh>
	<!-- Ivory Keys -->
	{#each Keyboard.IVORY_MIDI_NUMBERS as midiNumber}
		{@const trackIndex = activeNotes().get(midiNumber.number)}
		<T.Mesh position={[midiNumber.x + midiNumber.width / 2, 0, 0]} receiveShadow>
			<RoundedBoxGeometry
				args={[midiNumber.width * 0.95, Keyboard.IVORY_HEIGHT, Keyboard.IVORY_THICKNESS]}
				radius={midiNumber.width * 0.95 * 0.1}
				creaseAngle={100}
			/>
			<T.MeshStandardMaterial
				color={trackIndex !== undefined
					? midiNumber.keyColors[trackIndex % midiNumber.keyColors.length]
					: Keyboard.IVORY_KEY_COLOR}
				roughness={1}
				metalness={0}
			/>
		</T.Mesh>
	{/each}

	<!-- Ebony Keys -->
	{#each Keyboard.EBONY_MIDI_NUMBERS as midiNumber}
		{@const trackIndex = activeNotes().get(midiNumber.number)}
		<T.Mesh
			position={[
				midiNumber.x + midiNumber.width / 2,
				(Keyboard.IVORY_HEIGHT - Keyboard.EBONY_HEIGHT) / 2,
				Keyboard.EBONY_ELEVATION,
			]}
			scale={[midiNumber.width, Keyboard.EBONY_HEIGHT / 7.5, Keyboard.EBONY_THICKNESS]}
			castShadow
		>
			<T.BufferGeometry attach="geometry" {...ebonyKeyGeometry} />
			<T.MeshPhysicalMaterial
				color={trackIndex !== undefined
					? midiNumber.keyColors[trackIndex % midiNumber.keyColors.length]
					: Keyboard.EBONY_KEY_COLOR}
				roughness={0.5}
				metalness={0.5}
				clearcoat={0}
				clearcoatRoughness={0.1}
				side={THREE.DoubleSide}
			/>
		</T.Mesh>
	{/each}
</T.Group>
