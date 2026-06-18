# Gestión del proyecto — NoteFlow

## Tablero Trello

**Tablero:** [NoteFlow en Trello](https://trello.com/b/7K2m8loX)

El tablero centraliza el seguimiento de las **9 funcionalidades principales de v1** definidas en [idea.md](idea.md). Cada tarjeta incluye una checklist **Subtareas técnicas** con pasos concretos de implementación.

### Columnas (flujo Kanban)

| Columna | Uso |
|---------|-----|
| **Backlog** | Funcionalidades planificadas, aún no priorizadas para el sprint actual. |
| **Todo** | Próximo trabajo: listo para empezar cuando termine lo que está en curso. |
| **In Progress** | Desarrollo activo (una o pocas tarjetas a la vez). |
| **Review** | Implementación terminada; pendiente de revisión visual, pruebas manuales o PR. |
| **Done** | Completada y verificada en el repositorio. |

### Reglas de movimiento

1. **Una tarjeta = una funcionalidad principal** (no mezclar varias features en la misma tarjeta).
2. Al empezar a codear una feature, mover su tarjeta a **In Progress**.
3. Al terminar el código y probar localmente, mover a **Review**.
4. Tras merge o verificación, mover a **Done** y marcar las subtareas completadas en la checklist.
5. Priorizar moviendo tarjetas de **Backlog → Todo** antes de iniciar nuevas.

### Estado actual

| Tarjeta | Columna | Notas |
|---------|---------|-------|
| Flujo universal (The Universal Flow) | Backlog | — |
| Tres tipos de contenido | Backlog | — |
| Captura rápida | Backlog | — |
| Filtros por tipo | Backlog | — |
| Estadísticas básicas | Backlog | — |
| Tarjetas en el feed | Backlog | — |
| Enlaces externos | Backlog | — |
| Persistencia local | Backlog | — |
| UI minimalista | Backlog | — |

*Todas las features v1 parten en **Backlog** hasta definir stack y orden de implementación.*

---

## Tarjetas y subtareas técnicas

### 1. Flujo universal (The Universal Flow)

- Definir modelo de datos Entry (id, type, createdAt, payload)
- Utilidad groupByDate para agrupar entradas por día
- Componente FlowFeed con secciones de fecha (ej. WEDNESDAY, JUNE 17)
- Orden cronológico descendente dentro de cada grupo
- Store/estado global para la lista de entradas

### 2. Tres tipos de contenido

- Tipos TypeScript: NoteEntry, TaskEntry, LinkEntry
- Note: cuerpo de texto libre
- Task: título + lista de ítems con estado done/pending
- Link: título + URL
- Validación y normalización al crear cada tipo

### 3. Captura rápida

- Botones + NOTE, + TASK, + LINK en sidebar (sección ADD)
- Botones + NOTE, + TASK, + LINK en cabecera del flujo
- Formulario/modal para crear nota
- Formulario/modal para crear tarea con ítems dinámicos
- Formulario/modal para crear enlace (URL + título opcional)
- Añadir entrada al store y persistir al guardar

### 4. Filtros por tipo

- Navegación ALL / NOTES / TASKS / LINKS en sidebar
- Contadores dinámicos por tipo (ej. ALL 8, NOTES 3)
- Estado de filtro activo en la UI
- Filtrar el feed según el filtro seleccionado
- Estilo de selección activa (fondo negro, texto acento)

### 5. Estadísticas básicas

- Calcular total de entradas (ENTRIES)
- Calcular tareas completadas vs total (TASKS DONE)
- Componente Stats en sidebar
- Barra de progreso visual para tareas
- Actualizar stats en tiempo real al mutar entradas

### 6. Tarjetas en el feed

- Componente base EntryCard con borde 1px
- NoteCard: cabecera negra NOTE + hora
- TaskCard: checklist interactiva en el cuerpo
- LinkCard: cabecera negra LINK + hora, título y URL
- Formato de hora/fecha según antigüedad (hora hoy, fecha ayer+)

### 7. Enlaces externos

- Icono de enlace externo en LinkCard
- Abrir URL en nueva pestaña (target=_blank, rel=noopener)
- Validación de URL al crear enlace
- Normalizar URL sin protocolo (añadir https://)

### 8. Persistencia local

- Adapter localStorage para leer/escribir entradas
- Hidratar estado al cargar la aplicación
- Persistir en cada create/update/delete
- Versión de schema y migración básica si cambia el modelo
- Manejo de almacenamiento lleno o JSON corrupto

### 9. UI minimalista

- Layout de dos columnas: sidebar + área principal
- Logo NOTEFLOW y tipografía monospace/sans uppercase
- Tokens CSS monocromo (blanco, negro, acento rojo/naranja)
- Bordes finos sin border-radius en botones y tarjetas
- Cabecera THE UNIVERSAL FLOW con subtítulo contextual
- Ajuste responsive básico para pantallas estrechas

---

## Automatización

El script [`scripts/setup-trello-board.mjs`](../scripts/setup-trello-board.mjs) crea el tablero, las columnas, las tarjetas y las checklists vía API de Trello.

```bash
# Variables requeridas (ver .env.example)
export TRELLO_API_KEY=...
export TRELLO_TOKEN=...

node scripts/setup-trello-board.mjs
```

**Obtener credenciales:**

1. API Key: [trello.com/power-ups/admin](https://trello.com/power-ups/admin)
2. Token: autorizar en  
   `https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=NoteFlow&key=TU_API_KEY`

---

## Orden sugerido de implementación

1. **UI minimalista** — layout y estilos base (permite desarrollar con el diseño correcto).
2. **Tres tipos de contenido** + **Persistencia local** — modelo y almacenamiento.
3. **Flujo universal** + **Tarjetas en el feed** — visualizar datos.
4. **Captura rápida** — crear entradas.
5. **Filtros por tipo** + **Estadísticas básicas** — sidebar funcional.
6. **Enlaces externos** — pulir LinkCard.

Este orden no es obligatorio; las columnas del tablero reflejan el estado real del trabajo.
