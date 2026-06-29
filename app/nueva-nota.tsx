import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, inputStyle } from '@/components/ui/Field';
import { Text } from '@/components/ui/text';
import { IDEA_COLORS } from '@/constants/ideaColors';
import { useTheme } from '@/constants/theme';
import { hapticSuccess } from '@/lib/haptics';
import { getCurrentAddress, type NoteLocation } from '@/lib/location';
import { scheduleReminder } from '@/lib/notifications';
import {
  getReminderDate,
  REMINDER_OPTIONS,
  type ReminderPreset,
} from '@/lib/reminders';
import {
  checklistSchema,
  ideaSchema,
  noteSchema,
} from '@/lib/validation';
import { useNotesStore } from '@/store/notesStore';
import type { NoteKind } from '@/types';

export default function NuevaNotaScreen() {
  const { type = 'note' } = useLocalSearchParams<{ type?: NoteKind }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addNote = useNotesStore((s) => s.addNote);
  const addChecklist = useNotesStore((s) => s.addChecklist);
  const addIdea = useNotesStore((s) => s.addIdea);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState(['']);
  const [newItem, setNewItem] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [color, setColor] = useState<string>(IDEA_COLORS[0]);
  const [reminderPreset, setReminderPreset] = useState<ReminderPreset>('none');
  const [location, setLocation] = useState<NoteLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const screenTitle =
    type === 'checklist' ? 'Nueva lista' : type === 'idea' ? 'Nueva idea' : 'Nueva nota';

  const locationPayload = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.locationName,
      }
    : undefined;

  const handleSave = async () => {
    setErrors({});
    setSaving(true);
    try {
      if (type === 'note') {
        const result = noteSchema.safeParse({ title, content });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            const key = String(issue.path[0] ?? 'form');
            fieldErrors[key] = issue.message;
          });
          setErrors(fieldErrors);
          return;
        }
        const created = await addNote(
          result.data.title,
          result.data.content,
          locationPayload
        );
        const reminderDate = getReminderDate(reminderPreset);
        if (created && reminderDate) {
          await scheduleReminder(created.id, created.title, reminderDate);
        }
      } else if (type === 'checklist') {
        const parsedItems = items.map((i) => i.trim()).filter(Boolean);
        const result = checklistSchema.safeParse({ title, items: parsedItems });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            const key = String(issue.path[0] ?? 'form');
            fieldErrors[key] = issue.message;
          });
          setErrors(fieldErrors);
          return;
        }
        await addChecklist(result.data.title, result.data.items, locationPayload);
      } else {
        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        const result = ideaSchema.safeParse({ title, tags, color });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            const key = String(issue.path[0] ?? 'form');
            fieldErrors[key] = issue.message;
          });
          setErrors(fieldErrors);
          return;
        }
        await addIdea(
          result.data.title,
          result.data.tags,
          result.data.color,
          locationPayload
        );
      }
      await hapticSuccess();
      router.back();
    } catch {
      setErrors({ form: 'No se pudo guardar. Revisa tu conexión.' });
    } finally {
      setSaving(false);
    }
  };

  const addChecklistItem = () => {
    const value = newItem.trim();
    if (!value) return;
    setItems((prev) => [...prev, value]);
    setNewItem('');
  };

  const handleLocate = async () => {
    setLocating(true);
    try {
      const address = await getCurrentAddress();
      if (address) {
        setLocation(address);
      }
    } catch {
      setErrors({ location: 'No se pudo obtener la ubicación' });
    } finally {
      setLocating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancelar y volver"
          >
            <Text style={{ color: theme.colors.muted }}>Cancelar</Text>
          </Pressable>
          <Text style={[styles.heading, { color: theme.colors.foreground }]}>
            {screenTitle.toUpperCase()}
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Guardar"
            accessibilityState={{ disabled: saving }}
          >
            <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>
              {saving ? '…' : 'Guardar'}
            </Text>
          </Pressable>
        </View>

        <Field label="Título" error={errors.title}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título"
            placeholderTextColor={theme.colors.muted}
            style={inputStyle(theme)}
          />
        </Field>

        {type === 'note' && (
          <Field label="Contenido" error={errors.content}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Escribe tu nota…"
              placeholderTextColor={theme.colors.muted}
              multiline
              style={[inputStyle(theme), styles.textArea]}
            />
          </Field>
        )}

        {type === 'checklist' && (
          <>
            {items.map((item, index) => (
              <Text
                key={`${item}-${index}`}
                style={{ color: theme.colors.foreground, marginBottom: 6 }}
              >
                • {item}
              </Text>
            ))}
            <Field label="Nuevo ítem" error={errors.items}>
              <View style={styles.row}>
                <TextInput
                  value={newItem}
                  onChangeText={setNewItem}
                  placeholder="Añadir ítem"
                  placeholderTextColor={theme.colors.muted}
                  style={[inputStyle(theme), { flex: 1 }]}
                  onSubmitEditing={addChecklistItem}
                />
                <Pressable
                  onPress={addChecklistItem}
                  accessibilityRole="button"
                  accessibilityLabel="Añadir ítem a la lista"
                  style={[styles.addItem, { borderColor: theme.colors.border }]}
                >
                  <Text style={{ color: theme.colors.foreground }}>+</Text>
                </Pressable>
              </View>
            </Field>
          </>
        )}

        {type === 'idea' && (
          <>
            <Field label="Etiquetas (separadas por coma)" error={errors.tags}>
              <TextInput
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="diseño, producto, ux"
                placeholderTextColor={theme.colors.muted}
                style={inputStyle(theme)}
              />
            </Field>
            <Field label="Color" error={errors.color}>
              <View style={styles.colors}>
                {IDEA_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: c,
                        borderColor:
                          color === c ? theme.colors.foreground : theme.colors.border,
                        borderWidth: color === c ? 2 : 1,
                      },
                    ]}
                  />
                ))}
              </View>
            </Field>
          </>
        )}

        {type === 'note' && Platform.OS !== 'web' ? (
          <Field label="Recordatorio">
            <View style={styles.reminderRow}>
              {REMINDER_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setReminderPreset(option.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: reminderPreset === option.id }}
                  accessibilityLabel={option.label}
                  style={[
                    styles.reminderChip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor:
                        reminderPreset === option.id
                          ? theme.colors.foreground
                          : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        reminderPreset === option.id
                          ? theme.colors.background
                          : theme.colors.foreground,
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>
        ) : null}

        {Platform.OS !== 'web' ? (
          <Field label="Ubicación" error={errors.location}>
            <Pressable
              onPress={() => void handleLocate()}
              disabled={locating}
              accessibilityRole="button"
              accessibilityLabel={
                location ? 'Actualizar ubicación' : 'Añadir ubicación'
              }
              accessibilityState={{ disabled: locating }}
              style={[styles.locateBtn, { borderColor: theme.colors.border }]}
            >
              {locating ? (
                <ActivityIndicator color={theme.colors.foreground} />
              ) : (
                <Text style={{ color: theme.colors.foreground, fontWeight: '700' }}>
                  {location ? 'ACTUALIZAR UBICACIÓN' : 'AÑADIR UBICACIÓN'}
                </Text>
              )}
            </Pressable>
            {location ? (
              <Text style={{ color: theme.colors.muted, marginTop: 8, fontSize: 13 }}>
                📍 {location.locationName}
              </Text>
            ) : null}
          </Field>
        ) : null}

        {errors.form ? (
          <Text style={[styles.error, { color: theme.colors.accent }]}>
            {errors.form}
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heading: { fontSize: 14, fontWeight: '700', letterSpacing: 1.5 },
  error: { fontSize: 12, marginTop: 4 },
  textArea: { minHeight: 140, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addItem: {
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 36, height: 36 },
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reminderChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  locateBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
