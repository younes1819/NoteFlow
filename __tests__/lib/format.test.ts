import { formatDate, truncate } from '@/lib/format';

describe('formatDate', () => {
  it('formatea una fecha en español con día, mes y año', () => {
    const date = new Date('2026-06-29T10:00:00Z');
    const result = formatDate(date);
    expect(result).toContain('2026');
    expect(typeof result).toBe('string');
  });
});

describe('truncate', () => {
  it('deja el texto intacto cuando es más corto que el máximo', () => {
    expect(truncate('hola')).toBe('hola');
  });

  it('recorta y añade una elipsis cuando supera el máximo', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long, 10);
    expect(result).toHaveLength(11);
    expect(result.endsWith('…')).toBe(true);
  });

  it('elimina espacios sobrantes en los extremos', () => {
    expect(truncate('   hola   ')).toBe('hola');
  });

  it('respeta el límite personalizado', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });
});
