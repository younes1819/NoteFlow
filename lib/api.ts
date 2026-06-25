import { getAuthHeaders } from '@/lib/authStorage';
import type { AnyNote, ChecklistItem, NoteKind } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface CreateNoteInput {
  title: string;
  type: NoteKind;
  content?: string;
  color?: string;
  items?: { text: string }[];
  tags?: string[];
}

interface ApiNoteResponse {
  id: string;
  title: string;
  type: NoteKind;
  content?: string;
  color?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  items?: { id: string; text: string; isCompleted: boolean }[];
  tags?: string[];
}

function toDate(iso: string): Date {
  return new Date(iso);
}

function mapApiNote(raw: ApiNoteResponse): AnyNote {
  const base = {
    id: raw.id,
    title: raw.title,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
    archived: raw.archived,
  };

  if (raw.type === 'note') {
    return { ...base, content: raw.content ?? '' };
  }
  if (raw.type === 'checklist') {
    return {
      ...base,
      items: (raw.items ?? []).map(
        (item): ChecklistItem => ({
          id: item.id,
          text: item.text,
          isCompleted: item.isCompleted,
        })
      ),
    };
  }
  return {
    ...base,
    tags: raw.tags ?? [],
    color: raw.color ?? '#000000',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function register(
  email: string,
  password: string
): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function syncFirebaseSession(
  idToken: string
): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/auth/firebase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await handleResponse<{ token: string }>(res);
  const { setToken } = await import('@/lib/authStorage');
  await setToken(data.token);
  return data;
}

export async function getNotes(): Promise<AnyNote[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/notes`, { headers });
  const data = await handleResponse<ApiNoteResponse[]>(res);
  return data.map(mapApiNote);
}

export async function createNote(data: CreateNoteInput): Promise<AnyNote> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const raw = await handleResponse<ApiNoteResponse>(res);
  return mapApiNote(raw);
}

export async function updateNote(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    color: string;
    archived: boolean;
  }>
): Promise<AnyNote> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  const raw = await handleResponse<ApiNoteResponse>(res);
  return mapApiNote(raw);
}

export async function deleteNote(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'DELETE',
    headers,
  });
  await handleResponse<void>(res);
}

export async function toggleChecklistItem(
  itemId: string,
  isCompleted: boolean
): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/checklist-items/${itemId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ isCompleted }),
  });
  await handleResponse(res);
}
