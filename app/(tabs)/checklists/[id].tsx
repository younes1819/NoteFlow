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
import { SwipeableRow } from '@/components/gestures/SwipeableRow';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { hapticDelete } from '@/lib/haptics';
import { useNotesStore } from '@/store/notesStore';

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checklist = useNotesStore((s) => s.checklists.find((c) => c.id === id));
  const deleteChecklist = useNotesStore((s) => s.deleteChecklist);
  const archiveChecklist = useNotesStore((s) => s.archiveChecklist);
  const toggleChecklistItem = useNotesStore((s) => s.toggleChecklistItem);
  const deleteChecklistItem = useNotesStore((s) => s.deleteChecklistItem);

  if (!checklist) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.muted }}>Lista no encontrada</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Eliminar lista', '¿Seguro que quieres eliminar esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await hapticDelete();
          await deleteChecklist(checklist.id);
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
              await archiveChecklist(checklist.id);
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
        {formatDate(checklist.updatedAt)}
      </Text>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {checklist.title}
      </Text>
      {checklist.items.map((item) => (
        <View key={item.id} style={styles.itemWrapper}>
          <SwipeableRow
            onDelete={() => {
              void hapticDelete().then(() =>
                deleteChecklistItem(checklist.id, item.id)
              );
            }}
            deleteLabel="QUITAR"
          >
            <Pressable
              onPress={() => void toggleChecklistItem(checklist.id, item.id)}
              style={[
                styles.itemRow,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
            <Ionicons
              name={item.isCompleted ? 'checkbox' : 'square-outline'}
              size={22}
              color={item.isCompleted ? theme.colors.accent : theme.colors.foreground}
            />
            <Text
              style={[
                styles.itemText,
                {
                  color: theme.colors.foreground,
                  textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                  opacity: item.isCompleted ? 0.6 : 1,
                },
              ]}
            >
              {item.text}
            </Text>
          </Pressable>
        </SwipeableRow>
        </View>
      ))}
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
  itemWrapper: { marginBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    padding: 12,
  },
  itemText: { flex: 1, fontSize: 15 },
});
