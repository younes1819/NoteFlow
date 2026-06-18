import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';

const patchSchema = z.object({
  isCompleted: z.boolean(),
});

interface RouteParams {
  params: Promise<{ itemId: string }>;
}

async function itemBelongsToUser(itemId: string, userId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT ci.id FROM checklist_items ci
     JOIN notes n ON n.id = ci.note_id
     WHERE ci.id = $1 AND n.user_id = $2`,
    [itemId, userId]
  );
  return rows.length > 0;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { itemId } = await params;

  try {
    if (!(await itemBelongsToUser(itemId, user.userId))) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const [item] = await query<{
      id: string;
      text: string;
      is_completed: boolean;
      note_id: string;
    }>(
      `UPDATE checklist_items
       SET is_completed = $1
       WHERE id = $2
       RETURNING id, text, is_completed, note_id`,
      [result.data.isCompleted, itemId]
    );

    await query('UPDATE notes SET updated_at = NOW() WHERE id = $1', [item.note_id]);

    return NextResponse.json({
      id: item.id,
      text: item.text,
      isCompleted: item.is_completed,
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { itemId } = await params;

  try {
    const rows = await query<{ note_id: string }>(
      `DELETE FROM checklist_items ci
       USING notes n
       WHERE ci.id = $1 AND ci.note_id = n.id AND n.user_id = $2
       RETURNING ci.note_id`,
      [itemId, user.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    await query('UPDATE notes SET updated_at = NOW() WHERE id = $1', [
      rows[0].note_id,
    ]);

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
