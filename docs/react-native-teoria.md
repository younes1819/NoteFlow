# React Native — Fundamentos teóricos (NoteFlow)

Documento de referencia para el stack móvil de NoteFlow: Expo + React Native + TypeScript.

---

## React Native vs app nativa

Una **app nativa** (Swift/Kotlin) habla directamente con las APIs del sistema operativo: cada pantalla, botón y animación se construye con componentes del SDK de iOS o Android.

**React Native** no renderiza HTML dentro de un WebView. Cuando escribes `<View>` o `<Text>`, React Native usa un **puente** (bridge) para pedir al sistema operativo que cree **vistas nativas reales** (`UIView`, `android.view.View`, etc.). El usuario percibe rendimiento y gestos nativos porque lo que ve **es** nativo; solo la lógica está en JavaScript/TypeScript.

| Aspecto | App nativa pura | React Native |
|---------|-----------------|--------------|
| UI | SDK nativo | Componentes RN → vistas nativas |
| Lógica | Swift / Kotlin | JavaScript / TypeScript |
| Código compartido iOS+Android | No | Sí |
| Acceso a APIs del SO | Directo | Módulos nativos / Expo modules |

---

## Dos hilos: JavaScript y UI nativo

1. **Hilo de JavaScript** — Código React, Zustand, validación Zod, filtrado de búsqueda.
2. **Hilo de UI nativo** — Renderizado, gestos, animaciones Reanimated.

Si el JS thread se bloquea, la interfaz se congela. Por eso NoteFlow usa **FlashList** para listas largas y animaciones en el hilo de UI con Reanimated.

---

## Metro bundler

**Metro** empaqueta el código desde `expo-router/entry`, resuelve imports (`@/store/notesStore`), transforma TSX con Babel (NativeWind incluido) y sirve el bundle al dispositivo con Fast Refresh.

Configuración: `metro.config.js` + `babel.config.js`.

---

## Expo Go vs Development Build

### Expo Go

- Escaneas un QR y la app corre sin compilar.
- Solo incluye módulos nativos preinstalados en la app Expo Go.
- Ideal para prototipos y aprendizaje.

### Development Build

- Binario propio generado con **EAS Build**.
- Incluye los módulos nativos que tu `package.json` declare.
- **Estándar en proyectos reales** cuando necesitas cámara, push, biometría u otros módulos custom.

**Por qué Expo Go no basta en producción:** no puedes controlar qué código nativo está disponible. En NoteFlow v1 (AsyncStorage, Haptics, FlashList) Expo Go puede bastar; al escalar a push o módulos propios, se requiere Development Build.

---

## Sistemas de diseño

### Gluestack UI vs React Native Paper

| Criterio | Gluestack UI v3 | React Native Paper |
|----------|-----------------|-------------------|
| Filosofía | Utility-first (NativeWind), personalizable | Material Design 3 |
| Identidad visual | Adaptable a diseños únicos | Look Material/Android |
| Theming | CSS variables + tokens | Theme object MD3 |

### Elección: **Gluestack UI v3**

NoteFlow usa estética **brutalista monocroma** (bordes 1px, sin radius, uppercase). React Native Paper impondría elevaciones, ripple y esquinas redondeadas Material.

**Configuración:**

- `GluestackUIProvider` en `app/_layout.tsx`
- Tokens en `constants/theme.ts` mapeados a `components/ui/gluestack-ui-provider/config.ts`
- Modo claro/oscuro con `useColorScheme` de React Native

---

## Navegación con Expo Router

Expo Router define rutas por **sistema de archivos**.

### Tabs vs Stack vs Modal

| Patrón | Uso en NoteFlow | Por qué |
|--------|-----------------|---------|
| **Tabs** (`app/(tabs)/`) | Navegación principal: Notas, Tareas, Ideas, Archivo | Acceso directo a las 3 secciones de contenido |
| **Stack** (`notas/_layout.tsx`, etc.) | Lista → detalle `[id].tsx` | Flujo jerárquico con botón atrás |
| **Modal** (`app/nueva-nota.tsx`) | Crear contenido | Acción puntual sin abandonar el contexto de la pestaña |

```
app/
  _layout.tsx          # Stack raíz + modal
  (tabs)/
    _layout.tsx        # Tabs
    notas/             # Stack: index + [id]
    checklists/
    ideas/
    archivadas/
  nueva-nota.tsx       # Modal de creación
```

---

## Modelado de datos con TypeScript

Definido en `types/index.ts`:

```typescript
type AnyNote = Note | ChecklistNote | IdeaNote;
```

**Type guards** en `lib/typeGuards.ts`:

```typescript
'items' in note   // → ChecklistNote
'tags' in note    // → IdeaNote (con color)
'content' in note // → Note
```

Los type guards permiten que funciones que aceptan `AnyNote` narrow el tipo en tiempo de ejecución sin `as` inseguro.

---

## Gestión de estado

| Enfoque | Cuándo usarlo | Limitación |
|---------|---------------|------------|
| **useState** | Estado local de un componente (input, modal abierto) | No compartido entre pantallas |
| **Context API** | Tema, auth simple | Re-renders en todos los consumidores al cambiar |
| **Zustand** | Estado global de notas, checklists, ideas | Estándar elegido en NoteFlow |

NoteFlow usa **Zustand** en `store/notesStore.ts` porque:

- No requiere providers anidados.
- Los componentes se suscriben solo a los slices que usan (`s => s.notes`).
- Integra `persist` con AsyncStorage sin boilerplate.

---

## Rendimiento en listas

**FlatList** recicla celdas, pero con listas largas y scroll rápido puede mostrar pantallas en blanco.

**FlashList** (`@shopify/flash-list` v2) recicla de forma más agresiva. En v2 el tamaño se estima automáticamente durante el layout; en v1 se usaba `estimatedItemSize` — en NoteFlow las tarjetas tienen altura ~120–130px para un scroll fluido.

Tarjetas envueltas en `Animated.View` con `FadeInDown` / `FadeOutLeft` (Reanimated).

---

## Formularios y validación (Zod)

Schemas en `lib/validation.ts`. El modal `nueva-nota.tsx` adapta campos según `?type=note|checklist|idea`.

- **Note:** título + contenido
- **Checklist:** título + ítems dinámicos
- **Idea:** título + etiquetas + selector de color

Errores de Zod se muestran bajo cada campo. `KeyboardAvoidingView` evita que el teclado tape inputs (`padding` en iOS, `height` en Android).

---

## Persistencia con AsyncStorage

AsyncStorage guarda JSON en el dispositivo. Limitaciones: sin cifrado, límite de tamaño, datos solo locales.

```typescript
persist(store, {
  name: 'noteflow-storage',
  storage: createJSONStorage(() => AsyncStorage),
});
```

### Rehidratación

Al abrir la app, Zustand lee AsyncStorage y restaura el estado. Mientras tanto, `HydrationGate` muestra un `ActivityIndicator`. Las fechas (`Date`) se reviven en `onFinishHydration` porque JSON serializa fechas como strings.

**Verificación:** crear notas → cerrar app completamente → reabrir → datos persisten.

---

## UX y feedback táctil

- `Haptics.impactAsync(Light)` al **eliminar**
- `Haptics.notificationAsync(Success)` al **completar checklist** o **guardar**

Pantallas de detalle: `Alert.alert` antes de eliminar. Estados vacíos en cada pestaña. Búsqueda global por pestaña en tiempo real.

### Extensiones implementadas

- Pestaña **Archivadas** con restauración
- Búsqueda en cabecera de cada lista
- Animaciones de entrada/salida en tarjetas

---

## Estructura del proyecto

```
app/              # Rutas Expo Router
components/       # UI, tarjetas, Gluestack
constants/        # theme.ts, ideaColors.ts
store/            # notesStore.ts (Zustand + persist)
types/            # interfaces y union types
lib/              # validation, typeGuards, haptics
docs/             # documentación
```

---

## Comandos

```bash
npm start
npm run android
npm run ios
```

---

*NoteFlow — Expo SDK 56 + Expo Router + Gluestack UI + Zustand + FlashList.*
