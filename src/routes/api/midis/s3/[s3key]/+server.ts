import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMidiFromS3 } from '$lib/server/s3';

export const GET: RequestHandler = async ({ params }) => {
	const { s3key } = params;

	if (!s3key) {
		return json({ error: 'S3 key is required' }, { status: 400 });
	}

	try {
		// Fetch the MIDI file from S3
		const midiBuffer = await getMidiFromS3(decodeURIComponent(s3key));

		// Convert ArrayBuffer to base64 for client-side transfer
		const base64 = Buffer.from(midiBuffer).toString('base64');

		return json(
			{ midiBase64: base64 },
			{
				headers: {
					'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
				},
			},
		);
	} catch (error) {
		console.error('Error fetching MIDI from S3:', error);
		return json({ error: 'Failed to fetch MIDI file' }, { status: 500 });
	}
};
