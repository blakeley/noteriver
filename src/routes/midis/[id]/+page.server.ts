import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMidiById, getMidiList } from '$lib/server/midi';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid MIDI ID');
	}

	const midiData = await getMidiById(id);

	if (!midiData) {
		throw error(404, 'MIDI not found');
	}

	// Get other midis for the sidebar (eventually will be "related" midis)
	const otherMidis = await getMidiList('', 0, 20);

	return {
		midiData,
		otherMidis: otherMidis.midis.filter((m) => m.id !== id) // Exclude current midi
	};
};
