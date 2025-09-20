import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMidiList } from '$lib/server/midi';

export const GET: RequestHandler = async ({ url }) => {
	const searchQuery = url.searchParams.get('s') || '';
	const page = parseInt(url.searchParams.get('page') || '0');

	try {
		const result = await getMidiList(searchQuery, page);
		return json(result);
	} catch (error) {
		console.error('Error in MIDI API:', error);
		return json({ error: 'Failed to fetch MIDI files' }, { status: 500 });
	}
};