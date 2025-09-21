<script lang="ts">
	let {
		style = '',
		class: className = ''
	}: {
		style?: string;
		class?: string;
	} = $props();
</script>

<span class="shimmer {className}" {style}>&nbsp;</span>

<style>
	.shimmer {
		display: inline-block;
		width: 100%;
		border-radius: 4px;
		background: rgba(0, 1, 2, 0.05);
		background-image: linear-gradient(
			to right,
			rgba(0, 1, 2, 0.05) 0%,
			rgba(0, 1, 2, 0.05) 20%,
			rgba(0, 1, 2, 0.1) 40%,
			rgba(0, 1, 2, 0.05) 60%,
			rgba(0, 1, 2, 0.05) 100%
		);
		background-size: 2000px;
		animation-duration: 1000ms, 0ms;
		animation-fill-mode: forwards;
		animation-iteration-count: infinite, 1;
		animation-name: placeholderShimmer, delayFadeIn;
		animation-timing-function: linear;
		background-attachment: fixed;
	}

	@keyframes delayFadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes placeholderShimmer {
		0% {
			background-position: -1000px 0;
		}
		100% {
			background-position: 1000px 0;
		}
	}
</style>
