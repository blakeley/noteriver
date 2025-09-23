<script lang="ts">
	interface Props {
		left: number;
		right: number;
		top: number;
		bottom: number;
		near: number;
		far: number;
	}

	let {
		left = $bindable(),
		right = $bindable(),
		top = $bindable(),
		bottom = $bindable(),
		near = $bindable(),
		far = $bindable()
	}: Props = $props();
</script>

<div class="absolute top-4 right-4 z-10 rounded-lg bg-gray-800/90 p-4 text-sm text-gray-100">
	<div class="space-y-2">
		<div class="flex items-center justify-between gap-4">
			<span class="text-gray-400">left</span>
			<input
				type="number"
				bind:value={left}
				step="any"
				class="w-20 rounded bg-gray-700 px-2 py-1 text-right font-mono text-xs outline-none focus:bg-gray-600"
			/>
		</div>
		<div class="flex items-center justify-between gap-4">
			<span class="text-gray-400">right</span>
			<input
				type="number"
				bind:value={right}
				step="any"
				class="w-20 rounded bg-gray-700 px-2 py-1 text-right font-mono text-xs outline-none focus:bg-gray-600"
			/>
		</div>
		<div class="flex items-center justify-between gap-4">
			<span class="text-gray-400">top</span>
			<input
				type="number"
				bind:value={top}
				step="any"
				class="w-20 rounded bg-gray-700 px-2 py-1 text-right font-mono text-xs outline-none focus:bg-gray-600"
			/>
		</div>
		<div class="flex items-center justify-between gap-4">
			<span class="text-gray-400">bottom</span>
			<input
				type="number"
				bind:value={bottom}
				step="any"
				class="w-20 rounded bg-gray-700 px-2 py-1 text-right font-mono text-xs outline-none focus:bg-gray-600"
			/>
		</div>
		<div class="flex items-center justify-between gap-4">
			<span class="text-gray-400">near</span>
			<input
				type="number"
				bind:value={near}
				step="any"
				class="w-20 rounded bg-gray-700 px-2 py-1 text-right font-mono text-xs outline-none focus:bg-gray-600"
			/>
		</div>
		<div class="flex items-center justify-between gap-4">
			<span class="text-gray-400">far</span>
			<input
				type="number"
				bind:value={far}
				step="any"
				class="w-20 rounded bg-gray-700 px-2 py-1 text-right font-mono text-xs outline-none focus:bg-gray-600"
			/>
		</div>
	</div>
</div>

<style>
	/* Hide spinner arrows for number inputs */
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
