import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteCard } from '@/components/items/NoteCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchHeader } from '@/components/ui/SearchHeader';
import { useTheme } from '@/constants/theme';
import { useNotesStore } from '@/store/notesStore';

export default function NotasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((s) => s.notes);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const active = notes.filter((n) => !n.archived);
    if (!query.trim()) return active;
    const q = query.toLowerCase();
    return active.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <SearchHeader
        title="Notas"
        query={query}
        onChangeQuery={setQuery}
        onAdd={() => router.push('/nueva-nota?type=note')}
      />
      {data.length === 0 ? (
        <EmptyState message="No hay notas. Pulsa + para crear la primera." />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <NoteCard
              note={item}
              index={index}
              onPress={() => router.push(`/(tabs)/notas/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
});
