<script lang="ts">
	import { Canvas } from '@threlte/core';

	let { children } = $props();
</script>

<Canvas>
	{@render children()}
</Canvas>
