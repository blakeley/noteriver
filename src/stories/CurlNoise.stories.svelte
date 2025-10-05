<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CurlNoise from './CurlNoise.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/CurlNoise',
		component: CurlNoise,
		tags: ['autodocs'],
		argTypes: {
			color: { control: 'color' },
			geometry: {
				control: { type: 'select' },
				options: ['plane', 'circle'],
			},
			scale: {
				control: { type: 'range', min: 0.5, max: 10, step: 0.5 },
			},
		},
	});
</script>

<Story
	name="Default"
	args={{ color: '#4a90e2', scale: 3 }}
	decorators={[
		// @ts-expect-error Bug in Storybook
		() => StorybookCanvas,
	]}
/>
