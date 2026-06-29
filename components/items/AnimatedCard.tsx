import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { SwipeableRow } from '@/components/gestures/SwipeableRow';
import { useTheme } from '@/constants/theme';

interface AnimatedCardProps {
  children: ReactNode;
  onPress?: () => void;
  onDelete?: () => void;
  index?: number;
  accessibilityLabel?: string;
}

export function AnimatedCard({
  children,
  onPress,
  onDelete,
  index = 0,
  accessibilityLabel,
}: AnimatedCardProps) {
  const theme = useTheme();

  const card = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={
        onDelete
          ? 'Pulsa para abrir. Desliza a la izquierda para eliminar.'
          : undefined
      }
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify()}
      exiting={FadeOut.springify()}
      style={styles.wrapper}
    >
      {onDelete ? (
        <SwipeableRow onDelete={onDelete}>{card}</SwipeableRow>
      ) : (
        card
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    padding: 16,
  },
});
