import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChecklistCard } from '@/components/items/ChecklistCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchHeader } from '@/components/ui/SearchHeader';
import { useTheme } from '@/constants/theme';
import { useNotesStore } from '@/store/notesStore';

export default function ChecklistsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checklists = useNotesStore((s) => s.checklists);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const active = checklists.filter((c) => !c.archived);
    if (!query.trim()) return active;
    const q = query.toLowerCase();
    return active.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.items.some((i) => i.text.toLowerCase().includes(q))
    );
  }, [checklists, query]);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <SearchHeader
        title="Tareas"
        query={query}
        onChangeQuery={setQuery}
        onAdd={() => router.push('/nueva-nota?type=checklist')}
      />
      {data.length === 0 ? (
        <EmptyState message="No hay listas de tareas. Crea una con +." />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <ChecklistCard
              checklist={item}
              index={index}
              onPress={() => router.push(`/(tabs)/checklists/${item.id}`)}
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
