import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestUser, TEST_USER } from '../helpers/test-user';

test.describe.configure({ mode: 'serial' });

test.describe('Login Flow', () => {
	test.beforeEach(async () => {
		await createTestUser();
	});

	test.afterEach(async () => {
		await cleanupTestUser();
	});

	test('should successfully login with valid credentials', async ({ page }) => {
		await page.goto('/login');

		// Fill in login form
		await page.fill('input[name="email"]', TEST_USER.email);
		await page.fill('input[name="password"]', TEST_USER.password);

		// Submit form
		await page.click('button[type="submit"]');

		// Should redirect after login (currently redirects to /midis based on app logic)
		await page.waitForURL((url) => url.pathname !== '/login');

		// Should show user is logged in (username in header)
		await expect(page.getByText(TEST_USER.username)).toBeVisible();
	});

	test('should show error with invalid password', async ({ page }) => {
		await page.goto('/login');

		await page.fill('input[name="email"]', TEST_USER.email);
		await page.fill('input[name="password"]', 'wrongpassword');

		await page.click('button[type="submit"]');

		// Should stay on login page
		await expect(page).toHaveURL('/login');

		// Should show error message
		await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
	});

	test('should show error with invalid email', async ({ page }) => {
		await page.goto('/login');

		await page.fill('input[name="email"]', 'nonexistent@example.com');
		await page.fill('input[name="password"]', TEST_USER.password);

		await page.click('button[type="submit"]');

		// Should stay on login page
		await expect(page).toHaveURL('/login');

		// Should show error message
		await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
	});

	test('should show validation error with malformed email', async ({ page }) => {
		await page.goto('/login');

		// Use evaluate to bypass HTML5 validation and test server-side validation
		await page.evaluate(() => {
			const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
			if (emailInput) emailInput.setAttribute('type', 'text');
		});

		await page.fill('input[name="email"]', 'notanemail');
		await page.fill('input[name="password"]', TEST_USER.password);

		await page.click('button[type="submit"]');

		// Should stay on login page
		await expect(page).toHaveURL('/login');

		// Should show validation error
		await expect(page.getByText(/invalid email/i)).toBeVisible();
	});

	test('should successfully logout', async ({ page }) => {
		// Login first
		await page.goto('/login');
		await page.fill('input[name="email"]', TEST_USER.email);
		await page.fill('input[name="password"]', TEST_USER.password);
		await page.click('button[type="submit"]');

		// Wait for redirect after login
		await page.waitForURL((url) => url.pathname !== '/login');

		// Click logout button
		await page.click('button:has-text("Logout")');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');

		// Navigate to home and verify user is not logged in
		await page.goto('/midis');

		// User menu should not be visible (user is logged out)
		const userMenu = page.getByText(TEST_USER.username);
		await expect(userMenu).not.toBeVisible();
	});
});
