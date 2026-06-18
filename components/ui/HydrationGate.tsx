import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';

import { useTheme } from '@/constants/theme';
import { getToken } from '@/lib/authStorage';
import { useNotesStore } from '@/store/notesStore';

interface HydrationGateProps {
  children: ReactNode;
}

export function HydrationGate({ children }: HydrationGateProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const isReady = useNotesStore((s) => s.isReady);
  const isLoading = useNotesStore((s) => s.isLoading);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);

  const isAuthRoute = pathname === '/auth' || pathname.startsWith('/auth');

  useEffect(() => {
    if (isAuthRoute) {
      useNotesStore.setState({ isReady: true, isLoading: false });
      return;
    }
    void getToken().then((token) => {
      if (token) void fetchNotes();
      else useNotesStore.setState({ isReady: true, isLoading: false });
    });
  }, [fetchNotes, isAuthRoute]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!isReady || isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.foreground} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
