import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
});

export const checklistSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  items: z
    .array(z.string().min(1, 'El ítem no puede estar vacío'))
    .min(1, 'Añade al menos un ítem'),
});

export const ideaSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  tags: z.array(z.string()).default([]),
  color: z.string().min(1, 'Selecciona un color'),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
export type ChecklistFormValues = z.infer<typeof checklistSchema>;
export type IdeaFormValues = z.infer<typeof ideaSchema>;
