import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { promptOpenSettings } from '@/lib/permissions';

export interface NoteLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

export async function getCurrentAddress(): Promise<NoteLocation | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    if (!canAskAgain) {
      await promptOpenSettings(
        'Permisos de ubicación',
        'Activa la ubicación en Ajustes para geolocalizar tus notas.'
      );
    }
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const [address] = await Location.reverseGeocodeAsync(position.coords);
  const parts = [address?.street, address?.city].filter(Boolean);
  const locationName =
    parts.length > 0 ? parts.join(', ') : 'Ubicación actual';

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    locationName,
  };
}
