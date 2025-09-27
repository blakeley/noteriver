<script lang="ts">
	import { Keyboard } from '$lib/midi-player/keyboard';

	let { x, pressed }: { x: number; pressed: number | undefined } = $props();

	const fill = $derived(() => {
		if (pressed !== undefined) {
			return Keyboard.EBONY_KEY_COLORS[pressed % Keyboard.EBONY_KEY_COLORS.length];
		} else {
			return '#202020';
		}
	});
</script>

<svg
	viewBox="0 0 1 1000"
	preserveAspectRatio="xMinYMin slice"
	{x}
	y={Keyboard.IVORY_HEIGHT - Keyboard.EBONY_HEIGHT}
	width={Keyboard.EBONY_WIDTH}
	height={Keyboard.EBONY_HEIGHT}
>
	<!-- background -->
	<rect x="0" width="1" y=".020" height="5.5625" fill={fill()} />

	<!-- left side -->
	<rect x="-0.0625" width="0.1625" y="0" height="5.5625" fill="url(#gradient-ebony-key-side)" />

	<!-- right side -->
	<rect x="0.9" width="0.1625" y="0" height="5.5625" fill="url(#gradient-ebony-key-side)" />

	<!-- front slope -->
	<path
		d="M 0,0
		   C 0,0.5,    0.1,0.75 0.5,0.75
		   C 0.9,0.75, 1.0,0.5  1,0
		   L 1,0
		   Z"
		fill="url(#gradient-ebony-key-front)"
	/>

	<!-- top -->
	<rect
		x="0.1"
		rx="0.2"
		ry="0.2"
		width="0.8"
		y="0.8"
		height="5"
		fill="url(#gradient-ebony-key-top)"
	/>
</svg>
