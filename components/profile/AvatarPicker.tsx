import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { isFirebaseNative } from '@/lib/firebase/platform';
import { uploadAvatar } from '@/lib/upload';
import { AvatarImage } from '@/components/profile/AvatarImage';

interface AvatarPickerProps {
  avatarUrl: string | null | undefined;
  onUploaded: (url: string) => void;
}

export function AvatarPicker({ avatarUrl, onUploaded }: AvatarPickerProps) {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source: 'library' | 'camera') => {
    if (!isFirebaseNative) {
      Alert.alert('No disponible', 'La cámara y galería solo funcionan en móvil nativo.');
      return;
    }

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        source === 'camera'
          ? 'Necesitamos permiso para usar la cámara'
          : 'Necesitamos permisos para acceder a tu galería'
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const publicUrl = await uploadAvatar(asset.uri, mimeType);
      onUploaded(publicUrl);
    } catch (err) {
      Alert.alert(
        'Error al subir',
        err instanceof Error ? err.message : 'No se pudo subir la imagen'
      );
    } finally {
      setUploading(false);
    }
  };

  const showPickerOptions = () => {
    if (Platform.OS === 'ios') {
      Alert.alert('Cambiar foto', 'Elige una opción', [
        { text: 'Galería', onPress: () => void pickImage('library') },
        { text: 'Cámara', onPress: () => void pickImage('camera') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
      return;
    }

    Alert.alert('Cambiar foto', 'Elige una opción', [
      { text: 'Galería', onPress: () => void pickImage('library') },
      { text: 'Cámara', onPress: () => void pickImage('camera') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <AvatarImage uri={avatarUrl} loading={uploading} size={120} />
      <Pressable
        onPress={showPickerOptions}
        disabled={uploading}
        style={[styles.button, { borderColor: theme.colors.border }]}
      >
        <Text style={{ color: theme.colors.foreground, fontWeight: '700' }}>
          {uploading ? 'SUBIENDO...' : 'CAMBIAR FOTO'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
