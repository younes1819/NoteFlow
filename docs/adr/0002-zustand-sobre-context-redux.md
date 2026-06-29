# ADR-0002 — Zustand para el estado global en lugar de Context API o Redux

- **Estado:** Aceptada
- **Fecha:** 2026-06
- **Decisores:** Equipo NoteFlow

## Contexto

La app mantiene un estado global moderado: listas de notas, checklists e ideas, flags
de carga/error y acciones asíncronas que sincronizan con la API REST. Varias pantallas
(tabs de notas, tareas, ideas, archivadas y detalle) leen y mutan ese estado.

Opciones evaluadas:

1. **Context API + useReducer:** nativo de React, sin dependencias.
2. **Redux (Toolkit):** estándar maduro, herramientas potentes.
3. **Zustand:** store mínima basada en hooks con selectores.

## Decisión

Usar **Zustand** como única store global (`store/notesStore.ts`, `store/authStore.ts`).

- API mínima: `create()` con estado + acciones asíncronas en el mismo lugar.
- **Selectores** (`useNotesStore((s) => s.notes)`) que evitan re-renders innecesarios
  sin necesidad de memorizar el `value` de un Provider.
- Acceso fuera de React (`getState`/`setState`) útil para acciones y, sobre todo, para
  **testear la lógica sin renderizar UI** (ver `__tests__/store/notesStore.test.ts`).
- Sin boilerplate de actions/reducers/dispatch.

## Consecuencias

**Positivas**
- Menos código repetitivo que Redux para un dominio de este tamaño.
- Mejor rendimiento por defecto que Context para estado que cambia con frecuencia
  (Context re-renderiza a todos los consumidores ante cualquier cambio del value).
- Tests unitarios triviales: se manipula el store directamente con `setState`.

**Negativas / trade-offs**
- Menos convenciones impuestas que Redux Toolkit (la disciplina la pone el equipo).
- Sin DevTools de time-travel tan ricas como Redux (suficiente para este alcance).

## Alternativas consideradas

- **Context API:** descartada como store principal por el riesgo de re-renders masivos
  y el coste de partir el estado en múltiples providers. Se sigue usando para temas
  puntuales (p. ej. el provider de theme de Gluestack).
- **Redux Toolkit:** potente pero excesivo para el tamaño del estado; añade boilerplate
  y peso sin beneficio claro aquí. La regla del proyecto desaconseja librerías de estado
  pesadas en v1.
