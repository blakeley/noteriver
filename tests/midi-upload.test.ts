import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('MIDI Upload Flow', () => {
	const BASE_URL = 'http://localhost:5174';

	// Load test MIDI file
	const testMidiPath = join(__dirname, 'fixtures', 'c.mid');
	const testMidiBuffer = readFileSync(testMidiPath);

	test('should upload a MIDI file successfully', async () => {
		// Create FormData with test file
		const formData = new FormData();
		const blob = new Blob([testMidiBuffer], { type: 'audio/midi' });
		const file = new File([blob], 'test-c-major.mid', { type: 'audio/midi' });

		formData.append('file', file);
		formData.append('title', 'C Major Scale Test');
		formData.append('description', 'A simple C major scale for testing');

		// Send upload request
		const response = await fetch(`${BASE_URL}/api/upload`, {
			method: 'POST',
			body: formData
		});

		// Check response
		expect(response.ok).toBe(true);
		expect(response.status).toBe(200);

		const data = await response.json();

		// Validate response structure
		expect(data).toHaveProperty('success', true);
		expect(data).toHaveProperty('midi');
		expect(data.midi).toHaveProperty('id');
		expect(data.midi).toHaveProperty('s3key');
		expect(data.midi).toHaveProperty('title', 'C Major Scale Test');
		expect(data.midi).toHaveProperty('description', 'A simple C major scale for testing');

		// Check S3 key format (should be midis/{md5}/{filename})
		expect(data.midi.s3key).toMatch(/^midis\/[a-f0-9]{32}\/test-c-major\.mid$/);

		console.log('✓ Upload successful:', {
			id: data.midi.id,
			s3key: data.midi.s3key,
			title: data.midi.title
		});
	});

	test('should reject non-MIDI files', async () => {
		const formData = new FormData();
		const blob = new Blob(['not a midi file'], { type: 'text/plain' });
		const file = new File([blob], 'test.txt', { type: 'text/plain' });

		formData.append('file', file);
		formData.append('title', 'Invalid File');
		formData.append('description', '');

		const response = await fetch(`${BASE_URL}/api/upload`, {
			method: 'POST',
			body: formData
		});

		expect(response.ok).toBe(false);
		expect(response.status).toBe(400);

		const data = await response.json();
		expect(data).toHaveProperty('error');
		expect(data.error).toContain('Only MIDI files are allowed');
	});

	test('should require title field', async () => {
		const formData = new FormData();
		const blob = new Blob([testMidiBuffer], { type: 'audio/midi' });
		const file = new File([blob], 'test.mid', { type: 'audio/midi' });

		formData.append('file', file);
		formData.append('title', ''); // Empty title
		formData.append('description', 'Description without title');

		const response = await fetch(`${BASE_URL}/api/upload`, {
			method: 'POST',
			body: formData
		});

		expect(response.ok).toBe(false);
		expect(response.status).toBe(400);

		const data = await response.json();
		expect(data).toHaveProperty('error');
		expect(data.error).toContain('File and title are required');
	});

	test('should handle optional description', async () => {
		const formData = new FormData();
		const blob = new Blob([testMidiBuffer], { type: 'audio/midi' });
		const file = new File([blob], 'no-description.mid', { type: 'audio/midi' });

		formData.append('file', file);
		formData.append('title', 'MIDI Without Description');
		// No description field

		const response = await fetch(`${BASE_URL}/api/upload`, {
			method: 'POST',
			body: formData
		});

		expect(response.ok).toBe(true);

		const data = await response.json();
		expect(data.midi.description).toBeNull();
	});

	test('should create unique S3 keys for same filename', async () => {
		// Upload same file twice with different content should create different S3 keys
		const uploads = [];

		for (let i = 0; i < 2; i++) {
			const formData = new FormData();
			// Modify content slightly to get different MD5
			const modifiedBuffer = Buffer.concat([testMidiBuffer, Buffer.from([i])]);
			const blob = new Blob([modifiedBuffer], { type: 'audio/midi' });
			const file = new File([blob], 'duplicate.mid', { type: 'audio/midi' });

			formData.append('file', file);
			formData.append('title', `Duplicate Test ${i + 1}`);
			formData.append('description', '');

			const response = await fetch(`${BASE_URL}/api/upload`, {
				method: 'POST',
				body: formData
			});

			const data = await response.json();
			uploads.push(data.midi.s3key);
		}

		// S3 keys should be different due to different MD5 hashes
		expect(uploads[0]).not.toBe(uploads[1]);

		// But filenames should be the same
		expect(uploads[0].endsWith('/duplicate.mid')).toBe(true);
		expect(uploads[1].endsWith('/duplicate.mid')).toBe(true);
	});
});
