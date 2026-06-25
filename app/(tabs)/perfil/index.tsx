import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function PerfilScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const logout = useAuthStore((s) => s.logout);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
      }}
    >
      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        PERFIL
      </Text>

      <View style={styles.section}>
        <AvatarPicker
          avatarUrl={profile?.avatarUrl}
          onUploaded={() => void refreshProfile()}
        />
      </View>

      <View style={[styles.card, { borderColor: theme.colors.border }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>NOMBRE</Text>
        <Text style={{ color: theme.colors.foreground, fontSize: 16 }}>
          {profile?.name ?? user?.displayName ?? '—'}
        </Text>

        <Text style={[styles.label, { color: theme.colors.muted, marginTop: 16 }]}>
          EMAIL
        </Text>
        <Text style={{ color: theme.colors.foreground, fontSize: 16 }}>
          {profile?.email ?? user?.email ?? '—'}
        </Text>

        {profile?.bio ? (
          <>
            <Text style={[styles.label, { color: theme.colors.muted, marginTop: 16 }]}>
              BIO
            </Text>
            <Text style={{ color: theme.colors.foreground, fontSize: 15 }}>
              {profile.bio}
            </Text>
          </>
        ) : null}
      </View>

      <Pressable
        onPress={async () => {
          await logout();
          router.replace('/auth');
        }}
        style={[styles.logout, { borderColor: theme.colors.border }]}
      >
        <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>
          CERRAR SESIÓN
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 32,
  },
  section: { marginBottom: 32 },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  logout: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
