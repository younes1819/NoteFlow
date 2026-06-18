/**
 * Creates the NoteFlow Trello board with columns, feature cards, and checklists.
 *
 * Required env vars:
 *   TRELLO_API_KEY  — https://trello.com/power-ups/admin
 *   TRELLO_TOKEN    — authorize at:
 *     https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=NoteFlow&key=YOUR_KEY
 */

const API_KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

const BOARD_NAME = "NoteFlow";
const COLUMNS = ["Backlog", "Todo", "In Progress", "Review", "Done"];

const FEATURES = [
  {
    name: "Flujo universal (The Universal Flow)",
    column: "Backlog",
    subtasks: [
      "Definir modelo de datos Entry (id, type, createdAt, payload)",
      "Utilidad groupByDate para agrupar entradas por día",
      "Componente FlowFeed con secciones de fecha (ej. WEDNESDAY, JUNE 17)",
      "Orden cronológico descendente dentro de cada grupo",
      "Store/estado global para la lista de entradas",
    ],
  },
  {
    name: "Tres tipos de contenido",
    column: "Backlog",
    subtasks: [
      "Tipos TypeScript: NoteEntry, TaskEntry, LinkEntry",
      "Note: cuerpo de texto libre",
      "Task: título + lista de ítems con estado done/pending",
      "Link: título + URL",
      "Validación y normalización al crear cada tipo",
    ],
  },
  {
    name: "Captura rápida",
    column: "Backlog",
    subtasks: [
      "Botones + NOTE, + TASK, + LINK en sidebar (sección ADD)",
      "Botones + NOTE, + TASK, + LINK en cabecera del flujo",
      "Formulario/modal para crear nota",
      "Formulario/modal para crear tarea con ítems dinámicos",
      "Formulario/modal para crear enlace (URL + título opcional)",
      "Añadir entrada al store y persistir al guardar",
    ],
  },
  {
    name: "Filtros por tipo",
    column: "Backlog",
    subtasks: [
      "Navegación ALL / NOTES / TASKS / LINKS en sidebar",
      "Contadores dinámicos por tipo (ej. ALL 8, NOTES 3)",
      "Estado de filtro activo en la UI",
      "Filtrar el feed según el filtro seleccionado",
      "Estilo de selección activa (fondo negro, texto acento)",
    ],
  },
  {
    name: "Estadísticas básicas",
    column: "Backlog",
    subtasks: [
      "Calcular total de entradas (ENTRIES)",
      "Calcular tareas completadas vs total (TASKS DONE)",
      "Componente Stats en sidebar",
      "Barra de progreso visual para tareas",
      "Actualizar stats en tiempo real al mutar entradas",
    ],
  },
  {
    name: "Tarjetas en el feed",
    column: "Backlog",
    subtasks: [
      "Componente base EntryCard con borde 1px",
      "NoteCard: cabecera negra NOTE + hora",
      "TaskCard: checklist interactiva en el cuerpo",
      "LinkCard: cabecera negra LINK + hora, título y URL",
      "Formato de hora/fecha según antigüedad (hora hoy, fecha ayer+)",
    ],
  },
  {
    name: "Enlaces externos",
    column: "Backlog",
    subtasks: [
      "Icono de enlace externo en LinkCard",
      "Abrir URL en nueva pestaña (target=_blank, rel=noopener)",
      "Validación de URL al crear enlace",
      "Normalizar URL sin protocolo (añadir https://)",
    ],
  },
  {
    name: "Persistencia local",
    column: "Backlog",
    subtasks: [
      "Adapter localStorage para leer/escribir entradas",
      "Hidratar estado al cargar la aplicación",
      "Persistir en cada create/update/delete",
      "Versión de schema y migración básica si cambia el modelo",
      "Manejo de almacenamiento lleno o JSON corrupto",
    ],
  },
  {
    name: "UI minimalista",
    column: "Backlog",
    subtasks: [
      "Layout de dos columnas: sidebar + área principal",
      "Logo NOTEFLOW y tipografía monospace/sans uppercase",
      "Tokens CSS monocromo (blanco, negro, acento rojo/naranja)",
      "Bordes finos sin border-radius en botones y tarjetas",
      "Cabecera THE UNIVERSAL FLOW con subtítulo contextual",
      "Ajuste responsive básico para pantallas estrechas",
    ],
  },
];

async function trello(path, { method = "GET", body } = {}) {
  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("token", TOKEN);

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trello API ${method} ${path} → ${res.status}: ${text}`);
  }

  return res.json();
}

async function findExistingBoard() {
  const boards = await trello("/members/me/boards?filter=open&fields=name,url,shortUrl");
  return boards.find((b) => b.name === BOARD_NAME) ?? null;
}

async function createBoard() {
  const existing = await findExistingBoard();
  if (existing) {
    console.log(`Board "${BOARD_NAME}" already exists: ${existing.shortUrl}`);
    return existing;
  }

  const board = await trello("/boards", {
    method: "POST",
    body: {
      name: BOARD_NAME,
      desc: "Tablero de desarrollo de NoteFlow — flujo universal de productividad.",
      defaultLists: false,
    },
  });

  console.log(`Created board: ${board.shortUrl}`);
  return board;
}

async function ensureLists(boardId) {
  const existing = await trello(`/boards/${boardId}/lists?filter=open&fields=name`);
  const byName = Object.fromEntries(existing.map((l) => [l.name, l]));

  const lists = {};
  for (const name of COLUMNS) {
    if (byName[name]) {
      lists[name] = byName[name];
    } else {
      lists[name] = await trello("/lists", {
        method: "POST",
        body: { name, idBoard: boardId },
      });
    }
  }

  return lists;
}

async function createCardWithChecklist(listId, feature) {
  const card = await trello("/cards", {
    method: "POST",
    body: {
      name: feature.name,
      idList: listId,
      desc: `Funcionalidad principal v1 — ver docs/idea.md`,
    },
  });

  const checklist = await trello(`/cards/${card.id}/checklists`, {
    method: "POST",
    body: { name: "Subtareas técnicas" },
  });

  for (const item of feature.subtasks) {
    await trello(`/checklists/${checklist.id}/checkItems`, {
      method: "POST",
      body: { name: item },
    });
  }

  return card;
}

async function main() {
  if (!API_KEY || !TOKEN) {
    console.error(
      "Missing TRELLO_API_KEY or TRELLO_TOKEN.\n" +
        "Get your key at https://trello.com/power-ups/admin\n" +
        "Then authorize: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=NoteFlow&key=YOUR_KEY"
    );
    process.exit(1);
  }

  const board = await createBoard();
  const lists = await ensureLists(board.id);

  const existingCards = await trello(
    `/boards/${board.id}/cards?fields=name,idList`
  );
  const existingNames = new Set(existingCards.map((c) => c.name));

  for (const feature of FEATURES) {
    if (existingNames.has(feature.name)) {
      console.log(`Card already exists: ${feature.name}`);
      continue;
    }

    const listId = lists[feature.column].id;
    const card = await createCardWithChecklist(listId, feature);
    console.log(`Created card: ${card.name}`);
  }

  const url = board.shortUrl || board.url;
  console.log(`\nBOARD_URL=${url}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
