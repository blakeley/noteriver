import type { PageServerLoad } from './$types';
import { getMidiList } from '$lib/server/midi';

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('s') || '';
	const initialData = await getMidiList(searchQuery, 0);

	return {
		initialMidis: initialData.midis,
		hasMore: initialData.hasMore,
		searchQuery
	};
};