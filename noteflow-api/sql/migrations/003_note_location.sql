-- Fase 9: geolocalización en notas
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
