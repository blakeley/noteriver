<script lang="ts">
	import { onMount } from 'svelte';

	let {
		height,
		scrollRatio,
		onScroll
	}: {
		height: number;
		scrollRatio: number;
		onScroll: (position: number) => void;
	} = $props();

	let scrollDiv: HTMLDivElement;

	function handleScroll() {
		if (!scrollDiv) return;
		const scrollTop = scrollDiv.scrollTop;
		const elementHeight = scrollDiv.clientHeight;
		const ratio = scrollTop / (height - elementHeight);
		onScroll(ratio);
	}

	$effect(() => {
		if (scrollDiv) {
			scrollDiv.scrollTop = scrollRatio * (height - scrollDiv.clientHeight);
		}
	});
</script>

<div
	bind:this={scrollDiv}
	onscroll={handleScroll}
	class="absolute top-0 right-0 bottom-0 left-0 z-[1] overflow-scroll"
>
	<div style="height: {height}px"></div>
</div>
