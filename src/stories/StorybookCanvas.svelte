<script lang="ts">
	import { Canvas } from '@threlte/core';

	let { children } = $props();
</script>

<div
	class="h-full w-full"
	style:background="repeating-conic-gradient(#000 0% 25%, #111 0% 50%) 50% / 20px 20px"
>
	<Canvas>
		{@render children()}
	</Canvas>
</div>
