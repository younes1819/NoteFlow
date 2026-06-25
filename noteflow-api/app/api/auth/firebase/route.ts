import { NextResponse } from 'next/server';
import { z } from 'zod';

import { signToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { verifyFirebaseIdToken } from '@/lib/firebase-admin';

const bodySchema = z.object({
  idToken: z.string().min(1),
});

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const decoded = await verifyFirebaseIdToken(parsed.data.idToken);
    const firebaseUid = decoded.uid;
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: 'Token sin email' }, { status: 400 });
    }

    const [existingByUid] = await query<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (existingByUid) {
      const token = signToken({
        userId: existingByUid.id,
        email: existingByUid.email,
      });
      return NextResponse.json({
        token,
        user: { id: existingByUid.id, email: existingByUid.email },
      });
    }

    const [existingByEmail] = await query<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingByEmail) {
      await query('UPDATE users SET firebase_uid = $1 WHERE id = $2', [
        firebaseUid,
        existingByEmail.id,
      ]);
      const token = signToken({
        userId: existingByEmail.id,
        email: existingByEmail.email,
      });
      return NextResponse.json({
        token,
        user: { id: existingByEmail.id, email: existingByEmail.email },
      });
    }

    const [created] = await query<{ id: string; email: string }>(
      `INSERT INTO users (email, firebase_uid)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, firebaseUid]
    );

    if (!created) {
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }

    const token = signToken({ userId: created.id, email: created.email });
    return NextResponse.json(
      { token, user: { id: created.id, email: created.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Firebase auth sync error:', error);
    return NextResponse.json({ error: 'Token de Firebase inválido' }, { status: 401 });
  }
}
