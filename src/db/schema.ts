import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const testItems = sqliteTable("test_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type TestItem = typeof testItems.$inferSelect;
