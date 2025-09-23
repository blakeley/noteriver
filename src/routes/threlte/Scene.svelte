<script lang="ts">
	import { T, useThrelte } from '@threlte/core';

	// world width across the viewport
	const WORLD_WIDTH = 10;
	const halfW = WORLD_WIDTH / 2;

	// canvas size from threlte (store)
	const { size } = useThrelte();

	// half height of the frustum in world units
	const halfH = $derived(WORLD_WIDTH / (size.current.width / size.current.height) / 2);
</script>

<T.OrthographicCamera
	makeDefault
	position={[0, 0, 10]}
	left={-halfW}
	right={halfW}
	top={halfH}
	bottom={-halfH}
	near={-1000}
	far={1000}
/>

<T.Mesh>
	<T.BoxGeometry args={[10, 10, 10]} />
	<T.MeshStandardMaterial color="blue" />
</T.Mesh>
