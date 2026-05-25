-- Migration: 0004_add_created_at_columns
-- Created: 2026-05-25
-- Description: Add created_at column to all tables for stable creation-order sorting

ALTER TABLE tasks ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tags ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE task_tags ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE notes ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;

-- Set created_at to updated_at as a best guess for existing rows
UPDATE tasks SET created_at = updated_at;
UPDATE projects SET created_at = updated_at;
UPDATE tags SET created_at = updated_at;
UPDATE task_tags SET created_at = updated_at;
UPDATE notes SET created_at = updated_at;

CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);
CREATE INDEX IF NOT EXISTS idx_task_tags_created_at ON task_tags(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
