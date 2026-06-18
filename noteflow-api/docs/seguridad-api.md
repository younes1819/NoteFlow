# Seguridad en la API NoteFlow

## SQL Injection

La inyección SQL ocurre cuando la entrada del usuario se **concatena directamente** en una consulta. Un atacante puede manipular la consulta para leer, modificar o borrar datos:

```javascript
// ❌ VULNERABLE: concatenación directa
const title = req.body.title; // vector: "'; DROP TABLE notes;--"
const query = "SELECT * FROM notes WHERE title = '" + title + "'";
// Resultado ejecutado:
// SELECT * FROM notes WHERE title = ''; DROP TABLE notes;--'
```

### Consultas parametrizadas

La estructura SQL y los valores viajan **por separado**. PostgreSQL precompila la consulta y trata los parámetros estrictamente como datos, nunca como código:

```javascript
// ✅ SEGURO: parámetros posicionales ($1, $2...)
const query = 'SELECT * FROM notes WHERE title = $1';
await db.query(query, [req.body.title]);
```

En NoteFlow, el módulo `lib/db.ts` envuelve el driver de Neon para usar siempre este patrón:

```typescript
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await sql(text, params);
  return result as T[];
}
```

**Nunca** uses template strings de JavaScript para interpolar valores en SQL:

```typescript
// ❌ NUNCA hagas esto
await query(`SELECT * FROM notes WHERE id = '${userInput}'`);

// ✅ Siempre así
await query('SELECT * FROM notes WHERE id = $1', [userInput]);
```

## Variables de entorno

Los secretos (connection string, JWT secret) **no deben aparecer en el código fuente** ni commitearse a Git.

| Variable | Uso | Dónde |
|----------|-----|-------|
| `DATABASE_URL` | Connection string de Neon | `.env.local` (local), Vercel (producción) |
| `JWT_SECRET` | Firma de tokens de autenticación | `.env.local`, Vercel |

### Por qué el connection string nunca va en la app móvil

1. El binario de la app es **descompilable**.
2. Un connection string expuesto da acceso **directo** a PostgreSQL (lectura, escritura, borrado de tablas).
3. La API actúa como **guardián**: valida JWT, filtra por `user_id`, sanitiza con Zod.

### Buenas prácticas

- `.env.local` está en `.gitignore`; `.env.example` solo tiene claves vacías como plantilla.
- En Vercel, configura las variables en el panel de Environment Variables.
- Rota `JWT_SECRET` si sospechas compromiso.
- Usa contraseñas hasheadas con bcrypt (cost factor 10), nunca en texto plano.

## Errores al cliente

Los handlers devuelven mensajes genéricos en errores 500:

```typescript
catch {
  return NextResponse.json({ error: 'Error interno' }, { status: 500 });
}
```

El detalle del error de PostgreSQL se queda en los logs del servidor (Vercel Functions logs), no en la respuesta HTTP.

## Autenticación

- Contraseñas: `bcrypt.hash()` al registrar, `bcrypt.compare()` al login.
- Tokens: JWT firmado con `JWT_SECRET`, expiración 7 días.
- Endpoints de notas: verifican `Authorization: Bearer <token>` antes de cualquier query.
- Cada query filtra por `user_id` del token — un usuario no puede leer notas de otro aunque adivine el UUID.
