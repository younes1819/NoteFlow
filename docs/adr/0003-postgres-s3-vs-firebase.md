# ADR-0003 — PostgreSQL + AWS S3 para datos y archivos, Firebase solo para identidad

- **Estado:** Aceptada
- **Fecha:** 2026-06
- **Decisores:** Equipo NoteFlow

## Contexto

NoteFlow necesita: (a) autenticación de usuarios, (b) persistencia de notas con
relaciones (una nota tiene ítems de checklist y etiquetas) y consultas filtradas por
usuario, y (c) almacenamiento de imágenes (avatares).

La tentación habitual es ponerlo **todo en Firebase** (Auth + Firestore + Storage) por
rapidez. Pero el modelo de datos de NoteFlow es **relacional** (notas ↔ ítems ↔ tags)
y se beneficia de integridad referencial, joins y SQL.

## Decisión

Separar responsabilidades por la herramienta más adecuada:

| Necesidad | Tecnología | Motivo |
|-----------|------------|--------|
| Identidad / sesión | **Firebase Auth** | Registro/login y gestión de sesión resueltos y seguros |
| Perfil de usuario | **Firestore** | Documento simple `users/{uid}` que cambia poco |
| Notas y relaciones | **PostgreSQL (Neon)** | Modelo relacional, `JOIN`, `ON DELETE CASCADE`, índices |
| Archivos (avatar) | **AWS S3** | Almacenamiento de blobs barato; subida directa con presigned URLs |

El backend Next.js verifica el **ID token de Firebase**, emite un **JWT** propio y es el
único que habla con PostgreSQL y firma las URLs de S3. La app nunca recibe credenciales
de AWS; solo una URL firmada temporal para subir el binario directamente.

## Consecuencias

**Positivas**
- Integridad referencial real: borrar una nota elimina sus ítems y tags (cascada).
- Consultas eficientes y expresivas con SQL e índices (`idx_notes_user_id`, etc.).
- Costes de almacenamiento de imágenes bajos y subida que no pasa por el servidor.
- Cada pieza es sustituible sin reescribir el resto (acoplamiento bajo).

**Negativas / trade-offs**
- Más piezas que operar (Firebase + Neon + S3 + backend) que un único Firebase.
- Hay que mantener la correspondencia `firebase_uid` ↔ fila `users` en PostgreSQL.
- El backend añade un salto de red frente a ir directo a una BaaS.

## Alternativas consideradas

- **Todo en Firebase (Firestore + Storage):** descartado porque modelar relaciones
  notas/ítems/tags en un store de documentos lleva a desnormalización, datos duplicados
  y consultas más frágiles; además acopla el dominio a un proveedor.
- **PostgreSQL también para imágenes (bytea):** descartado; las bases relacionales no son
  el lugar para blobs grandes (coste, backups, rendimiento).
