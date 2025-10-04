<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import VoronoiShader from './VoronoiShader.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/Voronoi',
		component: VoronoiShader,
		tags: ['autodocs'],
		argTypes: {
			color: { control: 'color' },
			geometry: {
				control: { type: 'select' },
				options: ['plane', 'circle'],
			},
			cells: {
				control: { type: 'range', min: 1, max: 20, step: 0.5 },
			},
		},
	});
</script>

<Story
	name="Default"
	args={{ color: '#4a90e2', cells: 5 }}
	decorators={[
		// @ts-expect-error Bug in Storybook
		() => StorybookCanvas,
	]}
/>
