import { test, expect } from '@playwright/test';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as table from '../../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import {
	createOAuthTestUser,
	cleanupOAuthTestUser,
	OAUTH_TEST_USER,
	createOAuthLinkTestUser,
	cleanupOAuthLinkTestUser,
	OAUTH_LINK_TEST_USER,
} from '../helpers/oauth-test-user';

dotenv.config();

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client, { schema: table });

test.describe.configure({ mode: 'serial' });

test.describe('Google OAuth Flow', () => {
	test.describe('New User Signup', () => {
		const NEW_USER_EMAIL = 'new-oauth-user@example.com';
		const NEW_USER_GOOGLE_ID = 'new-google-id-456';
		const NEW_USER_NAME = 'New OAuth User';

		test.afterEach(async () => {
			// Cleanup test user
			const users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, NEW_USER_EMAIL));
			if (users.length > 0) {
				const userId = users[0].id;
				await db.delete(table.sessions).where(eq(table.sessions.userId, userId));
			}
			await db.delete(table.users).where(eq(table.users.email, NEW_USER_EMAIL));
		});

		test('should create new user and login via Google OAuth from signup page', async ({
			page,
			context,
		}) => {
			// Navigate to signup page
			await page.goto('/signup');

			// Verify Google OAuth button is visible
			const googleButton = page.locator('a[href="/login/google"]');
			await expect(googleButton).toBeVisible();

			// Intercept the OAuth flow and redirect to test callback
			await page.route('**/login/google', async (route) => {
				// Redirect to test callback with mock user data
				const testCallbackUrl = `/test/google-oauth-callback?googleId=${NEW_USER_GOOGLE_ID}&email=${NEW_USER_EMAIL}&name=${encodeURIComponent(NEW_USER_NAME)}`;
				await route.fulfill({
					status: 302,
					headers: {
						Location: testCallbackUrl,
					},
				});
			});

			// Click "Sign up with Google"
			await googleButton.click();

			// Should redirect after successful OAuth (app redirects to /midis for logged-in users)
			await page.waitForURL(
				(url) => url.pathname !== '/signup' && url.pathname !== '/test/google-oauth-callback',
			);

			// Verify user was created in database
			const users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, NEW_USER_EMAIL));
			expect(users.length).toBe(1);
			expect(users[0].email).toBe(NEW_USER_EMAIL);
			expect(users[0].googleId).toBe(NEW_USER_GOOGLE_ID);
			expect(users[0].passwordHash).toBeNull(); // OAuth users have no password

			// Verify username was auto-generated (color-animal-number format)
			expect(users[0].username).toBeTruthy();
			expect(users[0].username).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);

			// User should be logged in - check for username in header
			await expect(page.getByText(users[0].username)).toBeVisible();
		});

		test('should create new user via Google OAuth from login page', async ({ page }) => {
			// Navigate to login page
			await page.goto('/login');

			// Verify Google OAuth button is visible
			const googleButton = page.locator('a[href="/login/google"]');
			await expect(googleButton).toBeVisible();

			// Intercept the OAuth flow
			await page.route('**/login/google', async (route) => {
				const testCallbackUrl = `/test/google-oauth-callback?googleId=${NEW_USER_GOOGLE_ID}&email=${NEW_USER_EMAIL}&name=${encodeURIComponent(NEW_USER_NAME)}`;
				await route.fulfill({
					status: 302,
					headers: {
						Location: testCallbackUrl,
					},
				});
			});

			// Click "Sign in with Google"
			await googleButton.click();

			// Should redirect after successful OAuth
			await page.waitForURL(
				(url) => url.pathname !== '/login' && url.pathname !== '/test/google-oauth-callback',
			);

			// Verify user was created
			const users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, NEW_USER_EMAIL));
			expect(users.length).toBe(1);
			expect(users[0].googleId).toBe(NEW_USER_GOOGLE_ID);

			// User should be logged in
			await expect(page.getByText(users[0].username)).toBeVisible();
		});
	});

	test.describe('Existing Email User - Account Linking', () => {
		test.beforeEach(async () => {
			await createOAuthLinkTestUser();
		});

		test.afterEach(async () => {
			await cleanupOAuthLinkTestUser();
		});

		test('should link Google account to existing email user', async ({ page }) => {
			// Verify user exists without Google ID
			let users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, OAUTH_LINK_TEST_USER.email));
			expect(users.length).toBe(1);
			expect(users[0].googleId).toBeNull();
			const originalPasswordHash = users[0].passwordHash;

			// Navigate to login page
			await page.goto('/login');

			// Intercept OAuth flow with existing user's email
			const linkGoogleId = 'link-google-id-789';
			await page.route('**/login/google', async (route) => {
				const testCallbackUrl = `/test/google-oauth-callback?googleId=${linkGoogleId}&email=${OAUTH_LINK_TEST_USER.email}&name=${encodeURIComponent('OAuth Link Test')}`;
				await route.fulfill({
					status: 302,
					headers: {
						Location: testCallbackUrl,
					},
				});
			});

			// Click "Sign in with Google"
			await page.locator('a[href="/login/google"]').click();

			// Should redirect after successful OAuth
			await page.waitForURL(
				(url) => url.pathname !== '/login' && url.pathname !== '/test/google-oauth-callback',
			);

			// Verify Google ID was added to existing user
			users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, OAUTH_LINK_TEST_USER.email));
			expect(users.length).toBe(1); // Still only one user
			expect(users[0].googleId).toBe(linkGoogleId); // Google ID added
			expect(users[0].username).toBe(OAUTH_LINK_TEST_USER.username); // Username unchanged
			expect(users[0].passwordHash).toBe(originalPasswordHash); // Password hash unchanged

			// User should be logged in
			await expect(page.getByText(OAUTH_LINK_TEST_USER.username)).toBeVisible();
		});
	});

	test.describe('Existing Google User - Login', () => {
		test.beforeEach(async () => {
			await createOAuthTestUser();
		});

		test.afterEach(async () => {
			await cleanupOAuthTestUser();
		});

		test('should login existing Google user without creating duplicate', async ({ page }) => {
			// Verify user exists with Google ID
			let users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, OAUTH_TEST_USER.email));
			expect(users.length).toBe(1);
			const existingUserId = users[0].id;

			// Navigate to login page
			await page.goto('/login');

			// Intercept OAuth flow with existing Google user
			await page.route('**/login/google', async (route) => {
				const testCallbackUrl = `/test/google-oauth-callback?googleId=${OAUTH_TEST_USER.googleId}&email=${OAUTH_TEST_USER.email}&name=${encodeURIComponent(OAUTH_TEST_USER.name)}`;
				await route.fulfill({
					status: 302,
					headers: {
						Location: testCallbackUrl,
					},
				});
			});

			// Click "Sign in with Google"
			await page.locator('a[href="/login/google"]').click();

			// Should redirect after successful OAuth
			await page.waitForURL(
				(url) => url.pathname !== '/login' && url.pathname !== '/test/google-oauth-callback',
			);

			// Verify no duplicate user was created
			users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, OAUTH_TEST_USER.email));
			expect(users.length).toBe(1);
			expect(users[0].id).toBe(existingUserId); // Same user ID

			// User should be logged in
			await expect(page.getByText(OAUTH_TEST_USER.username)).toBeVisible();
		});
	});

	test.describe('Username Generation', () => {
		test.afterEach(async () => {
			// Cleanup all username test users
			// First delete sessions
			const users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, 'username-test@example.com'));
			if (users.length > 0) {
				const userId = users[0].id;
				await db.delete(table.sessions).where(eq(table.sessions.userId, userId));
			}

			await db.delete(table.users).where(eq(table.users.email, 'username-test@example.com'));
			await db.delete(table.users).where(eq(table.users.email, 'username-conflict@example.com'));
			await db.delete(table.users).where(eq(table.users.email, 'existing-user@example.com'));
		});

		test('should generate unique username when conflict exists', async ({ page }) => {
			// Create a user with the username that would be generated
			const existingUserId = crypto.randomUUID();
			await db.insert(table.users).values({
				id: existingUserId,
				username: 'usernametest',
				email: 'existing-user@example.com',
				passwordHash: 'dummy',
			});

			// Now try to create OAuth user with name that would generate same username
			await page.goto('/login');

			await page.route('**/login/google', async (route) => {
				const testCallbackUrl = `/test/google-oauth-callback?googleId=unique-id-123&email=username-test@example.com&name=${encodeURIComponent('Username Test')}`;
				await route.fulfill({
					status: 302,
					headers: {
						Location: testCallbackUrl,
					},
				});
			});

			await page.locator('a[href="/login/google"]').click();
			await page.waitForURL(
				(url) => url.pathname !== '/login' && url.pathname !== '/test/google-oauth-callback',
			);

			// Verify new user has unique random username (color-animal-number format)
			const users = await db
				.select()
				.from(table.users)
				.where(eq(table.users.email, 'username-test@example.com'));
			expect(users.length).toBe(1);
			expect(users[0].username).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
			expect(users[0].username).not.toBe('usernametest'); // Should not be the conflicting username

			// Cleanup the existing user
			await db.delete(table.users).where(eq(table.users.id, existingUserId));
			await db.delete(table.users).where(eq(table.users.email, 'existing-user@example.com'));
		});
	});
});
