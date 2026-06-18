-- Consulta principal: notas con items y tags agregados en JSON
-- LEFT JOIN: devuelve todas las notas aunque no tengan items ni tags (NULL en columnas derechas)
-- json_agg: agrupa filas relacionadas en un array JSON
-- FILTER (WHERE ... IS NOT NULL): excluye filas NULL del agregado (notas sin items/tags → [] en lugar de [null])
-- GROUP BY n.id: una fila por nota tras los JOINs que multiplican filas
SELECT
  n.*,
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
WHERE n.user_id = $1
GROUP BY n.id
ORDER BY n.created_at DESC;
