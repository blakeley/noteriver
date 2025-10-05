<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WaterCaustic from './WaterCaustic.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/WaterCaustic',
		component: WaterCaustic,
		tags: ['autodocs'],
		argTypes: {
			color: {
				control: 'color',
			},
		},
	});
</script>

<Story
	name="Default"
	args={{ color: '#005980' }}
	decorators={[
		// @ts-expect-error Bug in Storybook
		() => StorybookCanvas,
	]}
/>
