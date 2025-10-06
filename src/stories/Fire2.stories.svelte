<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Fire2 from './Fire2.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/Fire2',
		component: Fire2,
		tags: ['autodocs'],
		argTypes: {
			heightPoint: {
				control: { type: 'range', min: 0, max: 1, step: 0.01 },
			},
			width: {
				control: { type: 'range', min: 1, max: 10, step: 0.1 },
			},
			height: {
				control: { type: 'range', min: 1, max: 10, step: 0.1 },
			},
		},
	});
</script>

<Story
	name="Default"
	args={{ heightPoint: 0.3, width: 4, height: 4 }}
	decorators={[
		// @ts-expect-error Bug in Storybook
		() => StorybookCanvas,
	]}
/>
