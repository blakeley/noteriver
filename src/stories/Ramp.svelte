<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls, Grid } from '@threlte/extras';
	import * as THREE from 'three';
	import fragmentShader from '$lib/shaders/ramp.frag.glsl?raw';
	import vertexShader from '$lib/shaders/basic.vert.glsl?raw';
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 5]}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>
<Grid cellSize={0.5} sectionSize={2} gridSize={[20, 20]} />
<T.Mesh geometry={new THREE.PlaneGeometry(4, 4, 32, 32)}>
	<T.ShaderMaterial {vertexShader} {fragmentShader} />
</T.Mesh>
