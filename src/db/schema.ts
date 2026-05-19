import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const testItems = sqliteTable("test_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type TestItem = typeof testItems.$inferSelect;
