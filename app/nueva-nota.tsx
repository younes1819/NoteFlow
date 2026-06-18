import { ReactNode, useState } from 'react';
import {
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

import { Text } from '@/components/ui/text';
import { IDEA_COLORS } from '@/constants/ideaColors';
import { useTheme } from '@/constants/theme';
import { hapticSuccess } from '@/lib/haptics';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const screenTitle =
    type === 'checklist' ? 'Nueva lista' : type === 'idea' ? 'Nueva idea' : 'Nueva nota';

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
        await addNote(result.data.title, result.data.content);
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
        await addChecklist(result.data.title, result.data.items);
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
        await addIdea(result.data.title, result.data.tags, result.data.color);
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
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: theme.colors.muted }}>Cancelar</Text>
          </Pressable>
          <Text style={[styles.heading, { color: theme.colors.foreground }]}>
            {screenTitle.toUpperCase()}
          </Text>
          <Pressable onPress={handleSave} disabled={saving}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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

function inputStyle(theme: ReturnType<typeof useTheme>) {
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
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heading: { fontSize: 14, fontWeight: '700', letterSpacing: 1.5 },
  field: { marginBottom: 16 },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
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
});
