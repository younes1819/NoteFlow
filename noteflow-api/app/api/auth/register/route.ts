import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { signToken } from '@/lib/auth';
import { query } from '@/lib/db';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { email, password } = result.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await query<{ id: string; email: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    if (!user) {
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json(
      { token, user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError.code === '23505') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
