# NoteFlow API — Teoría del backend

## Arquitectura cliente-servidor

Una app móvil **nunca** debe conectarse directamente a PostgreSQL. Si el connection string estuviera en el binario, cualquiera que descompile la app tendría acceso total a la base de datos.

El patrón correcto separa responsabilidades en tres capas:

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     SQL       ┌──────────────┐
│  App móvil  │ ◄────────────────► │  API (Next) │ ◄───────────► │  PostgreSQL  │
│  (cliente)  │   JSON + JWT       │  (servidor) │  parametrizado│  (Neon)      │
└─────────────┘                    └─────────────┘               └──────────────┘
```

- **Cliente:** captura datos, muestra UI, guarda el token JWT en el keychain (`expo-secure-store`).
- **API:** valida permisos, sanitiza entrada, ejecuta SQL seguro, devuelve JSON.
- **Base de datos:** persiste datos con integridad referencial (ACID).

## ¿Qué es una API REST?

REST (Representational State Transfer) expone recursos como URLs y usa métodos HTTP estándar:

| Método | Operación | Ejemplo |
|--------|-----------|---------|
| `GET` | Leer | `GET /api/notes` → lista de notas |
| `POST` | Crear | `POST /api/notes` → nueva nota |
| `PATCH` | Modificar parcialmente | `PATCH /api/notes/:id` → archivar |
| `DELETE` | Eliminar | `DELETE /api/notes/:id` → borrar |

### Códigos de estado HTTP

| Código | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| `200` | OK | Lectura o actualización exitosa |
| `201` | Created | Recurso creado (POST) |
| `204` | No Content | DELETE exitoso (sin body) |
| `400` | Bad Request | Validación fallida (Zod) |
| `401` | Unauthorized | Token ausente o inválido |
| `404` | Not Found | Recurso no existe |
| `500` | Internal Server Error | Error del servidor (mensaje genérico) |

**Regla:** nunca devolver el error real de PostgreSQL al cliente. Un atacante podría explotar esa información.

## Bases de datos relacionales

Los datos se organizan en **tablas** (filas y columnas). Cada tabla representa una entidad del dominio.

### ACID

| Propiedad | Significado |
|-----------|-------------|
| **Atomicidad** | Una transacción completa o no ocurre |
| **Consistencia** | Las reglas (CHECK, FK) se respetan siempre |
| **Aislamiento** | Transacciones concurrentes no se interfieren |
| **Durabilidad** | Los datos confirmados sobreviven a fallos |

Sin atomicidad, podrías crear una nota sin sus checklist items, dejando la BD inconsistente.

### Primary Key (PK)

Identificador único. En apps móviles se prefiere **UUID** sobre enteros autoincrementales: el cliente puede generar el ID offline y sincronizar después.

### Foreign Key (FK)

Columna que referencia la PK de otra tabla. `ON DELETE CASCADE` borra automáticamente los hijos (items, tags) al eliminar la nota padre.

### DDL vs DML

- **DDL** (Data Definition Language): `CREATE`, `ALTER`, `DROP` — define estructura.
- **DML** (Data Manipulation Language): `SELECT`, `INSERT`, `UPDATE`, `DELETE` — manipula datos.

## Diagrama entidad-relación

```
┌─────────────────────────────────────────────────────────────────┐
│                           users                                  │
├──────────────┬──────────────────────────────────────────────────┤
│ id (PK)      │ UUID                                             │
│ email        │ VARCHAR(255) UNIQUE                              │
│ password_hash│ VARCHAR(255)                                     │
│ created_at   │ TIMESTAMPTZ                                      │
└──────┬───────┴──────────────────────────────────────────────────┘
       │ 1
       │ tiene
       │ N
┌──────▼──────────────────────────────────────────────────────────┐
│                           notes                                  │
├──────────────┬──────────────────────────────────────────────────┤
│ id (PK)      │ UUID                                             │
│ user_id (FK) │ → users.id ON DELETE CASCADE                     │
│ title        │ VARCHAR(255) NOT NULL                            │
│ content      │ TEXT                                             │
│ type         │ 'note' | 'checklist' | 'idea'                    │
│ color        │ VARCHAR(7)                                       │
│ archived     │ BOOLEAN DEFAULT FALSE                            │
│ created_at   │ TIMESTAMPTZ                                      │
│ updated_at   │ TIMESTAMPTZ                                      │
└──────┬───────────────────────────────┬──────────────────────────┘
       │ 1                             │ 1
       │ contiene                      │ tiene
       │ N                             │ N
┌──────▼──────────────────┐   ┌────────▼─────────────────────────┐
│    checklist_items       │   │         note_tags                  │
├──────────────┬───────────┤   ├──────────────┬───────────────────┤
│ id (PK)      │ UUID      │   │ id (PK)      │ UUID              │
│ note_id (FK) │ → notes   │   │ note_id (FK) │ → notes           │
│ text         │ VARCHAR   │   │ tag          │ VARCHAR(100)      │
│ is_completed │ BOOLEAN   │   └──────────────┴───────────────────┘
└──────────────┴───────────┘
```

## INNER JOIN vs LEFT JOIN

### INNER JOIN

Devuelve solo filas donde **hay coincidencia en ambas tablas**.

```sql
-- Solo notas que SÍ tienen al menos un tag
SELECT n.title, nt.tag
FROM notes n
INNER JOIN note_tags nt ON n.id = nt.note_id;
```

**Cuándo usarlo:** cuando quieres excluir registros sin relación (ej. reporte de notas etiquetadas).

### LEFT JOIN

Devuelve **todas** las filas de la tabla izquierda; si no hay coincidencia en la derecha, las columnas derechas son `NULL`.

```sql
-- Todas las notas, con o sin items
SELECT n.*, ci.text
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id;
```

**Cuándo usarlo:** listar notas con sus items opcionales — una nota tipo `checklist` puede tener 0 items recién creada.

La consulta principal en `sql/queries.sql` usa `LEFT JOIN` + `json_agg` para devolver cada nota con sus items y tags en un solo JSON, sin perder notas vacías.

## Autenticación JWT

1. `POST /api/auth/register` — crea usuario, devuelve token.
2. `POST /api/auth/login` — verifica credenciales, devuelve token firmado.
3. El cliente envía `Authorization: Bearer <token>` en cada petición.
4. La API verifica la firma y extrae `userId` para filtrar datos por usuario.

## Pruebas con cliente HTTP

Ejemplo de flujo completo (reemplaza `TOKEN` y `BASE`):

```http
### Registro
POST {{BASE}}/api/auth/register
Content-Type: application/json

{ "email": "test@noteflow.app", "password": "secreto123" }

### Login
POST {{BASE}}/api/auth/login
Content-Type: application/json

{ "email": "test@noteflow.app", "password": "secreto123" }

### Listar notas (requiere token)
GET {{BASE}}/api/notes
Authorization: Bearer {{TOKEN}}

### Crear nota
POST {{BASE}}/api/notes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{ "title": "Mi primera nota", "type": "note", "content": "Hola mundo" }

### Respuesta esperada (201)
{
  "id": "uuid...",
  "title": "Mi primera nota",
  "type": "note",
  "content": "Hola mundo",
  "archived": false,
  "createdAt": "2026-06-18T...",
  "updatedAt": "2026-06-18T..."
}
```
