import { create } from 'zustand';

import { syncFirebaseSession } from '@/lib/api';
import {
  getCurrentUser,
  onAuthStateChanged,
  registerWithEmail,
  signInWithEmail,
  signOutFirebase,
  type FirebaseUser,
} from '@/lib/firebase/auth';
import { createUserProfile, getUserProfile } from '@/lib/firebase/profile';
import { isFirebaseNative } from '@/lib/firebase/platform';
import { clearToken } from '@/lib/authStorage';
import type { UserProfile } from '@/types/user';

interface AuthStore {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  init: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  initializing: true,
  loading: false,
  error: null,

  init: () => {
    if (!isFirebaseNative) {
      set({ initializing: false });
      return () => undefined;
    }

    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      set({ user: firebaseUser, error: null });

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          await syncFirebaseSession(idToken);
          const profile = await getUserProfile(firebaseUser.uid);
          set({ profile });
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : 'Error al sincronizar la sesión',
          });
        }
      } else {
        await clearToken();
        set({ profile: null });
      }

      set({ initializing: false });
    });

    return unsubscribe;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithEmail(email, password);
      const idToken = await user.getIdToken();
      await syncFirebaseSession(idToken);
      const profile = await getUserProfile(user.uid);
      set({ user, profile });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const user = await registerWithEmail(email, password, name);
      await createUserProfile(user.uid, { name, email });
      const idToken = await user.getIdToken();
      await syncFirebaseSession(idToken);
      const profile = await getUserProfile(user.uid);
      set({ user, profile });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al registrarse';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await signOutFirebase();
    await clearToken();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const user = getCurrentUser();
    if (!user) {
      set({ profile: null });
      return;
    }
    const profile = await getUserProfile(user.uid);
    set({ profile });
  },
}));
