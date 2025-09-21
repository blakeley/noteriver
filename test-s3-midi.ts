import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as jadin from 'jadin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const S3_KEY = 'midis/3bcb3f6135ddba9db677e5a45e0eac7f/bicycle-ride.mid';

async function testS3MidiDownload() {
	console.log('Testing S3 MIDI download and parsing...');
	console.log('S3 Key:', S3_KEY);
	console.log('Bucket:', process.env.AWS_S3_BUCKET);

	try {
		// Create S3 client
		const s3Client = new S3Client({
			region: process.env.AWS_REGION || 'us-east-1',
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
			}
		});

		console.log('\n1. Downloading from S3...');
		const command = new GetObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET || 'noteriver.com',
			Key: S3_KEY
		});

		const response = await s3Client.send(command);

		if (!response.Body) {
			throw new Error('No body in S3 response');
		}

		// Convert stream to buffer
		const chunks: Uint8Array[] = [];
		// @ts-ignore - Body is a readable stream
		for await (const chunk of response.Body) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);

		console.log(`✓ Downloaded ${buffer.length} bytes`);
		console.log(`✓ Content-Type: ${response.ContentType}`);

		// Convert to ArrayBuffer for jadin
		const arrayBuffer = buffer.buffer.slice(
			buffer.byteOffset,
			buffer.byteOffset + buffer.byteLength
		);

		console.log('\n2. Parsing with jadin...');
		// jadin expects a binary string, not ArrayBuffer
		let binaryString = '';
		const bytes = new Uint8Array(arrayBuffer);
		for (let i = 0; i < bytes.length; i++) {
			binaryString += String.fromCharCode(bytes[i]);
		}

		const midi = new jadin.Midi(binaryString);

		console.log('✓ MIDI parsed successfully!');
		console.log('\nMIDI Info:');
		console.log(`- Duration: ${midi.duration?.toFixed(2)} seconds`);
		console.log(`- Tracks: ${midi.tracks.length}`);
		console.log(`- Events: ${midi.events.length}`);

		// Check for note events
		let noteCount = 0;
		for (const event of midi.events) {
			if (event.raw.type === 'channel' && event.raw.subtype === 'noteOn') {
				noteCount++;
			}
		}
		console.log(`- Note events: ${noteCount}`);

		console.log('\n✅ Test completed successfully!');
	} catch (error) {
		console.error('\n❌ Test failed!');
		console.error('Error:', error);
		if (error instanceof Error) {
			console.error('Message:', error.message);
			console.error('Stack:', error.stack);
		}
		process.exit(1);
	}
}

// Run the test
testS3MidiDownload();
