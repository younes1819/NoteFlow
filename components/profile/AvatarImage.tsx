import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/constants/theme';

interface AvatarImageProps {
  uri: string | null | undefined;
  size?: number;
  loading?: boolean;
}

export function AvatarImage({ uri, size = 100, loading = false }: AvatarImageProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <ActivityIndicator color={theme.colors.foreground} />
      </View>
    );
  }

  if (!uri) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderColor: theme.colors.border,
        },
      ]}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
  },
  placeholder: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
