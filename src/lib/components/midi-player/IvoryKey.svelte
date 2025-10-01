<script lang="ts">
	import { Keyboard } from '$lib/midi-player/keyboard';

	let { x, pressed }: { x: number; pressed: number | undefined } = $props();

	const fill = $derived(() => {
		if (pressed !== undefined) {
			return Keyboard.IVORY_KEY_COLORS[pressed % Keyboard.IVORY_KEY_COLORS.length];
		} else {
			return '#FFFCE5';
		}
	});
</script>

<svg {x} y={0} width={Keyboard.IVORY_WIDTH} height={Keyboard.IVORY_HEIGHT}>
	<rect
		x="0.01"
		rx="0.125"
		ry="0.125"
		width=".98"
		y="0.0"
		height={Keyboard.IVORY_HEIGHT}
		fill={fill()}
	/>
</svg>
