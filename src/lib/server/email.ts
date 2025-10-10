import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

if (!env.RESEND_API_KEY) {
	console.warn('RESEND_API_KEY is not set - email sending will not work');
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendVerificationCode(email: string, code: string) {
	// In test mode, skip actual email sending
	if (env.NODE_ENV === 'test' || email === 'test@example.com') {
		console.log(`[TEST MODE] Would send verification code ${code} to ${email}`);
		return { id: 'mock-email-id' };
	}

	if (!resend) {
		throw new Error('Resend is not configured');
	}

	const { data, error } = await resend.emails.send({
		from: 'NoteRiver <onboarding@resend.dev>', // TODO: Update with your verified domain
		to: [email],
		subject: 'Verify your email address',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
						line-height: 1.6;
						color: #333;
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
					.container {
						background-color: #f9fafb;
						border-radius: 8px;
						padding: 40px;
						text-align: center;
					}
					.code {
						font-size: 32px;
						font-weight: bold;
						letter-spacing: 8px;
						color: #009ee2;
						background-color: #ecf7ff;
						padding: 20px;
						border-radius: 8px;
						margin: 30px 0;
					}
					.footer {
						margin-top: 40px;
						font-size: 14px;
						color: #6b7280;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>Verify your email address</h1>
					<p>Thank you for signing up for NoteRiver! Please use the verification code below to complete your registration:</p>
					<div class="code">${code}</div>
					<p>This code will expire in 10 minutes.</p>
					<div class="footer">
						<p>If you didn't request this code, you can safely ignore this email.</p>
					</div>
				</div>
			</body>
			</html>
		`,
	});

	if (error) {
		throw new Error(`Failed to send email: ${error.message}`);
	}

	return data;
}

export function generateVerificationCode(): string {
	// Generate a random 6-digit code
	return Math.floor(100000 + Math.random() * 900000).toString();
}
