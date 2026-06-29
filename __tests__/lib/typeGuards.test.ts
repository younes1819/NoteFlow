import { isChecklistNote, isIdeaNote, isTextNote } from '@/lib/typeGuards';
import type { ChecklistNote, IdeaNote, Note } from '@/types';

const base = {
  id: '1',
  title: 'Título',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const textNote: Note = { ...base, content: 'Cuerpo' };
const checklistNote: ChecklistNote = {
  ...base,
  items: [{ id: 'i1', text: 'Comprar', isCompleted: false }],
};
const ideaNote: IdeaNote = { ...base, tags: ['ux'], color: '#000000' };

describe('typeGuards', () => {
  it('isTextNote reconoce solo notas de texto', () => {
    expect(isTextNote(textNote)).toBe(true);
    expect(isTextNote(checklistNote)).toBe(false);
    expect(isTextNote(ideaNote)).toBe(false);
  });

  it('isChecklistNote reconoce solo listas', () => {
    expect(isChecklistNote(checklistNote)).toBe(true);
    expect(isChecklistNote(textNote)).toBe(false);
    expect(isChecklistNote(ideaNote)).toBe(false);
  });

  it('isIdeaNote reconoce solo ideas', () => {
    expect(isIdeaNote(ideaNote)).toBe(true);
    expect(isIdeaNote(textNote)).toBe(false);
    expect(isIdeaNote(checklistNote)).toBe(false);
  });
});
