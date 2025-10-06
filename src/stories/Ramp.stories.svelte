<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Ramp from './Ramp.svelte';
	import StorybookCanvas from './StorybookCanvas.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/Ramp',
		component: Ramp,
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
