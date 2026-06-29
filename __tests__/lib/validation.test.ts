import {
  checklistSchema,
  ideaSchema,
  noteSchema,
} from '@/lib/validation';

describe('noteSchema', () => {
  it('acepta una nota válida', () => {
    const result = noteSchema.safeParse({ title: 'Mi nota', content: 'Texto' });
    expect(result.success).toBe(true);
  });

  it('rechaza un título demasiado corto', () => {
    const result = noteSchema.safeParse({ title: 'ab', content: 'Texto' });
    expect(result.success).toBe(false);
  });

  it('rechaza contenido vacío', () => {
    const result = noteSchema.safeParse({ title: 'Mi nota', content: '' });
    expect(result.success).toBe(false);
  });
});

describe('checklistSchema', () => {
  it('acepta una lista con al menos un ítem', () => {
    const result = checklistSchema.safeParse({
      title: 'Compras',
      items: ['Leche'],
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una lista sin ítems', () => {
    const result = checklistSchema.safeParse({ title: 'Compras', items: [] });
    expect(result.success).toBe(false);
  });

  it('rechaza ítems vacíos', () => {
    const result = checklistSchema.safeParse({
      title: 'Compras',
      items: [''],
    });
    expect(result.success).toBe(false);
  });
});

describe('ideaSchema', () => {
  it('acepta una idea válida con tags por defecto', () => {
    const result = ideaSchema.safeParse({ title: 'Idea', color: '#fff' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('rechaza una idea sin color', () => {
    const result = ideaSchema.safeParse({ title: 'Idea', color: '' });
    expect(result.success).toBe(false);
  });
});
