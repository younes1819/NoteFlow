import '@/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { HydrationGate } from '@/components/ui/HydrationGate';
import { getColorMode, noteflowTheme } from '@/constants/theme';

export default function RootLayout() {
  const mode = getColorMode(useColorScheme());

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={mode}>
        <HydrationGate>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
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
        </HydrationGate>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
