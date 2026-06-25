import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useTheme } from '@/constants/theme';
import { getToken } from '@/lib/authStorage';
import { isFirebaseNative } from '@/lib/firebase/platform';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const firebaseInitializing = useAuthStore((s) => s.initializing);
  const firebaseUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isFirebaseNative) return;
    void getToken().then((token) => {
      setHasToken(!!token);
      setChecked(true);
    });
  }, []);

  if (isFirebaseNative) {
    if (firebaseInitializing) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.background,
          }}
        >
          <ActivityIndicator color={theme.colors.foreground} />
        </View>
      );
    }
    return <Redirect href={firebaseUser ? '/(tabs)/notas' : '/auth'} />;
  }

  if (!checked) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.foreground} />
      </View>
    );
  }

  return <Redirect href={hasToken ? '/(tabs)/notas' : '/auth'} />;
}
