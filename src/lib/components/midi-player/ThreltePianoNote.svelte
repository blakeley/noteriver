<script lang="ts">
	import { T } from '@threlte/core';
	import { MidiNumber } from '$lib/midi-player/keyboard';
	import { createNoteGradientColors } from '$lib/utils/colorGradient';
	import * as THREE from 'three';
	import * as jadin from 'jadin';

	let {
		note,
	}: {
		note: jadin.Note;
	} = $props();

	const midiNumber = new MidiNumber(note.number!);
	const trackIndex = note.track.index;
	const baseColor = midiNumber.noteColors[trackIndex % midiNumber.noteColors.length];

	// Note dimensions and position (using natural units - 1 second = 1 unit height)
	const lineWidth = 0; // midiNumber.width / 16;
	const x = midiNumber.x + midiNumber.width / 2;
	const y = -note.onSecond - note.duration / 2;
	const w = midiNumber.width - lineWidth;
	const h = note.duration;
	const r = midiNumber.width / 4;

	// Create a rounded box geometry
	const geometry = new THREE.BoxGeometry(w, h, midiNumber.width);

	// Create material with gradient simulation using vertex colors
	const material = new THREE.MeshBasicMaterial({
		color: baseColor,
	});
</script>

<!-- Note mesh -->
<T.Mesh position={[x, y, 0]} {geometry} {material}></T.Mesh>
