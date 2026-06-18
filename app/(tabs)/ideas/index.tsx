import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IdeaCard } from '@/components/items/IdeaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchHeader } from '@/components/ui/SearchHeader';
import { useTheme } from '@/constants/theme';
import { useNotesStore } from '@/store/notesStore';

export default function IdeasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ideas = useNotesStore((s) => s.ideas);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const active = ideas.filter((i) => !i.archived);
    if (!query.trim()) return active;
    const q = query.toLowerCase();
    return active.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [ideas, query]);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <SearchHeader
        title="Ideas"
        query={query}
        onChangeQuery={setQuery}
        onAdd={() => router.push('/nueva-nota?type=idea')}
      />
      {data.length === 0 ? (
        <EmptyState message="No hay ideas guardadas. Captura una con +." />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <IdeaCard
              idea={item}
              index={index}
              onPress={() => router.push(`/(tabs)/ideas/${item.id}`)}
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
