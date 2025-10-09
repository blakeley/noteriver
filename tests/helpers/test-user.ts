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

export const TEST_USER = {
	email: 'test@example.com',
	username: 'testuser',
	password: 'testpass123',
};

export async function createTestUser() {
	// Clean up any existing test user first
	await cleanupTestUser();

	const userId = generateUserId();
	const passwordHash = await hash(TEST_USER.password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	await db.insert(table.users).values({
		id: userId,
		username: TEST_USER.username,
		email: TEST_USER.email,
		passwordHash,
	});

	return userId;
}

export async function cleanupTestUser() {
	// First delete any sessions for this user
	const users = await db.select().from(table.users).where(eq(table.users.email, TEST_USER.email));
	if (users.length > 0) {
		const userId = users[0].id;
		await db.delete(table.sessions).where(eq(table.sessions.userId, userId));
	}

	// Then delete the user
	await db.delete(table.users).where(eq(table.users.email, TEST_USER.email));
}

function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
