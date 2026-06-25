import { create } from 'zustand';

import * as api from '@/lib/api';
import { hapticSuccess } from '@/lib/haptics';
import { cancelReminder } from '@/lib/notifications';
import type { ChecklistNote, IdeaNote, Note } from '@/types';
import { isChecklistNote, isIdeaNote, isTextNote } from '@/lib/typeGuards';

export interface AddNoteOptions {
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (
    title: string,
    content: string,
    options?: AddNoteOptions
  ) => Promise<Note | undefined>;
  addChecklist: (
    title: string,
    itemTexts: string[],
    options?: AddNoteOptions
  ) => Promise<void>;
  addIdea: (
    title: string,
    tags: string[],
    color: string,
    options?: AddNoteOptions
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  deleteChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  archiveChecklist: (id: string) => Promise<void>;
  archiveIdea: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  restoreChecklist: (id: string) => Promise<void>;
  restoreIdea: (id: string) => Promise<void>;
  toggleChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
}

function splitNotes(all: Awaited<ReturnType<typeof api.getNotes>>) {
  const notes: Note[] = [];
  const checklists: ChecklistNote[] = [];
  const ideas: IdeaNote[] = [];
  for (const item of all) {
    if (isTextNote(item)) notes.push(item);
    else if (isChecklistNote(item)) checklists.push(item);
    else if (isIdeaNote(item)) ideas.push(item);
  }
  return { notes, checklists, ideas };
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  isLoading: false,
  error: null,
  isReady: false,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const all = await api.getNotes();
      const split = splitNotes(all);
      set({ ...split, isLoading: false, isReady: true });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar notas',
        isReady: true,
      });
    }
  },

  addNote: async (title, content, options) => {
    const created = await api.createNote({
      title,
      type: 'note',
      content,
      ...options,
    });
    if (!isTextNote(created)) return undefined;
    set((state) => ({ notes: [created, ...state.notes] }));
    return created;
  },

  addChecklist: async (title, itemTexts, options) => {
    const created = await api.createNote({
      title,
      type: 'checklist',
      items: itemTexts.map((text) => ({ text })),
      ...options,
    });
    if (!isChecklistNote(created)) return;
    set((state) => ({ checklists: [created, ...state.checklists] }));
  },

  addIdea: async (title, tags, color, options) => {
    const created = await api.createNote({
      title,
      type: 'idea',
      tags,
      color,
      ...options,
    });
    if (!isIdeaNote(created)) return;
    set((state) => ({ ideas: [created, ...state.ideas] }));
  },

  deleteNote: async (id) => {
    await api.deleteNote(id);
    await cancelReminder(id);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },

  deleteChecklist: async (id) => {
    await api.deleteNote(id);
    await cancelReminder(id);
    set((state) => ({
      checklists: state.checklists.filter((c) => c.id !== id),
    }));
  },

  deleteIdea: async (id) => {
    await api.deleteNote(id);
    await cancelReminder(id);
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }));
  },

  deleteChecklistItem: async (checklistId, itemId) => {
    await api.deleteChecklistItem(itemId);
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id !== checklistId
          ? c
          : {
              ...c,
              items: c.items.filter((i) => i.id !== itemId),
              updatedAt: new Date(),
            }
      ),
    }));
  },

  archiveNote: async (id) => {
    const updated = await api.updateNote(id, { archived: true });
    if (!isTextNote(updated)) return;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  archiveChecklist: async (id) => {
    const updated = await api.updateNote(id, { archived: true });
    if (!isChecklistNote(updated)) return;
    set((state) => ({
      checklists: state.checklists.map((c) => (c.id === id ? updated : c)),
    }));
  },

  archiveIdea: async (id) => {
    const updated = await api.updateNote(id, { archived: true });
    if (!isIdeaNote(updated)) return;
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? updated : i)),
    }));
  },

  restoreNote: async (id) => {
    const updated = await api.updateNote(id, { archived: false });
    if (!isTextNote(updated)) return;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  restoreChecklist: async (id) => {
    const updated = await api.updateNote(id, { archived: false });
    if (!isChecklistNote(updated)) return;
    set((state) => ({
      checklists: state.checklists.map((c) => (c.id === id ? updated : c)),
    }));
  },

  restoreIdea: async (id) => {
    const updated = await api.updateNote(id, { archived: false });
    if (!isIdeaNote(updated)) return;
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? updated : i)),
    }));
  },

  toggleChecklistItem: async (checklistId, itemId) => {
    const { checklists } = get();
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const item = checklist.items.find((i) => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.isCompleted;
    await api.toggleChecklistItem(itemId, newCompleted);

    const updatedItems = checklist.items.map((i) =>
      i.id === itemId ? { ...i, isCompleted: newCompleted } : i
    );
    const allDone =
      updatedItems.length > 0 &&
      updatedItems.every((i) => i.isCompleted);

    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id !== checklistId
          ? c
          : { ...c, items: updatedItems, updatedAt: new Date() }
      ),
    }));

    if (allDone) {
      void hapticSuccess();
    }
  },
}));
