import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { promptOpenSettings } from '@/lib/permissions';

const REMINDER_KEY = 'noteflow_reminder_map';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function readReminderMap(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(REMINDER_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function writeReminderMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(map));
}

export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleReminder(
  noteId: string,
  title: string,
  date: Date
): Promise<string | null> {
  if (date.getTime() <= Date.now()) {
    return null;
  }

  const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    if (!canAskAgain) {
      await promptOpenSettings(
        'Permisos de notificación',
        'Activa las notificaciones en Ajustes para programar recordatorios.'
      );
    }
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de NoteFlow',
      body: title,
      data: { noteId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  const map = await readReminderMap();
  map[noteId] = notificationId;
  await writeReminderMap(map);

  return notificationId;
}

export async function cancelReminder(noteId: string): Promise<void> {
  const map = await readReminderMap();
  const notificationId = map[noteId];
  if (!notificationId) return;

  await Notifications.cancelScheduledNotificationAsync(notificationId);
  delete map[noteId];
  await writeReminderMap(map);
}
