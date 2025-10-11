import { redirect } from '@sveltejs/kit';
import { decodeIdToken, OAuth2RequestError } from 'arctic';
import { google } from '$lib/server/oauth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { uniqueNamesGenerator, colors, animals, NumberDictionary } from 'unique-names-generator';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state');
	const codeVerifier = event.cookies.get('google_code_verifier');

	// Validate state and code
	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response('Invalid OAuth callback', { status: 400 });
	}

	try {
		// Exchange authorization code for tokens
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const claims = decodeIdToken(tokens.idToken());

		const googleUserId = claims.sub;
		const email = claims.email;
		const name = claims.name;

		if (!googleUserId || !email) {
			return new Response('Missing required user information', { status: 400 });
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

		// Clear OAuth cookies
		event.cookies.delete('google_oauth_state', { path: '/' });
		event.cookies.delete('google_code_verifier', { path: '/' });
	} catch (e) {
		console.error('OAuth callback error:', e);
		if (e instanceof OAuth2RequestError) {
			return new Response('OAuth request failed', { status: 400 });
		}
		return new Response('Internal server error', { status: 500 });
	}

	// Redirect after successful authentication (outside try-catch)
	return redirect(302, '/');
}

function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
