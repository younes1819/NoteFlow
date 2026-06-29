# ADR-0001 — Expo Managed Workflow en lugar de React Native CLI (bare)

- **Estado:** Aceptada
- **Fecha:** 2026-06
- **Decisores:** Equipo NoteFlow

## Contexto

NoteFlow necesita acceso a hardware (GPS, notificaciones locales, cámara/galería) y
un proceso de build reproducible para generar binarios de tienda (APK/AAB). Hay dos
caminos en React Native:

1. **React Native CLI (bare workflow):** control total sobre los proyectos nativos
   `android/` e `ios/`, pero exige mantener configuración nativa a mano (Gradle,
   CocoaPods, firmas), un entorno con Android Studio/Xcode y más fricción en CI.
2. **Expo Managed Workflow:** los proyectos nativos se generan a partir de
   `app.json` y *config plugins*; el build se delega a EAS en la nube.

El proyecto lo desarrolla un perfil junior/solo, en Windows, sin Mac para compilar iOS.

## Decisión

Usar **Expo Managed Workflow** con **config plugins** y **EAS Build**.

- Permisos y metadatos nativos declarativos en `app.json` (ubicación, notificaciones,
  splash, package/bundle id).
- Módulos nativos vía paquetes Expo (`expo-location`, `expo-notifications`,
  `expo-image-picker`) sin tocar código Swift/Kotlin.
- Builds deterministas en la nube con EAS (`preview` → APK, `production` → AAB),
  incluyendo compilación de iOS sin necesidad de macOS local.
- Cuando hace falta una librería nativa no incluida (p. ej. `@react-native-firebase`),
  se usa un **Development Build** en lugar de Expo Go, manteniéndonos en el flujo managed.

## Consecuencias

**Positivas**
- Menos superficie de configuración nativa que mantener y romper.
- CI/CD y builds de tienda accesibles desde Windows.
- Actualizaciones de SDK coordinadas por Expo.

**Negativas / trade-offs**
- Dependencia de la nube de Expo (EAS) para compilar.
- Algunas librerías muy específicas pueden requerir un config plugin propio o
  `expo prebuild`.
- Tamaño base del binario ligeramente mayor.

## Alternativas consideradas

- **Bare workflow:** descartado por el coste de mantenimiento nativo y la ausencia de
  macOS para iOS.
- **Expo Go puro:** insuficiente, porque `@react-native-firebase` y otros módulos
  nativos no están incluidos en el cliente Expo Go.
