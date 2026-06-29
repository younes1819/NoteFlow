# Fase 10 — Testing automatizado y build de producción

## Resumen

La app incorpora una suite de tests automatizados (unitarios e integración), mejoras de accesibilidad, integración continua con GitHub Actions y perfiles de build de producción con EAS.

| Área | Herramienta | Responsabilidad |
|------|-------------|-----------------|
| Test runner | Jest + `jest-expo` | Ejecutar y transformar los tests |
| Render de componentes | `@testing-library/react-native` | Renderizar e interrogar la UI |
| CI | GitHub Actions | Ejecutar la suite en cada push/PR |
| Build | EAS Build | Generar APK (preview) y AAB (producción) |

## La pirámide de testing

- **Unitarios** (muchos, rápidos): lógica pura sin UI — `lib/format`, `lib/validation`, `lib/typeGuards` y los métodos del store `notesStore`.
- **Integración** (medios): un componente que reacciona al estado — `NotasScreen` con el store vacío y poblado.
- **E2E** (pocos, lentos): fuera del alcance de esta fase.

Un *mock* simula dependencias externas (API, notificaciones, hardware) para que el test sea determinista. Se mockea lo que no se quiere probar.

## Configuración de la suite

Dependencias de desarrollo:

```bash
npm install --save-dev jest@^29 jest-expo @react-native/jest-preset \
  @testing-library/react-native@^13 @testing-library/jest-native \
  react-test-renderer@19.2.3 --legacy-peer-deps
```

> Notas de compatibilidad con este proyecto (Expo SDK 56 / React 19 / RN 0.85):
> - `jest` se fija a la **v29** porque `jest-expo@56` aún no soporta jest 30.
> - `@testing-library/react-native` se fija a la **v13** (la v14 usa un render asíncrono incompatible con esta versión de `jest-expo`).
> - `react-test-renderer` se fija a `19.2.3` para igualar la versión de React.
> - Se requiere `--legacy-peer-deps` por los rangos estrictos de peers de React 19.

Archivos de configuración:

- `jest.config.js` — preset `jest-expo`, `moduleNameMapper` para el alias `@/`, `transformIgnorePatterns` ampliado para transpilar `@gluestack-ui`, `nativewind`, `@shopify`, Reanimated y Gesture Handler.
- `jest.setup.js` — mocks globales de módulos nativos: Reanimated, Gesture Handler, `@shopify/flash-list`, `@expo/vector-icons`, `expo-haptics` y `react-native-safe-area-context`.
- `babel.config.js` — desactiva el plugin `nativewind/babel` cuando `api.env('test')` para evitar la inyección de `_ReactNativeCSSInterop` en las factorías de `jest.mock`.

Scripts (`package.json`):

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Tests incluidos

| Archivo | Tipo | Qué verifica |
|---------|------|--------------|
| `__tests__/lib/format.test.ts` | Unitario | `formatDate` y `truncate` |
| `__tests__/lib/validation.test.ts` | Unitario | Esquemas Zod de nota, lista e idea |
| `__tests__/lib/typeGuards.test.ts` | Unitario | Discriminación de tipos de nota |
| `__tests__/store/notesStore.test.ts` | Unitario | `addNote`, `deleteNote`, `fetchNotes`, `toggleChecklistItem` (API mockeada) |
| `__tests__/screens/NotasScreen.test.tsx` | Integración | Estado vacío/poblado, notas archivadas ocultas y etiquetas de accesibilidad |

Ejecutar:

```bash
npm test
npm run test:coverage
```

## Accesibilidad

VoiceOver (iOS) y TalkBack (Android) narran el contenido. Propiedades aplicadas:

| Elemento | Props añadidas |
|----------|----------------|
| Tarjetas (`AnimatedCard`) | `accessibilityRole="button"`, `accessibilityLabel` descriptivo (p. ej. "Nota: Reunión"), `accessibilityHint` sobre el swipe |
| Ítems de checklist | `accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`, `accessibilityLabel` |
| Botón de añadir y búsqueda | `accessibilityRole="button"`, `accessibilityLabel` por sección |
| Chips de recordatorio | `accessibilityRole="radio"`, `accessibilityState={{ selected }}` |
| Botones de detalle (volver/archivar/eliminar) | `accessibilityRole="button"`, `accessibilityLabel` |
| Botón guardar / ubicación | `accessibilityRole="button"`, `accessibilityState={{ disabled }}` |
| Fondo rojo de "ELIMINAR" del swipe | Oculto a lectores (`accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`) por ser decorativo |

## CI/CD con GitHub Actions

`.github/workflows/test.yml` ejecuta la suite en cada `push` a `main` y en cada Pull Request:

1. Checkout del repositorio.
2. Node 20 con caché de npm.
3. `npm ci --legacy-peer-deps`.
4. `npm test -- --coverage --ci`.

## Build de producción con EAS

Metadatos en `app.json`: icono, plugin `expo-splash-screen` (imagen + fondo claro/oscuro), `android.package` y `ios.bundleIdentifier` (`com.noteflow.app`).

Perfiles en `eas.json`:

| Perfil | Salida Android | Uso |
|--------|----------------|-----|
| `development` | dev client | Desarrollo con módulos nativos |
| `preview` | **APK** | Instalación directa / compartir sin tienda |
| `production` | **AAB** (`app-bundle`) | Subida a Google Play (con `autoIncrement`) |

Comandos:

```bash
# APK instalable para probar en un dispositivo físico
eas build --platform android --profile preview

# AAB de producción para la Play Store
eas build --platform android --profile production
```

Instala el APK del perfil `preview` en un Android físico y comprueba que todo funciona como en el simulador.

## Notas

- Los tests corren en Node y mockean los módulos nativos; no requieren simulador.
- Quedan errores de tipos preexistentes en `lib/firebase/*` (Fase 8) ajenos a esta fase; no afectan a la suite de tests.
- EAS Build requiere una cuenta Expo y `eas login`; los binarios se generan en la nube de Expo.
