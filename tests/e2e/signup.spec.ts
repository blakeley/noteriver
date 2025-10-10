import { test, expect } from '@playwright/test';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as table from '../../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client, { schema: table });

test.describe.configure({ mode: 'serial' });

test.describe('Signup Flow', () => {
	const TEST_EMAIL = 'test@example.com';
	const TEST_USERNAME = 'signuptestuser';
	const TEST_PASSWORD = 'testpass123';

	test.afterEach(async () => {
		// Cleanup test user
		const users = await db.select().from(table.users).where(eq(table.users.email, TEST_EMAIL));
		if (users.length > 0) {
			const userId = users[0].id;
			await db.delete(table.sessions).where(eq(table.sessions.userId, userId));
		}
		await db.delete(table.users).where(eq(table.users.email, TEST_EMAIL));
		await db.delete(table.verificationCodes).where(eq(table.verificationCodes.email, TEST_EMAIL));
	});

	test('should complete full signup flow with email verification', async ({ page }) => {
		// Listen for console messages and errors
		page.on('console', (msg) => console.log('Browser console:', msg.text()));
		page.on('pageerror', (err) => console.log('Browser error:', err));

		await page.goto('/signup');

		// Verify step 1 is showing
		await expect(page.locator('text=Create your account')).toBeVisible();
		await expect(page.locator('input[name="email"]')).toBeVisible();

		// Step 1: Enter email and send verification code
		await page.fill('input[name="email"]', TEST_EMAIL);
		await page.click('button:has-text("Continue")');

		// Verify step 2 is showing
		await expect(page.locator('text=Verify your email')).toBeVisible();
		await expect(page.locator('input[name="code"]')).toBeVisible();

		// Verify code was stored in database
		const codes = await db
			.select()
			.from(table.verificationCodes)
			.where(eq(table.verificationCodes.email, TEST_EMAIL));
		expect(codes.length).toBeGreaterThan(0);
		const verificationCode = codes[0].code;

		// Step 2: Verify code
		await page.waitForSelector('form[action*="verifyCode"]', { state: 'visible' });
		const codeInput = page.locator('input[name="code"]');
		await codeInput.fill(verificationCode);
		await page.click('button:has-text("Verify Code")');

		// Verify step 3 is showing
		await expect(page.locator('text=Choose a username and password')).toBeVisible();
		await expect(page.locator('input[name="username"]')).toBeVisible();
		await expect(page.locator('input[name="password"]')).toBeVisible();
		await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

		// Step 3: Create account with username and password
		await page.fill('input[name="username"]', TEST_USERNAME);
		await page.fill('input[name="password"]', TEST_PASSWORD);
		await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);
		await page.click('button:has-text("Create Account")');

		// Should redirect after signup
		await page.waitForURL((url) => url.pathname !== '/signup');

		// Verify user was created in database
		const users = await db.select().from(table.users).where(eq(table.users.email, TEST_EMAIL));
		expect(users.length).toBe(1);
		expect(users[0].username).toBe(TEST_USERNAME);
		expect(users[0].email).toBe(TEST_EMAIL);

		// Verify verification code was deleted
		const remainingCodes = await db
			.select()
			.from(table.verificationCodes)
			.where(eq(table.verificationCodes.email, TEST_EMAIL));
		expect(remainingCodes.length).toBe(0);

		// User should be logged in
		await expect(page.getByText(TEST_USERNAME)).toBeVisible();
	});
});
