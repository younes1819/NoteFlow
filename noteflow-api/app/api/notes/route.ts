import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';
import { DbNoteWithRelations, mapNoteRow } from '@/lib/notes';

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
  items: z.array(z.object({ text: z.string().min(1) })).optional(),
  tags: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationName: z.string().optional(),
});

const NOTES_WITH_RELATIONS = `
  SELECT
    n.*,
    json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
    json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
  FROM notes n
  LEFT JOIN checklist_items ci ON n.id = ci.note_id
  LEFT JOIN note_tags nt ON n.id = nt.note_id
  WHERE n.user_id = $1
  GROUP BY n.id
  ORDER BY n.created_at DESC
`;

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  try {
    const rows = await query<DbNoteWithRelations>(NOTES_WITH_RELATIONS, [user.userId]);
    return NextResponse.json(rows.map(mapNoteRow));
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { title, type, content, color, items, tags, latitude, longitude, locationName } =
      result.data;

    const [note] = await query<{ id: string }>(
      `INSERT INTO notes (user_id, title, type, content, color, latitude, longitude, location_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        user.userId,
        title,
        type,
        content ?? null,
        color ?? null,
        latitude ?? null,
        longitude ?? null,
        locationName ?? null,
      ]
    );

    if (!note) {
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }

    if (type === 'checklist' && items?.length) {
      for (const item of items) {
        await query(
          'INSERT INTO checklist_items (note_id, text) VALUES ($1, $2)',
          [note.id, item.text]
        );
      }
    }

    if (type === 'idea' && tags?.length) {
      for (const tag of tags) {
        await query('INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)', [
          note.id,
          tag,
        ]);
      }
    }

    const [full] = await query<DbNoteWithRelations>(
      `SELECT
        n.*,
        json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
        json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      WHERE n.id = $1
      GROUP BY n.id`,
      [note.id]
    );

    return NextResponse.json(mapNoteRow(full), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
