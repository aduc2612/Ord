import type { TaskTag } from "@/db/schema";
import { taskTags } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { eq, and, asc } from "drizzle-orm";

export function useDbTaskTags() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [taskTagList, setTaskTagList] = useState<TaskTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const clearState = useCallback(() => {
    setTaskTagList([]);
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
      .from(taskTags)
      .where(eq(taskTags.userId, userId))
      .orderBy(asc(taskTags.createdAt));

    db.watch(
      query,
      {
        onResult: (results) => {
          setTaskTagList(results as TaskTag[]);
          setReady(true);
          setError(null);
        },
        onError: (err) => {
          console.error("useDbTaskTags watch error:", err);
          setError(err);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );

    return () => abortController.abort();
  }, [userId, clearState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addTagToTask = useCallback(
    async (taskId: string, tagId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        const id = Crypto.randomUUID();
        const now = Date.now();
        await db.insert(taskTags).values({
          id,
          userId,
          taskId,
          tagId,
          createdAt: now,
          updatedAt: now,
        });
      } catch (e) {
        console.error("addTagToTask error:", e);
        Toast.show({ type: "error", text1: "Failed to add tag to task" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const removeTagFromTask = useCallback(
    async (taskId: string, tagId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .delete(taskTags)
          .where(
            and(
              eq(taskTags.taskId, taskId),
              eq(taskTags.tagId, tagId),
              eq(taskTags.userId, userId),
            ),
          );
      } catch (e) {
        console.error("removeTagFromTask error:", e);
        Toast.show({ type: "error", text1: "Failed to remove tag from task" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteAllTaskTags = useCallback(async () => {
    if (!userId) {
      Toast.show({ type: "error", text1: "No user ID available" });
      return;
    }
    setLoading(true);
    try {
      await db.delete(taskTags).where(eq(taskTags.userId, userId));
    } catch (e) {
      console.error("deleteAllTaskTags error:", e);
      Toast.show({ type: "error", text1: "Failed to delete all task tags" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    taskTagList,
    loading,
    ready,
    error,
    addTagToTask,
    removeTagFromTask,
    deleteAllTaskTags,
  };
}
