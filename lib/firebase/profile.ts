import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { isFirebaseNative } from '@/lib/firebase/platform';
import type { UserProfile } from '@/types/user';

type FirestoreModule = typeof import('@react-native-firebase/firestore').default;

function getFirestore(): FirestoreModule {
  if (!isFirebaseNative) {
    throw new Error('Firestore solo está disponible en iOS y Android');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/firestore').default as FirestoreModule;
}

function mapProfile(
  data: FirebaseFirestoreTypes.DocumentData,
  id: string
): UserProfile {
  const createdAt = data.createdAt as
    | FirebaseFirestoreTypes.Timestamp
    | undefined;

  return {
    name: typeof data.name === 'string' ? data.name : '',
    email: typeof data.email === 'string' ? data.email : '',
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
    createdAt: createdAt?.toDate(),
  };
}

export async function createUserProfile(
  userId: string,
  data: Pick<UserProfile, 'name' | 'email'>
): Promise<void> {
  const firestore = getFirestore();
  await firestore()
    .collection('users')
    .doc(userId)
    .set({
      name: data.name,
      email: data.email,
      bio: '',
      avatarUrl: null,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const doc = await getFirestore()().collection('users').doc(userId).get();
  if (!doc.exists) return null;
  return mapProfile(doc.data() ?? {}, doc.id);
}

export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<void> {
  await getFirestore()().collection('users').doc(userId).update({ avatarUrl });
}

export function subscribeToUserProfile(
  userId: string,
  onChange: (profile: UserProfile | null) => void
): () => void {
  return getFirestore()()
    .collection('users')
    .doc(userId)
    .onSnapshot((doc) => {
      if (!doc.exists) {
        onChange(null);
        return;
      }
      onChange(mapProfile(doc.data() ?? {}, doc.id));
    });
}
