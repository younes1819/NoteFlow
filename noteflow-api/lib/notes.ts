export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: 'note' | 'checklist' | 'idea';
  color: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  latitude: string | null;
  longitude: string | null;
  location_name: string | null;
}

export interface DbChecklistItem {
  id: string;
  note_id: string;
  text: string;
  is_completed: boolean;
}

export interface DbNoteWithRelations extends DbNote {
  items: DbChecklistItem[] | null;
  tags: string[] | null;
}

export interface ApiNote {
  id: string;
  title: string;
  type: 'note' | 'checklist' | 'idea';
  content?: string;
  color?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  items?: { id: string; text: string; isCompleted: boolean }[];
  tags?: string[];
}

function parseCoordinate(value: string | null): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function mapNoteRow(row: DbNoteWithRelations): ApiNote {
  const base: ApiNote = {
    id: row.id,
    title: row.title,
    type: row.type,
    archived: row.archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    latitude: parseCoordinate(row.latitude),
    longitude: parseCoordinate(row.longitude),
    locationName: row.location_name,
  };

  if (row.content) base.content = row.content;
  if (row.color) base.color = row.color;

  if (row.type === 'checklist' && row.items) {
    base.items = row.items.map((item) => ({
      id: item.id,
      text: item.text,
      isCompleted: item.is_completed,
    }));
  }

  if (row.type === 'idea' && row.tags) {
    base.tags = row.tags;
  }

  return base;
}
