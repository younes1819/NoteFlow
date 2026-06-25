import { StyleSheet, View } from 'react-native';

import { AnimatedCard } from '@/components/items/AnimatedCard';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { formatDate, truncate } from '@/lib/format';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  index?: number;
  onPress: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, index, onPress, onDelete }: NoteCardProps) {
  const theme = useTheme();

  return (
    <AnimatedCard index={index} onPress={onPress} onDelete={onDelete}>
      <View style={[styles.header, { backgroundColor: theme.colors.cardHeader }]}>
        <Text style={[styles.badge, { color: theme.colors.cardHeaderText }]}>
          NOTA
        </Text>
        <Text style={[styles.date, { color: theme.colors.cardHeaderText }]}>
          {formatDate(note.createdAt)}
        </Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {note.title}
      </Text>
      <Text style={[styles.preview, { color: theme.colors.muted }]}>
        {truncate(note.content)}
      </Text>
      {note.locationName ? (
        <Text style={[styles.location, { color: theme.colors.muted }]}>
          📍 {note.locationName}
        </Text>
      ) : null}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  date: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
  },
  location: {
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
