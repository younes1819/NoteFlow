import { render, screen } from '@testing-library/react-native';

import NotasScreen from '@/app/(tabs)/notas/index';
import type { Note } from '@/types';

const mockState: { notes: Note[]; deleteNote: jest.Mock } = {
  notes: [],
  deleteNote: jest.fn(),
};

jest.mock('@/store/notesStore', () => ({
  useNotesStore: (selector: (s: typeof mockState) => unknown) =>
    selector(mockState),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/lib/haptics', () => ({
  hapticDelete: jest.fn().mockResolvedValue(undefined),
  hapticSuccess: jest.fn().mockResolvedValue(undefined),
}));

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    title: 'Nota de prueba',
    content: 'Contenido de la nota',
    createdAt: new Date('2026-06-29T10:00:00Z'),
    updatedAt: new Date('2026-06-29T10:00:00Z'),
    archived: false,
    ...overrides,
  };
}

describe('NotasScreen', () => {
  it('muestra el estado vacío cuando no hay notas', () => {
    mockState.notes = [];
    render(<NotasScreen />);
    expect(
      screen.getByText('No hay notas. Pulsa + para crear la primera.')
    ).toBeTruthy();
  });

  it('renderiza las notas existentes del store', () => {
    mockState.notes = [
      makeNote({ id: '1', title: 'Primera nota' }),
      makeNote({ id: '2', title: 'Segunda nota' }),
    ];
    render(<NotasScreen />);
    expect(screen.getByText('Primera nota')).toBeTruthy();
    expect(screen.getByText('Segunda nota')).toBeTruthy();
  });

  it('oculta las notas archivadas', () => {
    mockState.notes = [
      makeNote({ id: '1', title: 'Nota activa' }),
      makeNote({ id: '2', title: 'Nota archivada', archived: true }),
    ];
    render(<NotasScreen />);
    expect(screen.getByText('Nota activa')).toBeTruthy();
    expect(screen.queryByText('Nota archivada')).toBeNull();
  });

  it('expone etiquetas de accesibilidad en las tarjetas y el botón de añadir', () => {
    mockState.notes = [makeNote({ id: '1', title: 'Reunión' })];
    render(<NotasScreen />);
    expect(screen.getByLabelText('Nota: Reunión')).toBeTruthy();
    expect(screen.getByLabelText('Añadir en Notas')).toBeTruthy();
  });
});
