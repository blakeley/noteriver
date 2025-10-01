import { db } from './db';
import { midis, users, comments, favorites } from './db/schema';
import { desc, ilike, eq, count } from 'drizzle-orm';

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
	limit: number = 20,
): Promise<MidiListResult> {
	const offset = page * limit;

	try {
		// Build the base query
		const baseQuery = db
			.select({
				midi: midis,
				createdBy: users,
			})
			.from(midis)
			.leftJoin(users, eq(midis.createdById, users.id));

		// Apply search filter if provided
		const query = searchQuery ? baseQuery.where(ilike(midis.title, `%${searchQuery}%`)) : baseQuery;

		// Execute query with ordering and pagination
		const results = await query.orderBy(desc(midis.createdAt)).limit(limit).offset(offset);

		// Fetch counts separately for each midi
		const midiList: MidiWithRelations[] = await Promise.all(
			results.map(async (row) => {
				// Get comments count
				const [commentsResult] = await db
					.select({ count: count() })
					.from(comments)
					.where(eq(comments.midiId, row.midi.id));

				// Get favorites count
				const [favoritesResult] = await db
					.select({ count: count() })
					.from(favorites)
					.where(eq(favorites.midiId, row.midi.id));

				return {
					...row.midi,
					createdBy: row.createdBy || undefined,
					commentsCount: commentsResult?.count || 0,
					favoritesCount: favoritesResult?.count || 0,
				};
			}),
		);

		return {
			midis: midiList,
			page,
			hasMore: midiList.length === limit,
		};
	} catch (error) {
		console.error('Error fetching MIDI files:', error);
		throw new Error('Failed to fetch MIDI files');
	}
}

export async function getMidiById(id: number): Promise<MidiWithRelations | null> {
	try {
		const result = await db
			.select({
				midi: midis,
				createdBy: users,
			})
			.from(midis)
			.leftJoin(users, eq(midis.createdById, users.id))
			.where(eq(midis.id, id))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		const row = result[0]!;

		// Get comments count
		const [commentsResult] = await db
			.select({ count: count() })
			.from(comments)
			.where(eq(comments.midiId, row.midi.id));

		// Get favorites count
		const [favoritesResult] = await db
			.select({ count: count() })
			.from(favorites)
			.where(eq(favorites.midiId, row.midi.id));

		return {
			...row.midi,
			createdBy: row.createdBy || undefined,
			commentsCount: commentsResult?.count || 0,
			favoritesCount: favoritesResult?.count || 0,
		};
	} catch (error) {
		console.error('Error fetching MIDI by ID:', error);
		throw new Error('Failed to fetch MIDI file');
	}
}
