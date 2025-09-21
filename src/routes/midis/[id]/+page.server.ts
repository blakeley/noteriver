import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMidiById } from '$lib/server/midi';
import { getMidiFromS3 } from '$lib/server/s3';
import * as jadin from 'jadin';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid MIDI ID');
	}

	const midiData = await getMidiById(id);

	if (!midiData) {
		throw error(404, 'MIDI not found');
	}

	try {
		// Fetch the MIDI file from S3
		const midiBuffer = await getMidiFromS3(midiData.s3key);

		// Convert ArrayBuffer to base64 for client-side transfer
		const base64 = Buffer.from(midiBuffer).toString('base64');

		return {
			midiData,
			midiBase64: base64
		};
	} catch (err) {
		console.error('Error loading MIDI file from S3:', err);
		throw error(500, 'Failed to load MIDI file');
	}
};
