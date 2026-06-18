import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';

const itemSchema = z.object({
  text: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function noteBelongsToUser(noteId: string, userId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    'SELECT id FROM notes WHERE id = $1 AND user_id = $2 AND type = $3',
    [noteId, userId, 'checklist']
  );
  return rows.length > 0;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;

  try {
    if (!(await noteBelongsToUser(id, user.userId))) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const items = await query<{
      id: string;
      note_id: string;
      text: string;
      is_completed: boolean;
    }>(
      'SELECT id, note_id, text, is_completed FROM checklist_items WHERE note_id = $1 ORDER BY id',
      [id]
    );
    return NextResponse.json(
      items.map((item) => ({
        id: item.id,
        text: item.text,
        isCompleted: item.is_completed,
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;

  try {
    if (!(await noteBelongsToUser(id, user.userId))) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const result = itemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const [item] = await query<{
      id: string;
      text: string;
      is_completed: boolean;
    }>(
      'INSERT INTO checklist_items (note_id, text) VALUES ($1, $2) RETURNING id, text, is_completed',
      [id, result.data.text]
    );

    await query('UPDATE notes SET updated_at = NOW() WHERE id = $1', [id]);

    return NextResponse.json(
      { id: item.id, text: item.text, isCompleted: item.is_completed },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
