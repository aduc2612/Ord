-- Migration: 0003_add_notes_updated_at
-- Created: 2026-05-24
-- Description: Add updated_at column to notes table for PowerSync compatibility

ALTER TABLE notes ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
