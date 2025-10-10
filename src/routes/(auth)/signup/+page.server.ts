import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq, and, gte } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sendVerificationCode, generateVerificationCode } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	sendCode: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email address' });
		}

		// Check if user already exists
		const existingUser = await db.select().from(table.users).where(eq(table.users.email, email));
		if (existingUser.length > 0) {
			return fail(400, { message: 'An account with this email already exists' });
		}

		// Rate limiting: check if too many codes sent recently
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
		const recentCodes = await db
			.select()
			.from(table.verificationCodes)
			.where(
				and(
					eq(table.verificationCodes.email, email),
					gte(table.verificationCodes.createdAt, oneHourAgo),
				),
			);

		if (recentCodes.length >= 5) {
			return fail(429, { message: 'Too many verification codes sent. Please try again later.' });
		}

		// Generate and store verification code
		const code = generateVerificationCode();
		const verificationId = generateId();
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

		await db.insert(table.verificationCodes).values({
			id: verificationId,
			email,
			code,
			expiresAt,
		});

		// Send email
		try {
			await sendVerificationCode(email, code);
		} catch (error) {
			console.error('Failed to send verification email:', error);
			return fail(500, { message: 'Failed to send verification email. Please try again.' });
		}

		return { success: true, step: 2, email };
	},

	verifyCode: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const code = formData.get('code');

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email address' });
		}

		if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
			return fail(400, { message: 'Invalid verification code format' });
		}

		// Find the most recent verification code for this email
		const verificationCodes = await db
			.select()
			.from(table.verificationCodes)
			.where(eq(table.verificationCodes.email, email))
			.orderBy(table.verificationCodes.createdAt);

		const verification = verificationCodes[verificationCodes.length - 1];

		if (!verification) {
			return fail(400, { message: 'No verification code found. Please request a new code.' });
		}

		// Check if code is expired
		if (Date.now() >= verification.expiresAt.getTime()) {
			return fail(400, { message: 'Verification code has expired. Please request a new code.' });
		}

		// Check attempts
		if (verification.attempts >= 5) {
			return fail(400, { message: 'Too many attempts. Please request a new code.' });
		}

		// Increment attempts
		await db
			.update(table.verificationCodes)
			.set({ attempts: verification.attempts + 1 })
			.where(eq(table.verificationCodes.id, verification.id));

		// Check if code matches
		if (verification.code !== code) {
			return fail(400, { message: 'Incorrect verification code' });
		}

		return { success: true, step: 3, email, code };
	},

	createAccount: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const code = formData.get('code');
		const username = formData.get('username');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		// Validate inputs
		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email address' });
		}

		if (!validateUsername(username)) {
			return fail(400, {
				message:
					'Invalid username (3-31 characters, lowercase alphanumeric, underscores, and hyphens only)',
			});
		}

		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (minimum 6 characters)' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		// Verify the code one more time
		const verificationCodes = await db
			.select()
			.from(table.verificationCodes)
			.where(eq(table.verificationCodes.email, email))
			.orderBy(table.verificationCodes.createdAt);

		const verification = verificationCodes[verificationCodes.length - 1];

		if (
			!verification ||
			verification.code !== code ||
			Date.now() >= verification.expiresAt.getTime()
		) {
			return fail(400, { message: 'Invalid or expired verification code' });
		}

		// Check if username is taken
		const existingUsername = await db
			.select()
			.from(table.users)
			.where(eq(table.users.username, username));
		if (existingUsername.length > 0) {
			return fail(400, { message: 'Username is already taken' });
		}

		// Check if email is taken
		const existingEmail = await db.select().from(table.users).where(eq(table.users.email, email));
		if (existingEmail.length > 0) {
			return fail(400, { message: 'Email is already registered' });
		}

		// Hash password
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		});

		// Create user
		const userId = generateId();
		try {
			await db.insert(table.users).values({
				id: userId,
				username,
				email,
				passwordHash,
			});

			// Delete used verification code
			await db
				.delete(table.verificationCodes)
				.where(eq(table.verificationCodes.id, verification.id));

			// Create session
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (error) {
			console.error('Failed to create account:', error);
			return fail(500, { message: 'An error occurred while creating your account' });
		}

		return redirect(302, '/');
	},
};

function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length >= 3 &&
		email.length <= 255 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	);
}

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}

function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
