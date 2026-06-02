import type { Task } from "@/db/schema";
import { tasks } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { eq, and, asc } from "drizzle-orm";

type Category = "next_action" | "waiting_for" | "someday";

export function useDbTasks() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const taskCountRef = useRef(taskList.length);
  useEffect(() => {
    taskCountRef.current = taskList.length;
  }, [taskList.length]);

  const clearState = useCallback(() => {
    setTaskList([]);
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
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(asc(tasks.createdAt));

    db.watch(
      query,
      {
        onResult: (results) => {
          setTaskList(results as Task[]);
          setReady(true);
          setError(null);
        },
        onError: (err) => {
          console.error("useDbTasks watch error:", err);
          setError(err);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );

    return () => abortController.abort();
  }, [userId, clearState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const insertTask = useCallback(
    async (params?: {
      category?: Category;
      title?: string;
      description?: string;
      projectId?: string | null;
      dueDate?: number | null;
    }) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        const id = Crypto.randomUUID();
        const now = Date.now();
        await db.insert(tasks).values({
          id,
          userId,
          title: params?.title ?? `Task ${taskCountRef.current + 1}`,
          description: params?.description ?? null,
          category: params?.category ?? "next_action",
          projectId: params?.projectId ?? null,
          dueDate: params?.dueDate ?? null,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
        });
        return id;
      } catch (e) {
        console.error("insertTask error:", e);
        Toast.show({ type: "error", text1: "Failed to insert task" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<
        Pick<
          Task,
          "title" | "description" | "category" | "projectId" | "dueDate"
        >
      >,
    ) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .update(tasks)
          .set({ ...updates, updatedAt: Date.now() })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
      } catch (e) {
        console.error("updateTask error:", e);
        Toast.show({ type: "error", text1: "Failed to update task" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .update(tasks)
          .set({
            completedAt: Date.now(),
            updatedAt: Date.now(),
          })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
      } catch (e) {
        console.error("completeTask error:", e);
        Toast.show({ type: "error", text1: "Failed to complete task" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .delete(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
      } catch (e) {
        console.error("deleteTask error:", e);
        Toast.show({ type: "error", text1: "Failed to delete task" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteAllTasks = useCallback(async () => {
    if (!userId) {
      Toast.show({ type: "error", text1: "No user ID available" });
      return;
    }
    setLoading(true);
    try {
      await db.delete(tasks).where(eq(tasks.userId, userId));
    } catch (e) {
      console.error("deleteAllTasks error:", e);
      Toast.show({ type: "error", text1: "Failed to delete all tasks" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    taskList,
    loading,
    ready,
    error,
    insertTask,
    updateTask,
    completeTask,
    deleteTask,
    deleteAllTasks,
  };
}
