<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Fire from './Fire.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/Fire',
		component: Fire,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Default"
	decorators={[
		// @ts-expect-error Bug in Storybook
		() => StorybookCanvas,
	]}
/>
