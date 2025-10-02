<script lang="ts">
	import FullscreenButton from './FullscreenButton.svelte';
	import PlayPauseButton from './PlayPauseButton.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import TimeDisplay from './TimeDisplay.svelte';
	import VisualModeToggle from './VisualModeToggle.svelte';
</script>

<div
	class="pointer-events-none absolute right-0 bottom-0 left-0 z-30 h-2/5 px-3"
	style="background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADKCAYAAABkOir+AAAAQklEQVR4AexSywoAIAhb9v//XNshKKKbo4MehopsvgLTdmgrzPNAjTx6B3ONADj2/NZwXEEdBD+2E+QJjvCW+69kAAAA//+bCrjQAAAABklEQVQDAP+uAkGIbA5xAAAAAElFTkSuQmCC'); background-repeat: repeat-x; background-position: bottom;"
>
	<div
		class="pointer-events-auto absolute right-0 bottom-0 left-0 flex h-12 items-center gap-2 text-white/95"
	>
		<PlayPauseButton />
		<TimeDisplay />
		<div class="flex-1">
			<ProgressBar />
		</div>
		<VisualModeToggle />
		<FullscreenButton />
	</div>
</div>
