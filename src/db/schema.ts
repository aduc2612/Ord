import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // inbox | next_action | waiting_for | someday
  projectId: text("project_id"),
  dueDate: integer("due_date"),
  completedAt: integer("completed_at"),
  updatedAt: integer("updated_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const taskTags = sqliteTable(
  "task_tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    taskId: text("task_id").notNull().references(() => tasks.id),
    tagId: text("tag_id").notNull().references(() => tags.id),
    updatedAt: integer("updated_at").notNull(),
  },
);

export type Task = typeof tasks.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type TaskTag = typeof taskTags.$inferSelect;
