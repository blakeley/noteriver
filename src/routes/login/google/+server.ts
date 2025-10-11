import { redirect } from '@sveltejs/kit';
import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/oauth';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const scopes = ['openid', 'profile', 'email'];
	const url = google.createAuthorizationURL(state, codeVerifier, scopes);

	// Store state and code verifier in httpOnly cookies
	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: import.meta.env.PROD,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});

	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		secure: import.meta.env.PROD,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});

	return redirect(302, url.toString());
}
