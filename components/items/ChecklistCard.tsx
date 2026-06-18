import { StyleSheet, View } from 'react-native';

import { AnimatedCard } from '@/components/items/AnimatedCard';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import type { ChecklistNote } from '@/types';

interface ChecklistCardProps {
  checklist: ChecklistNote;
  index?: number;
  onPress: () => void;
}

export function ChecklistCard({ checklist, index, onPress }: ChecklistCardProps) {
  const theme = useTheme();
  const completed = checklist.items.filter((i) => i.isCompleted).length;
  const total = checklist.items.length;
  const progress = total > 0 ? completed / total : 0;

  return (
    <AnimatedCard index={index} onPress={onPress}>
      <View style={[styles.header, { backgroundColor: theme.colors.cardHeader }]}>
        <Text style={[styles.badge, { color: theme.colors.cardHeaderText }]}>
          TAREA
        </Text>
        <Text style={[styles.date, { color: theme.colors.cardHeaderText }]}>
          {formatDate(checklist.createdAt)}
        </Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {checklist.title}
      </Text>
      <Text style={[styles.meta, { color: theme.colors.muted }]}>
        {completed}/{total} completadas
      </Text>
      <View style={[styles.track, { backgroundColor: theme.colors.muted, opacity: 0.25 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: theme.colors.accent,
            },
          ]}
        />
      </View>
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
  meta: {
    fontSize: 12,
    marginBottom: 8,
  },
  track: {
    height: 4,
    width: '100%',
  },
  fill: {
    height: 4,
  },
});
