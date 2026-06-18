export interface BaseNote {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
}

export interface Note extends BaseNote {
  content: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface ChecklistNote extends BaseNote {
  items: ChecklistItem[];
}

export interface IdeaNote extends BaseNote {
  tags: string[];
  color: string;
}

export type AnyNote = Note | ChecklistNote | IdeaNote;

export type NoteKind = 'note' | 'checklist' | 'idea';

export interface PersistedNote extends Omit<Note, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface PersistedChecklistNote
  extends Omit<ChecklistNote, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface PersistedIdeaNote extends Omit<IdeaNote, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}
