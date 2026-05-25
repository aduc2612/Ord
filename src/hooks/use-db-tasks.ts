import type { Task } from "@/db/schema";
import { tasks } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
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
  taskCountRef.current = taskList.length;

  const clearState = useCallback(() => {
    setTaskList([]);
    setError(null);
    setReady(false);
  }, []);

  const loadTasks = useCallback(async () => {
    if (!userId) {
      clearState();
      return;
    }
    try {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(asc(tasks.createdAt));
      setTaskList(result as Task[]);
      setReady(true);
      setError(null);
    } catch (e) {
      console.error("loadTasks error:", e);
      Alert.alert("Error", "Failed to load tasks");
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

  const insertTask = useCallback(
    async (category?: Category) => {
      if (!userId) {
        Alert.alert("Error", "No user ID available");
        return;
      }
      setLoading(true);
      try {
        const id = Crypto.randomUUID();
        const now = Date.now();
        await db.insert(tasks).values({
          id,
          userId,
          title: `Task ${taskCountRef.current + 1}`,
          description: `Description for task ${taskCountRef.current + 1}`,
          category: category ?? "next_action",
          projectId: null,
          dueDate: null,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
        });
        await loadTasks();
      } catch (e) {
        console.error("insertTask error:", e);
        Alert.alert("Error", "Failed to insert task");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTasks],
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<
        Pick<Task, "title" | "description" | "category" | "projectId" | "dueDate">
      >,
    ) => {
      if (!userId) {
        Alert.alert("Error", "No user ID available");
        return;
      }
      setLoading(true);
      try {
        await db
          .update(tasks)
          .set({ ...updates, updatedAt: Date.now() })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
        await loadTasks();
      } catch (e) {
        console.error("updateTask error:", e);
        Alert.alert("Error", "Failed to update task");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTasks],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId) return;
      setLoading(true);
      try {
        await db
          .update(tasks)
          .set({
            completedAt: Date.now(),
            updatedAt: Date.now(),
          })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
        await loadTasks();
      } catch (e) {
        console.error("completeTask error:", e);
        Alert.alert("Error", "Failed to complete task");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTasks],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!userId) return;
      setLoading(true);
      try {
        await db
          .delete(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
        await loadTasks();
      } catch (e) {
        console.error("deleteTask error:", e);
        Alert.alert("Error", "Failed to delete task");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTasks],
  );

  const deleteAllTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(tasks).where(eq(tasks.userId, userId));
      await loadTasks();
    } catch (e) {
      console.error("deleteAllTasks error:", e);
      Alert.alert("Error", "Failed to delete all tasks");
    } finally {
      setLoading(false);
    }
  }, [userId, loadTasks]);

  return {
    taskList,
    loading,
    ready,
    error,
    loadTasks,
    insertTask,
    updateTask,
    completeTask,
    deleteTask,
    deleteAllTasks,
  };
}
