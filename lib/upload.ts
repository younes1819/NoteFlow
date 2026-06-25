import { getIdToken } from '@/lib/firebase/auth';
import { updateUserAvatar } from '@/lib/firebase/profile';
import { isFirebaseNative } from '@/lib/firebase/platform';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

interface PresignResponse {
  signedUrl: string;
  publicUrl: string;
}

async function getPresignedUrl(
  contentType: string,
  purpose: 'avatar' | 'note-attachment' = 'avatar'
): Promise<PresignResponse> {
  const idToken = await getIdToken();
  if (!idToken) {
    throw new Error('Debes iniciar sesión para subir archivos');
  }

  const res = await fetch(`${BASE_URL}/uploads/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ contentType, purpose }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error HTTP ${res.status}`);
  }

  return res.json() as Promise<PresignResponse>;
}

export async function uploadImageToS3(
  localUri: string,
  contentType = 'image/jpeg'
): Promise<string> {
  if (!isFirebaseNative) {
    throw new Error('La subida de imágenes solo está disponible en iOS y Android');
  }

  const { signedUrl, publicUrl } = await getPresignedUrl(contentType, 'avatar');

  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });

  if (!uploadResponse.ok) {
    throw new Error('No se pudo subir la imagen a S3');
  }

  return publicUrl;
}

export async function uploadAvatar(
  localUri: string,
  contentType = 'image/jpeg'
): Promise<string> {
  const publicUrl = await uploadImageToS3(localUri, contentType);
  const { getCurrentUser } = await import('@/lib/firebase/auth');
  const userId = getCurrentUser()?.uid;
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }
  await updateUserAvatar(userId, publicUrl);
  return publicUrl;
}
