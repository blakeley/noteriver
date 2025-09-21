import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
