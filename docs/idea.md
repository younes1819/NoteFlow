# NoteFlow — Definición de la idea

## Qué problema resuelve NoteFlow

La mayoría de las apps de productividad obligan al usuario a decidir **dónde** guardar algo antes de poder capturarlo: elegir carpeta, proyecto, etiqueta o espacio de trabajo. Esa fricción hace que muchas ideas, tareas y enlaces se pierdan o queden dispersos entre notas, gestores de tareas y marcadores del navegador.

**NoteFlow** resuelve esto ofreciendo un único flujo cronológico — **The Universal Flow** — donde conviven notas rápidas, listas de tareas y enlaces web/media. El usuario no organiza en carpetas rígidas: simplemente captura y consulta todo en orden temporal. Los filtros por tipo (ALL, NOTES, TASKS, LINKS) permiten enfocarse cuando hace falta, sin romper la simplicidad del flujo único.

En resumen: **captura sin fricción, consulta sin buscar en cinco sitios distintos**.

---

## Usuario objetivo

**Perfil:** Personas que trabajan con información digital a diario y valoran la velocidad y la claridad por encima de la complejidad organizativa.

Ejemplos concretos:

- **Desarrolladores y diseñadores** que guardan snippets, URLs de documentación y tareas pequeñas a lo largo del día.
- **Profesionales del conocimiento** (escritores, investigadores, consultores) que anotan ideas, enlaces de referencia y pendientes sin querer montar un sistema de carpetas.
- **Cualquier usuario** que usa notas + lista de tareas + marcadores por separado y siente que pierde tiempo decidiendo dónde va cada cosa.

### Cómo usaría la app en su día a día

1. **Por la mañana:** Abre NoteFlow y revisa el flujo universal para ver qué quedó pendiente ayer (tareas sin marcar, enlaces guardados, notas sueltas).
2. **Durante el día:** Captura al instante con los botones + NOTE, + TASK o + LINK — sin elegir carpeta ni proyecto.
3. **En reuniones o lectura:** Añade notas rápidas o enlaces a artículos y herramientas; las tareas pequeñas van como checklist en el mismo flujo.
4. **Al cerrar el día:** Filtra por TASKS, marca lo completado y mira STATS (tareas hechas, total de entradas) en la barra lateral.
5. **Cuando necesita contexto:** Filtra por LINKS o NOTES sin salir de la misma interfaz; todo sigue ordenado cronológicamente dentro de cada vista.

---

## Funcionalidades principales (v1)

Estas son las capacidades mínimas para una primera versión usable y alineada con el diseño:

| Área | Funcionalidad |
|------|----------------|
| **Flujo universal** | Stream cronológico único con todas las entradas (notas, tareas, enlaces), agrupadas por fecha. |
| **Tres tipos de contenido** | Quick Notes (texto libre), Task Checklists (ítems marcables), Web/Media Links (título + URL). |
| **Captura rápida** | Botones + NOTE, + TASK y + LINK en sidebar y cabecera del flujo. |
| **Filtros** | Navegación ALL / NOTES / TASKS / LINKS con contadores por tipo. |
| **Estadísticas básicas** | TASKS DONE (progreso, p. ej. 4/7) y total de ENTRIES en sidebar. |
| **Tarjetas en el feed** | Diseño distintivo por tipo (p. ej. cabecera negra con etiqueta LINK/NOTE/TASK y hora). |
| **Enlaces externos** | Abrir links en nueva pestaña desde la tarjeta. |
| **Persistencia local** | Los datos se guardan en el dispositivo (sin obligar cuenta ni servidor en v1). |
| **UI minimalista** | Estética monocroma, tipografía clara, bordes finos — coherente con el wireframe de referencia. |

---

## Funcionalidades opcionales (futuras)

Ideas que podrían añadirse después sin cambiar el núcleo del producto:

- **Búsqueda** en todo el flujo (texto en notas, títulos de enlaces, ítems de tareas).
- **Etiquetas o menciones** ligeras (sin volver a carpetas rígidas).
- **Sincronización en la nube** y acceso multi-dispositivo con cuenta opcional.
- **Atajos de teclado** para captura y navegación entre filtros.
- **Arrastrar y reordenar** o fijar entradas importantes al inicio.
- **Recordatorios / fechas de vencimiento** en tareas.
- **Vista previa de enlaces** (og:image, descripción) al pegar una URL.
- **Exportar / importar** (JSON, Markdown) para backup y portabilidad.
- **Tema oscuro** alternativo manteniendo el minimalismo.
- **PWA / app de escritorio** para uso offline y acceso desde el dock o barra de tareas.
- **Compartir** una nota o lista de tareas mediante enlace (si hay backend).
- **Integraciones** (p. ej. guardar desde el navegador con extensión, o webhook para captura rápida).

---

## Principios de diseño del producto

1. **Un solo flujo** — No multiplicar vistas ni jerarquías de carpetas.
2. **Captura en segundos** — Menos clics que abrir tres apps distintas.
3. **Rendimiento** — Interfaz ligera y respuesta inmediata al añadir o filtrar.
4. **Solo tres tipos** — Límites claros evitan la deriva hacia “otra app que lo hace todo mal”.
5. **Cronología como verdad** — El orden temporal es la organización por defecto; los filtros son una capa opcional.

---

*Documento inicial — fase de definición antes de implementación.*
