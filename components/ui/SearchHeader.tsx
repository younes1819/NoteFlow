import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';

interface SearchHeaderProps {
  title: string;
  query: string;
  onChangeQuery: (value: string) => void;
  onAdd: () => void;
}

export function SearchHeader({
  title,
  query,
  onChangeQuery,
  onAdd,
}: SearchHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          {title}
        </Text>
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={`Añadir en ${title}`}
          style={[styles.addButton, { borderColor: theme.colors.border }]}
        >
          <Ionicons name="add" size={20} color={theme.colors.foreground} />
        </Pressable>
      </View>
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        accessibilityLabel={`Buscar en ${title}`}
        placeholder="Buscar…"
        placeholderTextColor={theme.colors.muted}
        style={[
          styles.input,
          {
            color: theme.colors.foreground,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  addButton: {
    borderWidth: 1,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
