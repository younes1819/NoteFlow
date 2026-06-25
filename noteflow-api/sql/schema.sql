-- Usuarios (autenticación)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  firebase_uid VARCHAR(128) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notas unificadas (note, checklist, idea)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'checklist', 'idea')),
  color VARCHAR(7),
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_checklist_items_note_id ON checklist_items(note_id);
CREATE INDEX idx_note_tags_note_id ON note_tags(note_id);
