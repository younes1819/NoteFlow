import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { hapticDelete } from '@/lib/haptics';
import { useNotesStore } from '@/store/notesStore';

export default function NotaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id));
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const archiveNote = useNotesStore((s) => s.archiveNote);

  if (!note) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.muted }}>Nota no encontrada</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Eliminar nota', '¿Seguro que quieres eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await hapticDelete();
          await deleteNote(note.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.foreground} />
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            onPress={async () => {
              await archiveNote(note.id);
              router.back();
            }}
            style={[styles.actionBtn, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.foreground }}>Archivar</Text>
          </Pressable>
          <Pressable
            onPress={confirmDelete}
            style={[styles.actionBtn, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.accent }}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
      <Text style={[styles.date, { color: theme.colors.muted }]}>
        {formatDate(note.updatedAt)}
      </Text>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {note.title}
      </Text>
      <Text style={[styles.body, { color: theme.colors.foreground }]}>
        {note.content}
      </Text>
      {note.locationName ? (
        <Text style={[styles.location, { color: theme.colors.muted }]}>
          📍 {note.locationName}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBtn: { padding: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  date: { fontSize: 12, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  body: { fontSize: 16, lineHeight: 24 },
  location: { fontSize: 13, marginTop: 16, letterSpacing: 0.3 },
});
