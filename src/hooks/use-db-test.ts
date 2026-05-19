import type { TestItem } from "@/db/schema";
import { testItems } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export function useDbTest() {
  const [items, setItems] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [watchError, setWatchError] = useState<Error | string | null>(null);
  const countRef = useRef(items.length);
  countRef.current = items.length;

  // Manual re-fetch kept as a safety net for the Refresh button.
  // The reactive watch above handles automatic updates.
  const loadItems = useCallback(async () => {
    try {
      const result = await db.select().from(testItems).orderBy(testItems.createdAt);
      setItems(result as TestItem[]);
    } catch {
      Alert.alert("Error", "Failed to load items");
    }
  }, []);

  // Reactive watch: auto-fetches data on mount and updates whenever
  // the underlying table changes (e.g. after PowerSync syncs data on sign-in).
  useEffect(() => {
    const abortController = new AbortController();
    const query = db.select().from(testItems).orderBy(testItems.createdAt);
    db.watch(
      query,
      {
        onResult: (results) => {
          setItems(results as TestItem[]);
          setReady(true);
          setWatchError(null);
        },
        onError: (error) => {
          console.error("useDbTest watch error:", error);
          setWatchError(error);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );
    return () => abortController.abort();
  }, []);

  const insertItem = useCallback(async () => {
    setLoading(true);
    try {
      const id = Crypto.randomUUID();
      const now = Date.now();
      await db.insert(testItems).values({
        id,
        userId: "9ccc15d6-db9c-4b64-9ec2-599e2841a061",
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
  }, [loadItems]);

  const deleteAll = useCallback(async () => {
    setLoading(true);
    try {
      await db.delete(testItems);
      setItems([]);
    } catch {
      Alert.alert("Error", "Failed to delete items");
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, ready, error: watchError, loadItems, insertItem, deleteAll };
}
