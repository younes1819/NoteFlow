import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';

interface AnimatedCardProps {
  children: ReactNode;
  onPress?: () => void;
  index?: number;
}

export function AnimatedCard({ children, onPress, index = 0 }: AnimatedCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify()}
      exiting={FadeOutLeft.springify()}
      style={styles.wrapper}
    >
      <Pressable
        onPress={onPress}
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
