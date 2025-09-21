<script lang="ts">
	import Shimmer from './Shimmer.svelte';

	interface SimpleUser {
		id: string;
		username: string;
		age?: number | null;
	}

	let {
		user,
		size = 36,
		style = '',
		class: className = '',
		displayShimmer = false
	}: {
		user?: SimpleUser | null;
		size?: number | string;
		style?: string;
		class?: string;
		displayShimmer?: boolean;
	} = $props();

	const COLORS = [
		'#fbbc05',
		'#f5a623',
		'#e89e00',
		'#db8e00',
		'#ce7e00',
		'#c16e00',
		'#b45e00',
		'#009ee2',
		'#0081ba',
		'#005c86',
		'#003854',
		'#001b2b'
	];
	const ROUNDING = 0.125;
	const NUMBER_OF_LINES = 6;
	const SPACING = 0.125;
	const VIEW_BOX = `0 0 ${NUMBER_OF_LINES} ${NUMBER_OF_LINES}`;

	function seededRandom(seed: string) {
		let hash = 0;
		for (let i = 0; i < seed.length; i++) {
			const char = seed.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return () => {
			const x = Math.sin(hash++) * 10000;
			return x - Math.floor(x);
		};
	}

	const generateRandomNumber = $derived(seededRandom(user?.username || '43'));
	const fill = $derived(
		user?.username ? COLORS[Math.floor(generateRandomNumber() * COLORS.length)] : '#999999'
	);
	const rotation = $derived(generateRandomNumber() * 360);
</script>

{#if user === null}
	<!-- Nothing -->
{:else if displayShimmer}
	<Shimmer style="background-color: white; height: 100%; width: {size}px; border-radius: 50%;" />
{:else}
	<svg
		class="avatar-fallback {className}"
		viewBox={VIEW_BOX}
		preserveAspectRatio="none"
		style="height: {size}px; min-width: {size}px; border-color: {fill}; {style}"
	>
		<g style="transform: rotate({rotation}deg); transform-origin: center;">
			{#each { length: NUMBER_OF_LINES }, index (index)}
				{@const offset = Math.floor(generateRandomNumber() * NUMBER_OF_LINES * 2) / 2}
				<rect
					x={-offset}
					rx={ROUNDING}
					ry={ROUNDING}
					y={index + SPACING}
					width={NUMBER_OF_LINES}
					height={1 - 2 * SPACING}
					{fill}
				/>
				<rect
					rx={ROUNDING}
					ry={ROUNDING}
					x={1.5 * NUMBER_OF_LINES - offset}
					y={index + SPACING}
					width={NUMBER_OF_LINES}
					height={1 - 2 * SPACING}
					{fill}
				/>
			{/each}
		</g>
	</svg>
{/if}

<style>
	.avatar-fallback {
		border: 2px solid;
		border-radius: 50%;
		background: white;
	}
</style>
