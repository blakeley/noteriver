import { Google } from 'arctic';
import { env } from '$env/dynamic/private';

if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
	console.warn('Google OAuth is not configured');
}

// For Google OAuth, the redirect URI should match what's configured in Google Cloud Console
// Default to localhost for development
const redirectUri = env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/login/google/callback';

export const google = new Google(
	env.GOOGLE_CLIENT_ID || '',
	env.GOOGLE_CLIENT_SECRET || '',
	redirectUri,
);
