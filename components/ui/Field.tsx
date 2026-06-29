import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme, type NoteFlowTheme } from '@/constants/theme';

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.colors.muted }]}>{label}</Text>
      {children}
      {error ? (
        <Text style={[styles.error, { color: theme.colors.accent }]}>{error}</Text>
      ) : null}
    </View>
  );
}

export function inputStyle(theme: NoteFlowTheme) {
  return {
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  } as const;
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  error: { fontSize: 12, marginTop: 4 },
});
