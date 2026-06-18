import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';
import { DbNoteWithRelations, mapNoteRow } from '@/lib/notes';

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
  archived: z.boolean().optional(),
});

const NOTE_WITH_RELATIONS = `
  SELECT
    n.*,
    json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
    json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
  FROM notes n
  LEFT JOIN checklist_items ci ON n.id = ci.note_id
  LEFT JOIN note_tags nt ON n.id = nt.note_id
  WHERE n.id = $1 AND n.user_id = $2
  GROUP BY n.id
`;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;

  try {
    const [note] = await query<DbNoteWithRelations>(NOTE_WITH_RELATIONS, [
      id,
      user.userId,
    ]);
    if (!note) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json(mapNoteRow(note));
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { title, content, color, archived } = result.data;

    const [updated] = await query<{ id: string }>(
      `UPDATE notes
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           color = COALESCE($3, color),
           archived = COALESCE($4, archived),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id`,
      [title ?? null, content ?? null, color ?? null, archived ?? null, id, user.userId]
    );

    if (!updated) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const [note] = await query<DbNoteWithRelations>(NOTE_WITH_RELATIONS, [
      id,
      user.userId,
    ]);
    return NextResponse.json(mapNoteRow(note));
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;

  try {
    const rows = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user.userId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
