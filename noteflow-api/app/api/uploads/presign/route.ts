import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyFirebaseIdToken } from '@/lib/firebase-admin';
import { buildObjectKey, createPresignedUploadUrl } from '@/lib/s3';

const bodySchema = z.object({
  contentType: z.string().min(1),
  purpose: z.enum(['avatar', 'note-attachment']).default('avatar'),
});

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  const idToken = getBearerToken(request);
  if (!idToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const { contentType, purpose } = parsed.data;
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes' },
        { status: 400 }
      );
    }

    const key = buildObjectKey(decoded.uid, purpose, contentType);
    const urls = await createPresignedUploadUrl(key, contentType);

    return NextResponse.json(urls);
  } catch (error) {
    console.error('Presign error:', error);
    const message =
      error instanceof Error ? error.message : 'Error al generar URL firmada';
    const status = message.includes('configurado') ? 503 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
