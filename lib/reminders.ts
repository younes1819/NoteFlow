export type ReminderPreset = 'none' | '1h' | 'tomorrow' | '3d';

export const REMINDER_OPTIONS: { id: ReminderPreset; label: string }[] = [
  { id: 'none', label: 'Sin recordatorio' },
  { id: '1h', label: 'En 1 hora' },
  { id: 'tomorrow', label: 'Mañana 9:00' },
  { id: '3d', label: 'En 3 días' },
];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function getReminderDate(preset: ReminderPreset): Date | null {
  const now = new Date();

  switch (preset) {
    case '1h':
      return new Date(now.getTime() + HOUR_MS);
    case 'tomorrow': {
      const date = new Date(now);
      date.setDate(date.getDate() + 1);
      date.setHours(9, 0, 0, 0);
      return date;
    }
    case '3d':
      return new Date(now.getTime() + 3 * DAY_MS);
    case 'none':
    default:
      return null;
  }
}
