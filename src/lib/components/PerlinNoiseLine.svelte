<script lang="ts">
	import { T, useTask, extend } from '@threlte/core';
	import * as THREE from 'three';

	// Create a custom line material with emissive properties for bloom
	class LineStandardMaterial extends THREE.LineBasicMaterial {
		constructor(parameters?: THREE.LineBasicMaterialParameters) {
			super(parameters);
		}
	}

	// Extend the Threlte catalogue to include our custom material
	extend({ LineStandardMaterial });

	interface Props {
		points?: number;
		length?: number;
		color?: string | THREE.ColorRepresentation;
		position?: [number, number, number];
		opacity?: number;
		linewidth?: number;
		spatialFrequency?: number;
		temporalFrequency?: number;
		amplitude?: number;
		octaves?: number;
	}

	let {
		points = 500,
		length = 30,
		color = '#ff00ff',
		position = [0, 0, 0],
		opacity = 0.25,
		linewidth = 2,
		spatialFrequency = 1.0,
		temporalFrequency = 1.0,
		amplitude = 0.2,
		octaves = 2,
	}: Props = $props();

	// Line reference for external bloom control
	let line = $state<THREE.Line>();

	// Calculate x range based on length
	const xMin = -length / 2;
	const xMax = length / 2;

	// Position array for line points
	let noiseY = $state<number[]>(new Array(points).fill(0));

	// 2D Perlin noise implementation
	function fade(t: number): number {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(t: number, a: number, b: number): number {
		return a + t * (b - a);
	}

	// 2D gradient function
	function grad2D(hash: number, x: number, y: number): number {
		const h = hash & 3;
		const u = h < 2 ? x : y;
		const v = h < 2 ? y : x;
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}

	// Initialize permutation table
	const permutation = new Array(256);
	const p = new Array(512);

	for (let i = 0; i < 256; i++) {
		permutation[i] = i;
	}
	// Shuffle
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[permutation[i], permutation[j]] = [permutation[j], permutation[i]];
	}
	// Duplicate for wrapping
	for (let i = 0; i < 512; i++) {
		p[i] = permutation[i & 255];
	}

	function noise2D(x: number, y: number): number {
		// Find unit square that contains point
		const X = Math.floor(x) & 255;
		const Y = Math.floor(y) & 255;

		// Find relative x,y of point in square
		x -= Math.floor(x);
		y -= Math.floor(y);

		// Compute fade curves
		const u = fade(x);
		const v = fade(y);

		// Hash coordinates of the 4 square corners
		const A = p[X] + Y;
		const AA = p[A];
		const AB = p[A + 1];
		const B = p[X + 1] + Y;
		const BA = p[B];
		const BB = p[B + 1];

		// Blend the results from the 4 corners
		return lerp(
			v,
			lerp(u, grad2D(p[AA], x, y), grad2D(p[BA], x - 1, y)),
			lerp(u, grad2D(p[AB], x, y - 1), grad2D(p[BB], x - 1, y - 1)),
		);
	}

	// Multi-octave 2D noise for more organic look
	function octaveNoise2D(x: number, y: number, octaves: number): number {
		let value = 0;
		let amplitude = 1;
		let frequency = 1;
		let maxValue = 0;

		for (let i = 0; i < octaves; i++) {
			value += noise2D(x * frequency, y * frequency) * amplitude;
			maxValue += amplitude;
			amplitude *= 0.5;
			frequency *= 2;
		}

		return value / maxValue;
	}

	// Create line geometry
	const geometry = new THREE.BufferGeometry();

	function updateGeometry() {
		const linePoints = noiseY.map((y: number, i: number) => {
			const x = xMin + ((xMax - xMin) / (points - 1)) * i;
			return new THREE.Vector3(x, y, 0);
		});
		geometry.setFromPoints(linePoints);
	}

	// Initial geometry setup
	updateGeometry();

	// Animation loop
	useTask(() => {
		// Use time as a separate dimension for 2D noise
		const time = performance.now() / 1000; // Convert to seconds

		const newNoiseY = [...noiseY];

		for (let i = 0; i < points; i++) {
			// Get x position for this point
			const x = xMin + ((xMax - xMin) / (points - 1)) * i;

			// Calculate 2D noise with position and time as independent dimensions
			const noiseValue = octaveNoise2D(
				x * spatialFrequency, // Spatial coordinate
				time * temporalFrequency, // Temporal coordinate
				octaves,
			);

			// Apply amplitude
			newNoiseY[i] = noiseValue * amplitude;
		}

		noiseY = newNoiseY;
		updateGeometry();
	});

	// Export line reference for bloom control
	export { line };
</script>

<T.Group {position}>
	<T.Line bind:ref={line} {geometry}>
		<T.MeshStandardMaterial
			{color}
			{linewidth}
			transparent={true}
			{opacity}
			toneMapped={false}
			emissive={color}
			emissiveIntensity={15}
		/>
	</T.Line>
</T.Group>
