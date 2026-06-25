import { Alert, Linking, Platform } from 'react-native';

export async function promptOpenSettings(
  title: string,
  message: string
): Promise<void> {
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Abrir ajustes',
      onPress: () => {
        if (Platform.OS === 'ios') {
          void Linking.openURL('app-settings:');
        } else {
          void Linking.openSettings();
        }
      },
    },
  ]);
}
