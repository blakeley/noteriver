<script lang="ts">
	import { keyboard } from '$lib/midi-player/keyboard';

	let { x, pressed }: { x: number; pressed: number | undefined } = $props();

	const fill = $derived(() => {
		if (pressed !== undefined) {
			return keyboard.IVORY_KEY_COLORS[pressed % keyboard.IVORY_KEY_COLORS.length];
		} else {
			return '#FFFCE5';
		}
	});
</script>

<svg {x} y={0} width={keyboard.IVORY_WIDTH} height={keyboard.IVORY_HEIGHT}>
	<rect x="0.01" rx="0.125" ry="0.125" width=".98" y="0.0" height="5.6125" fill={fill()} />
</svg>
