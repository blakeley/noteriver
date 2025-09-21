import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import {
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY,
	AWS_REGION,
	AWS_S3_BUCKET
} from '$env/static/private';

const s3Client = new S3Client({
	region: AWS_REGION || 'us-east-1',
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY
	}
});

export async function uploadMidiToS3(
	fileBuffer: Buffer,
	fileName: string
): Promise<{ s3key: string }> {
	const md5 = createHash('md5').update(fileBuffer).digest('hex');
	const s3key = `midis/${md5}/${fileName}`;

	const command = new PutObjectCommand({
		Bucket: AWS_S3_BUCKET || 'noteriver.com',
		Key: s3key,
		Body: fileBuffer,
		ContentType: 'audio/midi'
	});

	await s3Client.send(command);

	return { s3key };
}

export async function getMidiFromS3(s3key: string): Promise<ArrayBuffer> {
	const command = new GetObjectCommand({
		Bucket: AWS_S3_BUCKET || 'noteriver.com',
		Key: s3key
	});

	const response = await s3Client.send(command);
	const stream = response.Body;

	if (!stream) {
		throw new Error('No body returned from S3');
	}

	const chunks: Uint8Array[] = [];
	// @ts-ignore - Body is a readable stream
	for await (const chunk of stream) {
		chunks.push(chunk);
	}

	const buffer = Buffer.concat(chunks);
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
