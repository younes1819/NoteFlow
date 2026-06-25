import { Platform } from 'react-native';

export const isFirebaseNative = Platform.OS !== 'web';
