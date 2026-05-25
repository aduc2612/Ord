-- Migration: 0002_remove_inbox_add_notes
-- Created: 2026-05-24
-- Description: Remove 'inbox' from tasks category CHECK, create notes table

-- Recreate tasks table with updated CHECK constraint (remove 'inbox')
PRAGMA foreign_keys = off;

CREATE TABLE tasks_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('next_action', 'waiting_for', 'someday')),
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  due_date INTEGER,
  completed_at INTEGER,
  updated_at INTEGER NOT NULL
);

INSERT INTO tasks_new SELECT * FROM tasks;

DROP TABLE tasks;

ALTER TABLE tasks_new RENAME TO tasks;

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

PRAGMA foreign_keys = on;

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
