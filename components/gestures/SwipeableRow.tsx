import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
}

const DELETE_THRESHOLD = -80;

export function SwipeableRow({
  children,
  onDelete,
  deleteLabel = 'ELIMINAR',
}: SwipeableRowProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        runOnJS(onDelete)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.deleteBackground,
          { backgroundColor: theme.colors.accent },
        ]}
      >
        <Text style={styles.deleteText}>{deleteLabel}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFill,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
});
