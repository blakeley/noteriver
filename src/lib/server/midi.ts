import { db } from './db';
import { midis, users, comments, favorites } from './db/schema';
import { desc, ilike, eq, sql } from 'drizzle-orm';

export interface MidiWithRelations {
	id: number;
	createdAt: Date;
	updatedAt: Date;
	createdById: string | null;
	s3key: string;
	title: string;
	description: string | null;
	duration: number;
	instruments: number[] | null;
	createdBy?: {
		id: string;
		username: string;
		age?: number | null;
	} | null;
	commentsCount: number;
	favoritesCount: number;
}

export interface MidiListResult {
	midis: MidiWithRelations[];
	page: number;
	hasMore: boolean;
}

export async function getMidiList(
	searchQuery: string = '',
	page: number = 0,
	limit: number = 20
): Promise<MidiListResult> {
	const offset = page * limit;

	try {
		// Build the base query with aggregated counts
		const baseQuery = db
			.select({
				midi: midis,
				createdBy: users,
				commentsCount: sql<number>`(
					SELECT COUNT(*)::int FROM ${comments}
					WHERE ${comments.midiId} = ${midis.id}
				)`,
				favoritesCount: sql<number>`(
					SELECT COUNT(*)::int FROM ${favorites}
					WHERE ${favorites.midiId} = ${midis.id}
				)`
			})
			.from(midis)
			.leftJoin(users, eq(midis.createdById, users.id));

		// Apply search filter if provided
		const query = searchQuery
			? baseQuery.where(ilike(midis.title, `%${searchQuery}%`))
			: baseQuery;

		// Execute query with ordering and pagination
		const results = await query
			.orderBy(desc(midis.createdAt))
			.limit(limit)
			.offset(offset);

		// Transform the results
		const midiList: MidiWithRelations[] = results.map(row => ({
			...row.midi,
			createdBy: row.createdBy || undefined,
			commentsCount: row.commentsCount || 0,
			favoritesCount: row.favoritesCount || 0
		}));

		return {
			midis: midiList,
			page,
			hasMore: midiList.length === limit
		};
	} catch (error) {
		console.error('Error fetching MIDI files:', error);
		throw new Error('Failed to fetch MIDI files');
	}
}