import type { AnyNote, ChecklistNote, IdeaNote, Note } from '@/types';

export function isChecklistNote(note: AnyNote): note is ChecklistNote {
  return 'items' in note;
}

export function isIdeaNote(note: AnyNote): note is IdeaNote {
  return 'tags' in note && 'color' in note;
}

export function isTextNote(note: AnyNote): note is Note {
  return 'content' in note;
}
