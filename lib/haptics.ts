import * as Haptics from 'expo-haptics';

export async function hapticDelete() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function hapticSuccess() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
