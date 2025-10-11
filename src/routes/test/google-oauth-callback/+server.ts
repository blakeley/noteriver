import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { uniqueNamesGenerator, colors, animals, NumberDictionary } from 'unique-names-generator';

// This endpoint is ONLY for testing OAuth flows in E2E tests
// It simulates the OAuth callback without requiring actual Google authentication

export async function GET(event: RequestEvent): Promise<Response> {
	// Only allow in development/test environment, not in production
	if (import.meta.env.PROD) {
		return new Response('Not found', { status: 404 });
	}

	// Get test user data from query params
	const googleUserId = event.url.searchParams.get('googleId');
	const email = event.url.searchParams.get('email');
	const name = event.url.searchParams.get('name');

	if (!googleUserId || !email) {
		return new Response('Missing required parameters: googleId and email', { status: 400 });
	}

	// Check if user exists by Google ID
	let existingUser = await db
		.select()
		.from(table.users)
		.where(eq(table.users.googleId, googleUserId))
		.limit(1);

	let userId: string;

	if (existingUser.length > 0) {
		// User exists, log them in
		userId = existingUser[0].id;
	} else {
		// Check if email is already registered
		const emailUser = await db
			.select()
			.from(table.users)
			.where(eq(table.users.email, email))
			.limit(1);

		if (emailUser.length > 0) {
			// Email exists but no Google ID - link the account
			userId = emailUser[0].id;
			await db
				.update(table.users)
				.set({ googleId: googleUserId })
				.where(eq(table.users.id, userId));
		} else {
			// Create new user
			userId = generateId();

			// Generate a unique random username (color-animal-number)
			const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 });
			let username: string;
			let attempts = 0;
			const maxAttempts = 10;

			// Keep generating until we find a unique username
			while (attempts < maxAttempts) {
				username = uniqueNamesGenerator({
					dictionaries: [colors, animals, numberDictionary],
					separator: '-',
					length: 3,
					style: 'lowerCase',
				});

				// Check if username is unique
				const existing = await db
					.select()
					.from(table.users)
					.where(eq(table.users.username, username))
					.limit(1);

				if (existing.length === 0) break;
				attempts++;
			}

			// Fallback if all attempts failed (very unlikely)
			if (attempts === maxAttempts) {
				username = `user-${generateId().slice(0, 8)}`;
			}

			await db.insert(table.users).values({
				id: userId,
				username,
				email,
				googleId: googleUserId,
				passwordHash: null, // No password for OAuth users
			});
		}
	}

	// Create session
	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, userId);
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return redirect(302, '/');
}

function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
