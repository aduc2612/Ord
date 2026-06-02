import type { Tag } from "@/db/schema";
import { tags } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { eq, and, asc } from "drizzle-orm";

export function useDbTags() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [tagList, setTagList] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const tagCountRef = useRef(tagList.length);
  useEffect(() => {
    tagCountRef.current = tagList.length;
  }, [tagList.length]);

  const clearState = useCallback(() => {
    setTagList([]);
    setError(null);
    setReady(false);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
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
      .orderBy(asc(tags.createdAt));

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
  /* eslint-enable react-hooks/set-state-in-effect */

  const insertTag = useCallback(
    async (title?: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        const id = Crypto.randomUUID();
        const now = Date.now();
        await db.insert(tags).values({
          id,
          userId,
          title: title ?? `Tag ${tagCountRef.current + 1}`,
          createdAt: now,
          updatedAt: now,
        });
      } catch (e) {
        console.error("insertTag error:", e);
        Toast.show({ type: "error", text1: "Failed to insert tag" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const updateTag = useCallback(
    async (tagId: string, updates: Partial<Pick<Tag, "title">>) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .update(tags)
          .set({ ...updates, updatedAt: Date.now() })
          .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
      } catch (e) {
        console.error("updateTag error:", e);
        Toast.show({ type: "error", text1: "Failed to update tag" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteTag = useCallback(
    async (tagId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .delete(tags)
          .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
      } catch (e) {
        console.error("deleteTag error:", e);
        Toast.show({ type: "error", text1: "Failed to delete tag" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteAllTags = useCallback(async () => {
    if (!userId) {
      Toast.show({ type: "error", text1: "No user ID available" });
      return;
    }
    setLoading(true);
    try {
      await db.delete(tags).where(eq(tags.userId, userId));
    } catch (e) {
      console.error("deleteAllTags error:", e);
      Toast.show({ type: "error", text1: "Failed to delete all tags" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    tagList,
    loading,
    ready,
    error,
    insertTag,
    updateTag,
    deleteTag,
    deleteAllTags,
  };
}
