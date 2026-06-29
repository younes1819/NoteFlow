import * as api from '@/lib/api';
import { useNotesStore } from '@/store/notesStore';
import type { ChecklistNote, Note } from '@/types';

jest.mock('@/lib/api');
jest.mock('@/lib/notifications', () => ({
  cancelReminder: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/haptics', () => ({
  hapticSuccess: jest.fn().mockResolvedValue(undefined),
  hapticDelete: jest.fn().mockResolvedValue(undefined),
}));

const mockedApi = api as jest.Mocked<typeof api>;

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    title: 'Mi nota',
    content: 'Contenido',
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
    ...overrides,
  };
}

function makeChecklist(overrides: Partial<ChecklistNote> = {}): ChecklistNote {
  return {
    id: 'c1',
    title: 'Compras',
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
    items: [
      { id: 'i1', text: 'Leche', isCompleted: false },
      { id: 'i2', text: 'Pan', isCompleted: false },
    ],
    ...overrides,
  };
}

describe('notesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNotesStore.setState({
      notes: [],
      checklists: [],
      ideas: [],
      isLoading: false,
      error: null,
      isReady: false,
    });
  });

  it('addNote añade correctamente una nota al store', async () => {
    const created = makeNote({ title: 'Mi nota' });
    mockedApi.createNote.mockResolvedValue(created);

    await useNotesStore.getState().addNote('Mi nota', 'Contenido');

    const { notes } = useNotesStore.getState();
    expect(notes).toHaveLength(1);
    expect(notes[0]?.title).toBe('Mi nota');
  });

  it('addNote envía las opciones de ubicación a la API', async () => {
    mockedApi.createNote.mockResolvedValue(makeNote());

    await useNotesStore.getState().addNote('Mi nota', 'Contenido', {
      latitude: 1,
      longitude: 2,
      locationName: 'Madrid',
    });

    expect(mockedApi.createNote).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 1, longitude: 2, locationName: 'Madrid' })
    );
  });

  it('deleteNote elimina la nota y cancela su recordatorio', async () => {
    mockedApi.deleteNote.mockResolvedValue(undefined);
    useNotesStore.setState({ notes: [makeNote({ id: 'x' })] });

    await useNotesStore.getState().deleteNote('x');

    expect(useNotesStore.getState().notes).toHaveLength(0);
    expect(mockedApi.deleteNote).toHaveBeenCalledWith('x');
  });

  it('fetchNotes reparte las entradas por tipo', async () => {
    mockedApi.getNotes.mockResolvedValue([
      makeNote({ id: 'n1' }),
      makeChecklist({ id: 'c1' }),
    ]);

    await useNotesStore.getState().fetchNotes();

    const state = useNotesStore.getState();
    expect(state.notes).toHaveLength(1);
    expect(state.checklists).toHaveLength(1);
    expect(state.isReady).toBe(true);
  });

  it('toggleChecklistItem invierte el estado del ítem', async () => {
    mockedApi.toggleChecklistItem.mockResolvedValue(undefined);
    useNotesStore.setState({ checklists: [makeChecklist()] });

    await useNotesStore.getState().toggleChecklistItem('c1', 'i1');

    const item = useNotesStore
      .getState()
      .checklists[0]?.items.find((i) => i.id === 'i1');
    expect(item?.isCompleted).toBe(true);
    expect(mockedApi.toggleChecklistItem).toHaveBeenCalledWith('i1', true);
  });

  it('fetchNotes guarda el error cuando la API falla', async () => {
    mockedApi.getNotes.mockRejectedValue(new Error('fallo de red'));

    await useNotesStore.getState().fetchNotes();

    const state = useNotesStore.getState();
    expect(state.error).toBe('fallo de red');
    expect(state.isReady).toBe(true);
  });
});
