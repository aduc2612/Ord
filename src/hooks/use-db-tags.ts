import type { Tag } from "@/db/schema";
import { tags } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { eq, and } from "drizzle-orm";

export function useDbTags() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [tagList, setTagList] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const tagCountRef = useRef(tagList.length);
  tagCountRef.current = tagList.length;

  const clearState = useCallback(() => {
    setTagList([]);
    setError(null);
    setReady(false);
  }, []);

  const loadTags = useCallback(async () => {
    if (!userId) {
      clearState();
      return;
    }
    try {
      const result = await db
        .select()
        .from(tags)
        .where(eq(tags.userId, userId))
        .orderBy(tags.updatedAt);
      setTagList(result as Tag[]);
      setReady(true);
      setError(null);
    } catch (e) {
      console.error("loadTags error:", e);
      Alert.alert("Error", "Failed to load tags");
    }
  }, [userId, clearState]);

  useEffect(() => {
    if (!userId) {
      clearState();
      return;
    }
    const abortController = new AbortController();

    const query = db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(tags.updatedAt);

    db.watch(
      query,
      {
        onResult: (results) => {
          setTagList(results as Tag[]);
          setReady(true);
          setError(null);
        },
        onError: (err) => {
          console.error("useDbTags watch error:", err);
          setError(err);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );

    return () => abortController.abort();
  }, [userId, clearState]);

  const insertTag = useCallback(async () => {
    if (!userId) {
      Alert.alert("Error", "No user ID available");
      return;
    }
    setLoading(true);
    try {
      const id = Crypto.randomUUID();
      const now = Date.now();
      await db.insert(tags).values({
        id,
        userId,
        title: `Tag ${tagCountRef.current + 1}`,
        updatedAt: now,
      });
      await loadTags();
    } catch (e) {
      console.error("insertTag error:", e);
      Alert.alert("Error", "Failed to insert tag");
    } finally {
      setLoading(false);
    }
  }, [userId, loadTags]);

  const updateTag = useCallback(
    async (tagId: string, updates: Partial<Pick<Tag, "title">>) => {
      if (!userId) {
        Alert.alert("Error", "No user ID available");
        return;
      }
      setLoading(true);
      try {
        await db
          .update(tags)
          .set({ ...updates, updatedAt: Date.now() })
          .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
        await loadTags();
      } catch (e) {
        console.error("updateTag error:", e);
        Alert.alert("Error", "Failed to update tag");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTags],
  );

  const deleteTag = useCallback(
    async (tagId: string) => {
      if (!userId) return;
      setLoading(true);
      try {
        await db
          .delete(tags)
          .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
        await loadTags();
      } catch (e) {
        console.error("deleteTag error:", e);
        Alert.alert("Error", "Failed to delete tag");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTags],
  );

  const deleteAllTags = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(tags).where(eq(tags.userId, userId));
      await loadTags();
    } catch (e) {
      console.error("deleteAllTags error:", e);
      Alert.alert("Error", "Failed to delete all tags");
    } finally {
      setLoading(false);
    }
  }, [userId, loadTags]);

  return {
    tagList,
    loading,
    ready,
    error,
    loadTags,
    insertTag,
    updateTag,
    deleteTag,
    deleteAllTags,
  };
}
