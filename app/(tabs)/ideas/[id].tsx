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

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const idea = useNotesStore((s) => s.ideas.find((i) => i.id === id));
  const deleteIdea = useNotesStore((s) => s.deleteIdea);
  const archiveIdea = useNotesStore((s) => s.archiveIdea);

  if (!idea) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.muted }}>Idea no encontrada</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Eliminar idea', '¿Seguro que quieres eliminar esta idea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await hapticDelete();
          await deleteIdea(idea.id);
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
      <View
        style={[
          styles.colorBand,
          { backgroundColor: idea.color, borderColor: theme.colors.border },
        ]}
      />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.foreground} />
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            onPress={async () => {
              await archiveIdea(idea.id);
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
        {formatDate(idea.updatedAt)}
      </Text>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {idea.title}
      </Text>
      <View style={styles.tags}>
        {idea.tags.map((tag) => (
          <View
            key={tag}
            style={[styles.chip, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.foreground, fontSize: 12 }}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
      {idea.locationName ? (
        <Text style={[styles.location, { color: theme.colors.muted }]}>
          📍 {idea.locationName}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16 },
  colorBand: {
    height: 8,
    marginHorizontal: -16,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
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
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  location: { fontSize: 13, marginTop: 16, letterSpacing: 0.3 },
});
