<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NoteShader from './NoteShader.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/Note',
		component: NoteShader,
		tags: ['autodocs'],
		argTypes: {
			width: {
				control: { type: 'range', min: 20, max: 200, step: 1 },
			},
			height: {
				control: { type: 'range', min: 20, max: 500, step: 1 },
			},
			bottomColor: {
				control: 'color',
			},
			topColor: {
				control: 'color',
			},
			borderBlend: {
				control: { type: 'range', min: 0, max: 1, step: 0.01 },
			},
			borderRadius: {
				control: { type: 'range', min: 0, max: 16, step: 1 },
			},
			borderWidth: {
				control: { type: 'range', min: 0, max: 16, step: 1 },
			},
			offsetU: {
				control: { type: 'range', min: -2, max: 2, step: 0.01 },
			},
			offsetV: {
				control: { type: 'range', min: -2, max: 2, step: 0.01 },
			},
		},
	});
</script>

<Story
	name="Default"
	args={{
		width: 24,
		height: 300,
		bottomColor: '#deb4e2',
		topColor: '#8fc0fb',
		borderBlend: 0.75,
		borderRadius: 4,
		borderWidth: 2,
		offsetU: 0,
		offsetV: 0,
	}}
	decorators={[
		// @ts-expect-error Bug in Storybook
		() => StorybookCanvas,
	]}
/>
