import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as table from '$lib/server/db/schema';
import * as dotenv from 'dotenv';

// Load env vars for tests
dotenv.config();

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client, { schema: table });

export const OAUTH_TEST_USER = {
	email: 'oauth-test@example.com',
	username: 'oauthtestuser',
	googleId: 'test-google-id-123',
	name: 'OAuth Test User',
};

export const OAUTH_LINK_TEST_USER = {
	email: 'oauth-link-test@example.com',
	username: 'oauthlinktestuser',
	password: 'testpass123',
};

export async function createOAuthTestUser() {
	// Clean up any existing test user first
	await cleanupOAuthTestUser();

	const userId = generateUserId();

	await db.insert(table.users).values({
		id: userId,
		username: OAUTH_TEST_USER.username,
		email: OAUTH_TEST_USER.email,
		googleId: OAUTH_TEST_USER.googleId,
		passwordHash: null, // OAuth users don't have passwords
	});

	return userId;
}

export async function createOAuthLinkTestUser() {
	// Clean up any existing test user first
	await cleanupOAuthLinkTestUser();

	const userId = generateUserId();
	const passwordHash = await hash(OAUTH_LINK_TEST_USER.password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	await db.insert(table.users).values({
		id: userId,
		username: OAUTH_LINK_TEST_USER.username,
		email: OAUTH_LINK_TEST_USER.email,
		passwordHash,
		googleId: null, // No Google ID yet - will be linked during test
	});

	return userId;
}

export async function cleanupOAuthTestUser() {
	// First delete any sessions for this user
	const users = await db
		.select()
		.from(table.users)
		.where(eq(table.users.email, OAUTH_TEST_USER.email));
	if (users.length > 0) {
		const userId = users[0].id;
		await db.delete(table.sessions).where(eq(table.sessions.userId, userId));
	}

	// Then delete the user
	await db.delete(table.users).where(eq(table.users.email, OAUTH_TEST_USER.email));
}

export async function cleanupOAuthLinkTestUser() {
	// First delete any sessions for this user
	const users = await db
		.select()
		.from(table.users)
		.where(eq(table.users.email, OAUTH_LINK_TEST_USER.email));
	if (users.length > 0) {
		const userId = users[0].id;
		await db.delete(table.sessions).where(eq(table.sessions.userId, userId));
	}

	// Then delete the user
	await db.delete(table.users).where(eq(table.users.email, OAUTH_LINK_TEST_USER.email));
}

function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
