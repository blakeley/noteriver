<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BasicShader from './BasicShader.svelte';

	const { Story } = defineMeta({
		title: 'Shaders/Basic',
		component: BasicShader,
		tags: ['autodocs'],
		argTypes: {
			color: { control: 'color' },
			geometry: {
				control: { type: 'select' },
				options: ['plane', 'circle'],
			},
		},
	});
</script>

<Story name="Default" args={{ color: '#ff6b6b' }} />
