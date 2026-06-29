# Guión de la demo técnica (Loom — máx. 5 min)

> Graba con [Loom](https://loom.com) (plan gratuito: 5 min). Comparte pantalla del
> emulador/dispositivo + cámara. **Restricción:** la demo debe ser exclusivamente sobre
> NoteFlow, la app construida en estas fases. Al terminar, pega el enlace público en el
> README (sección *Demo en vivo*).

## Antes de grabar (checklist)

- [ ] Emulador o dispositivo con un **Development Build** instalado y datos de ejemplo.
- [ ] Backend (`noteflow-api`) corriendo o desplegado en Vercel y accesible.
- [ ] Diagrama abierto en una pestaña: `docs/arquitectura/diagrama.excalidraw` (Excalidraw).
- [ ] `npm run lint`, `npm run typecheck` y `npm test` en verde (por si los muestras).
- [ ] Silencia notificaciones del sistema; cierra apps irrelevantes.

## Guión (5 minutos)

### 0:00–0:30 · Contexto
- Quién eres y qué es NoteFlow en una frase: *"app móvil para capturar notas, tareas e
  ideas en un único flujo cronológico, sin carpetas"*.
- Qué problema resuelve: la fricción de decidir **dónde** guardar cada cosa.

### 0:30–2:00 · Demo del producto
- Crear una **nota** y una **tarea** (checklist) desde el botón +.
- Mostrar un flujo nativo: programar un **recordatorio** (notificación local).
- Añadir **ubicación** a una nota (GPS) y verla en la tarjeta.
- **Swipe-to-delete** sobre una tarjeta y sobre un ítem de checklist.
- (Si aplica) cambiar el **avatar** con la cámara/galería.

### 2:00–3:30 · Arquitectura
- Mostrar el diagrama de Excalidraw y recorrer los actores: App → Firebase (identidad),
  App → API (JWT) → PostgreSQL (notas), App → S3 (imágenes).
- Defender 1–2 decisiones de los ADRs:
  - **Expo Managed + EAS** (ADR-0001): velocidad sin perder builds de tienda.
  - **PostgreSQL + S3, no todo Firebase** (ADR-0003): modelo relacional notas↔ítems↔tags.

### 3:30–4:30 · Un reto técnico concreto
- Explicar la **subida de imagen a S3 con presigned URL**:
  1. La app pide la URL firmada al backend (con el ID token de Firebase).
  2. El backend valida y firma; la app sube el binario **directo a S3** (no pasa por el server).
  3. Se guarda solo la `publicUrl` en Firestore.
- Por qué: escalable, seguro (sin credenciales AWS en el cliente) y barato.

### 4:30–5:00 · Cierre
- Calidad: tests (unitarios + integración), CI en GitHub Actions, 0 lint / 0 type errors.
- Enlace al repo y a la Release con el APK.

## Tras grabar
- [ ] Copia el enlace público de Loom.
- [ ] Pégalo en `README.md` → *Demo en vivo* → "Vídeo demo técnica".
- [ ] (Opcional) Graba un GIF corto y enlázalo bajo el título del README.
