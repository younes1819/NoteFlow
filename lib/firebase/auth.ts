import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { isFirebaseNative } from '@/lib/firebase/platform';

type AuthModule = typeof import('@react-native-firebase/auth').default;

function getAuth(): AuthModule {
  if (!isFirebaseNative) {
    throw new Error('Firebase Auth solo está disponible en iOS y Android');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/auth').default as AuthModule;
}

export type FirebaseUser = FirebaseAuthTypes.User;

export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return getAuth().onAuthStateChanged(callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return getAuth().currentUser;
}

export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getIdToken();
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const credential = await getAuth().signInWithEmailAndPassword(email, password);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<FirebaseUser> {
  const credential = await getAuth().createUserWithEmailAndPassword(email, password);
  await credential.user.updateProfile({ displayName: name });
  return credential.user;
}

export async function signOutFirebase(): Promise<void> {
  await getAuth().signOut();
}
