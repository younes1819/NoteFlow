import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { login, register } from '@/lib/api';
import { setToken } from '@/lib/authStorage';
import { useNotesStore } from '@/store/notesStore';

export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fetchNotes = useNotesStore((s) => s.fetchNotes);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const { token } = await fn(email.trim(), password);
      await setToken(token);
      await fetchNotes();
      router.replace('/(tabs)/notas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={[styles.brand, { color: theme.colors.foreground }]}>
          NOTEFLOW
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[inputStyle(theme)]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor={theme.colors.muted}
          secureTextEntry
          style={[inputStyle(theme), { marginTop: 12 }]}
        />

        {error ? (
          <Text style={[styles.error, { color: theme.colors.accent }]}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.button, { borderColor: theme.colors.border }]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.foreground} />
          ) : (
            <Text style={{ color: theme.colors.foreground, fontWeight: '700' }}>
              {mode === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={[styles.switch, { color: theme.colors.muted }]}>
            {mode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  } as const;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  brand: { fontSize: 28, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  error: { fontSize: 13, marginTop: 12 },
  button: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  switch: { fontSize: 14, textAlign: 'center', marginTop: 20 },
});
