# Configuración de IA — Cursor

NoteFlow usa **solo Cursor** como herramienta de IA durante el desarrollo. El contexto persistente del proyecto vive en el repositorio para que el agente no genere código que contradiga las decisiones de producto y arquitectura.

---

## Archivos configurados

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| `.cursorrules` | Raíz del repo | Reglas maestras: producto, stack, modelo de datos, UI, anti-patrones |
| `noteflow-core.mdc` | `.cursor/rules/` | Restricciones de producto (`alwaysApply: true`) |
| `react-typescript.mdc` | `.cursor/rules/` | Convenciones React/TS en `**/*.{ts,tsx}` |
| `styling.mdc` | `.cursor/rules/` | UI monocroma en `**/*.{css,tsx}` |

---

## Qué contienen las reglas

### Producto (no negociable)

- Un solo flujo cronológico: **The Universal Flow**.
- Tres tipos de entrada: `note`, `task`, `link`.
- Sin carpetas ni jerarquías de organización.
- Filtros como vistas sobre un único store.
- v1 con `localStorage` — sin backend ni auth.

### Stack

- React 18 + TypeScript (`strict`) + Vite.
- CSS plano (monocromo brutalista).
- Estado con context/hooks; Zustand solo si hace falta.

### Por qué web y no React Native

El wireframe y `docs/idea.md` apuntan a una **SPA web** (sidebar + feed, `localStorage`, CSS). Las reglas adaptan buenas prácticas investigadas para React Native + TypeScript (TS estricto, componentes funcionales, carpetas por feature) al stack web.

---

## Investigación aplicada

Fuentes: [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules), [Cursor Directory — React Native](https://cursor.directory/plugins/react-native), [DEV — Cursor Rules for RN](https://dev.to/olivia_craft/cursor-rules-for-react-native-production-rules-for-ai-assisted-mobile-development-118a).

**Qué funciona mejor en Cursor:**

1. Reglas **concisas** (&lt; 100 líneas por archivo) con restricciones explícitas.
2. Formato **`.mdc` modular** con `globs` / `alwaysApply` en `.cursor/rules/`.
3. **`.cursorrules`** en raíz como índice maestro del proyecto.
4. **Anti-patrones** claros (no Redux, no Next.js, no scope creep).
5. **Tipos concretos** en las reglas (discriminated unions para `Entry`).

---

## Uso en el día a día

1. Abre el proyecto desde la raíz `NoteFlow/` (donde está `.cursorrules`).
2. En Agent o Chat, referencia `@docs/idea.md` al planificar features.
3. Tras editar reglas, reinicia Cursor si no se aplican.
4. Opcional: **Memories** en Settings para preferencias personales.

---

## Mantenimiento

Al cambiar stack, modelo de datos o scope v1:

1. Actualiza `docs/idea.md` (fuente de verdad).
2. Sincroniza `.cursorrules` y `.cursor/rules/*.mdc`.

No incluyas en las reglas: API keys, tokens, ni instrucciones genéricas sin relación con NoteFlow.
