import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadMidiToS3 } from '$lib/server/s3';
import { db } from '$lib/server/db';
import { midis } from '$lib/server/db/schema';
import { validateSessionToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const sessionToken = cookies.get('session');
	const { user } = await validateSessionToken(sessionToken || '');

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;

		if (!file || !title) {
			return json({ error: 'File and title are required' }, { status: 400 });
		}

		if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
			return json({ error: 'Only MIDI files are allowed' }, { status: 400 });
		}

		const fileBuffer = Buffer.from(await file.arrayBuffer());

		// Upload to S3 first
		const { s3key } = await uploadMidiToS3(fileBuffer, file.name);

		// After successful upload, save to database
		const [newMidi] = await db
			.insert(midis)
			.values({
				s3key,
				title: title.trim(),
				description: description?.trim() || null,
				duration: 0, // TODO: Parse MIDI to get actual duration
				instruments: [], // TODO: Parse MIDI to get instruments
				createdById: user?.id || null,
			})
			.returning();

		return json({
			success: true,
			midi: newMidi,
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
};
