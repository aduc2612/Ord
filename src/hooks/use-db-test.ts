import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import * as Crypto from "expo-crypto";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/lib/database";
import migrations from "@/db/migrations/migrations";
import { testItems } from "@/db/schema";
import type { TestItem } from "@/db/schema";

export function useDbTest() {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const countRef = useRef(items.length);
  countRef.current = items.length;

  const loadItems = useCallback(async () => {
    try {
      const result = await db
        .select()
        .from(testItems)
        .orderBy(testItems.createdAt);
      setItems(result);
    } catch {
      Alert.alert("Error", "Failed to load items");
    }
  }, []);

  useEffect(() => {
    if (success) {
      loadItems();
    }
  }, [success, loadItems]);

  const insertItem = useCallback(async () => {
    if (!success) return;
    setLoading(true);
    try {
      const id = Crypto.randomUUID();
      const now = new Date();
      await db.insert(testItems).values({
        id,
        userId: "test-user",
        title: `Test Item ${countRef.current + 1}`,
        createdAt: now,
        updatedAt: now,
      });
      await loadItems();
    } catch {
      Alert.alert("Error", "Failed to insert item");
    } finally {
      setLoading(false);
    }
  }, [success, loadItems]);

  const deleteAll = useCallback(async () => {
    if (!success) return;
    setLoading(true);
    try {
      await db.delete(testItems);
      setItems([]);
    } catch {
      Alert.alert("Error", "Failed to delete items");
    } finally {
      setLoading(false);
    }
  }, [success]);

  return { success, error, items, loading, loadItems, insertItem, deleteAll };
}
