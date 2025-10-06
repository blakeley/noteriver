<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { MidiNumber } from '$lib/midi-player/keyboard';
	import { createNoteGradientColors } from '$lib/utils/colorGradient';
	import { getPlayerContext } from '$lib/midi-player/context';
	import * as THREE from 'three';
	import * as jadin from 'jadin';
	import fragmentShader from '$lib/shaders/note.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';

	let {
		note,
	}: {
		note: jadin.Note;
	} = $props();

	const playerState = getPlayerContext();
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

	// Convert world units to shader "pixel" units
	// Keyboard uses 24 as base scale (IVORY_WIDTH = 24/24 = 1.0 world unit)
	const SHADER_PIXEL_SCALE = 24;

	// Create gradient colors from base color
	const gradientColors = createNoteGradientColors(baseColor);
	const bottomColorObject = new THREE.Color(gradientColors.darker || baseColor);
	const topColorObject = new THREE.Color(gradientColors.lighter || baseColor);

	// Time for animation
	let time = $state(0);

	useTask((delta) => {
		time += delta;
	});
</script>

<!-- Note mesh with shader -->
<T.Mesh position={[x, y, 0]}>
	<T.PlaneGeometry args={[w, h]} />
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		uniforms={{
			uWidth: { value: w * SHADER_PIXEL_SCALE },
			uHeight: { value: h * SHADER_PIXEL_SCALE * playerState.timeScale },
			uBottomColor: { value: bottomColorObject },
			uTopColor: { value: topColorObject },
			uBorderBlend: { value: 0.75 },
			uBorderRadius: { value: r * SHADER_PIXEL_SCALE },
			uBorderWidth: { value: 2 },
			uTime: { value: 0 },
			uOffsetU: { value: x * SHADER_PIXEL_SCALE },
			uOffsetV: { value: y * SHADER_PIXEL_SCALE * playerState.timeScale },
		}}
		uniforms.uTime.value={time}
		transparent={true}
	/>
</T.Mesh>
