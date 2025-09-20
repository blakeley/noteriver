<script lang="ts">
	import MidiList from '$lib/components/MidiList.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>MIDI Library - NoteRiver</title>
</svelte:head>

<MidiList midis={data.initialMidis} />