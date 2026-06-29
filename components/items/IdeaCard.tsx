import { StyleSheet, View } from 'react-native';

import { AnimatedCard } from '@/components/items/AnimatedCard';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import type { IdeaNote } from '@/types';

interface IdeaCardProps {
  idea: IdeaNote;
  index?: number;
  onPress: () => void;
  onDelete?: () => void;
}

export function IdeaCard({ idea, index, onPress, onDelete }: IdeaCardProps) {
  const theme = useTheme();

  return (
    <AnimatedCard index={index} onPress={onPress} onDelete={onDelete}>
      <View
        style={[
          styles.colorBand,
          { backgroundColor: idea.color, borderColor: theme.colors.border },
        ]}
      />
      <View style={[styles.header, { backgroundColor: theme.colors.cardHeader }]}>
        <Text style={[styles.badge, { color: theme.colors.cardHeaderText }]}>
          IDEA
        </Text>
        <Text style={[styles.date, { color: theme.colors.cardHeaderText }]}>
          {formatDate(idea.createdAt)}
        </Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {idea.title}
      </Text>
      {idea.tags.length > 0 && (
        <View style={styles.tags}>
          {idea.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.chip, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.chipText, { color: theme.colors.foreground }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
      {idea.locationName ? (
        <Text style={[styles.location, { color: theme.colors.muted }]}>
          📍 {idea.locationName}
        </Text>
      ) : null}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  colorBand: {
    height: 6,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: -16,
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
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  location: {
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
