-- Supabase SQL schema for Ord app
-- All tables reference auth.users(id) for user_id

-- Drop old test_items table if it exists
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS test_items;
DROP TABLE IF EXISTS notes;

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at BIGINT NOT NULL
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('next_action', 'waiting_for', 'someday')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  due_date BIGINT,
  completed_at BIGINT,
  updated_at BIGINT NOT NULL
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Task-Tags junction table
CREATE TABLE task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  updated_at BIGINT NOT NULL,
  UNIQUE (user_id, task_id, tag_id)
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX idx_task_tags_user_id ON task_tags(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- Task-Tags policies (direct user_id + referenced row ownership)
CREATE POLICY "Users can view own task_tags" ON task_tags
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM tags WHERE id = tag_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own task_tags" ON task_tags
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM tags WHERE id = tag_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own task_tags" ON task_tags
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM tags WHERE id = tag_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own task_tags" ON task_tags
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM tags WHERE id = tag_id AND user_id = auth.uid())
  );

-- Notes policies
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);
