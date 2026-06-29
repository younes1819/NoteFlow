import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChecklistCard } from '@/components/items/ChecklistCard';
import { IdeaCard } from '@/components/items/IdeaCard';
import { NoteCard } from '@/components/items/NoteCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { useNotesStore } from '@/store/notesStore';

export default function ArchivadasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((s) => s.notes);
  const checklists = useNotesStore((s) => s.checklists);
  const ideas = useNotesStore((s) => s.ideas);
  const restoreNote = useNotesStore((s) => s.restoreNote);
  const restoreChecklist = useNotesStore((s) => s.restoreChecklist);
  const restoreIdea = useNotesStore((s) => s.restoreIdea);

  const archived = useMemo(
    () => ({
      notes: notes.filter((n) => n.archived),
      checklists: checklists.filter((c) => c.archived),
      ideas: ideas.filter((i) => i.archived),
    }),
    [notes, checklists, ideas]
  );

  const isEmpty =
    archived.notes.length === 0 &&
    archived.checklists.length === 0 &&
    archived.ideas.length === 0;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        ARCHIVADAS
      </Text>
      {isEmpty ? (
        <EmptyState message="No hay elementos archivados." />
      ) : (
        <View style={styles.sections}>
          {archived.notes.map((note, index) => (
            <View key={note.id}>
              <NoteCard
                note={note}
                index={index}
                onPress={() => router.push(`/(tabs)/notas/${note.id}`)}
              />
              <Pressable
                onPress={() => void restoreNote(note.id)}
                style={[styles.restore, { borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.foreground }}>Restaurar</Text>
              </Pressable>
            </View>
          ))}
          {archived.checklists.map((checklist, index) => (
            <View key={checklist.id}>
              <ChecklistCard
                checklist={checklist}
                index={index}
                onPress={() => router.push(`/(tabs)/checklists/${checklist.id}`)}
              />
              <Pressable
                onPress={() => void restoreChecklist(checklist.id)}
                style={[styles.restore, { borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.foreground }}>Restaurar</Text>
              </Pressable>
            </View>
          ))}
          {archived.ideas.map((idea, index) => (
            <View key={idea.id}>
              <IdeaCard
                idea={idea}
                index={index}
                onPress={() => router.push(`/(tabs)/ideas/${idea.id}`)}
              />
              <Pressable
                onPress={() => void restoreIdea(idea.id)}
                style={[styles.restore, { borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.foreground }}>Restaurar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  sections: { gap: 4 },
  restore: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    marginTop: -4,
  },
});
