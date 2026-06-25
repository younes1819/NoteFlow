import '@/global.css';

import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { HydrationGate } from '@/components/ui/HydrationGate';
import { getColorMode, noteflowTheme } from '@/constants/theme';
import { isFirebaseNative } from '@/lib/firebase/platform';
import { useAuthStore } from '@/store/authStore';

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const mode = getColorMode(useColorScheme());
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    if (!isFirebaseNative) return;
    return init();
  }, [init]);

  useEffect(() => {
    if (!isFirebaseNative || initializing) return;

    const inAuthScreen = segments[0] === 'auth';

    if (!user && !inAuthScreen) {
      router.replace('/auth');
      return;
    }

    if (user && inAuthScreen) {
      router.replace('/(tabs)/notas');
    }
  }, [user, initializing, segments, router]);

  if (isFirebaseNative && initializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: noteflowTheme[mode].colors.background,
        }}
      >
        <ActivityIndicator color={noteflowTheme[mode].colors.foreground} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const mode = getColorMode(useColorScheme());

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={mode}>
        <HydrationGate>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: noteflowTheme[mode].colors.background,
                },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen
                name="nueva-nota"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
          </AuthGate>
        </HydrationGate>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
