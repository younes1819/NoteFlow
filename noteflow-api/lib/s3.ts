import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

function getS3Client(): S3Client {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error('AWS_REGION no está configurado');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });
}

function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET no está configurado');
  }
  return bucket;
}

function getPublicBaseUrl(): string {
  if (process.env.AWS_S3_PUBLIC_URL) {
    return process.env.AWS_S3_PUBLIC_URL.replace(/\/$/, '');
  }
  const bucket = getBucket();
  const region = process.env.AWS_REGION ?? 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export function buildObjectKey(
  userId: string,
  purpose: 'avatar' | 'note-attachment',
  contentType: string
): string {
  const extension = contentType.includes('png') ? 'png' : 'jpg';
  const folder = purpose === 'avatar' ? 'avatars' : 'attachments';
  return `${folder}/${userId}/${randomUUID()}.${extension}`;
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<{ signedUrl: string; publicUrl: string }> {
  const client = getS3Client();
  const bucket = getBucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `${getPublicBaseUrl()}/${key}`;

  return { signedUrl, publicUrl };
}
