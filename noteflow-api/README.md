# NoteFlow API

API REST para NoteFlow: notas, checklists e ideas sincronizadas en la nube con PostgreSQL (Neon) y autenticación JWT.

## Stack

- **Next.js 16** (App Router, Route Handlers)
- **PostgreSQL** en [Neon](https://neon.tech)
- **@neondatabase/serverless** — driver serverless para Vercel
- **Zod** — validación de entrada
- **bcryptjs** + **jsonwebtoken** — autenticación

## Setup local

### 1. Clonar e instalar

```bash
cd noteflow-api
npm install
```

### 2. Base de datos en Neon

1. Regístrate en [neon.tech](https://neon.tech) y crea el proyecto `noteflow-db`.
2. Copia el connection string (formato `postgresql://user:pass@host/db?sslmode=require`).
3. En la consola SQL de Neon, ejecuta el contenido de `sql/schema.sql`.

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=un-secreto-largo-y-aleatorio
```

### 4. Arrancar

```bash
npm run dev
```

La API queda en `http://localhost:3000/api`.

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com).
2. Root directory: `noteflow-api` (si el monorepo incluye la app móvil).
3. Añade `DATABASE_URL` y `JWT_SECRET` en **Settings → Environment Variables**.
4. Deploy. Verifica `GET https://tu-app.vercel.app/api/notes` con un token válido.

## Endpoints

Todas las rutas de notas requieren header `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| `POST` | `/api/auth/register` | `{ "email": string, "password": string (min 6) }` | `201` `{ token, user: { id, email } }` |
| `POST` | `/api/auth/login` | `{ "email": string, "password": string }` | `200` `{ token, user: { id, email } }` |

### Notas

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| `GET` | `/api/notes` | — | `200` `ApiNote[]` con items/tags agregados |
| `POST` | `/api/notes` | Ver abajo | `201` `ApiNote` |
| `GET` | `/api/notes/:id` | — | `200` `ApiNote` o `404` |
| `PATCH` | `/api/notes/:id` | `{ title?, content?, color?, archived? }` | `200` `ApiNote` |
| `DELETE` | `/api/notes/:id` | — | `204` sin body |

**Body POST `/api/notes`:**

```json
{
  "title": "Mi nota",
  "type": "note | checklist | idea",
  "content": "opcional, para type=note",
  "color": "#FF5733, opcional, para type=idea",
  "items": [{ "text": "ítem 1" }],
  "tags": ["diseño", "ux"]
}
```

### Checklist items

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| `GET` | `/api/notes/:id/checklist-items` | — | `200` `{ id, text, isCompleted }[]` |
| `POST` | `/api/notes/:id/checklist-items` | `{ "text": string }` | `201` item |
| `PATCH` | `/api/checklist-items/:itemId` | `{ "isCompleted": boolean }` | `200` item |
| `DELETE` | `/api/checklist-items/:itemId` | — | `204` |

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Connection string de Neon |
| `JWT_SECRET` | Sí | Secreto para firmar tokens JWT |

## Documentación

- [`docs/backend-teoria.md`](docs/backend-teoria.md) — arquitectura, REST, SQL, JOINs, ER
- [`docs/seguridad-api.md`](docs/seguridad-api.md) — SQL injection, env vars, JWT
- [`sql/schema.sql`](sql/schema.sql) — DDL de tablas
- [`sql/queries.sql`](sql/queries.sql) — consulta principal con LEFT JOIN

## Estructura

```
noteflow-api/
├── app/api/
│   ├── auth/register/route.ts
│   ├── auth/login/route.ts
│   ├── notes/route.ts
│   ├── notes/[id]/route.ts
│   ├── notes/[id]/checklist-items/route.ts
│   └── checklist-items/[itemId]/route.ts
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── notes.ts
├── sql/
│   ├── schema.sql
│   └── queries.sql
└── docs/
```
