import type { Task, Project, Tag, TaskTag } from "@/db/schema";
import { tasks, projects, tags, taskTags } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { eq, and } from "drizzle-orm";

type Category = "inbox" | "next_action" | "waiting_for" | "someday";

export function useDbTest() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  // --- State ---
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [taskTagList, setTaskTagList] = useState<TaskTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const taskCountRef = useRef(taskList.length);
  taskCountRef.current = taskList.length;
  const projectCountRef = useRef(projectList.length);
  projectCountRef.current = projectList.length;
  const tagCountRef = useRef(tagList.length);
  tagCountRef.current = tagList.length;

  // --- Load all data ---
  const loadAll = useCallback(async () => {
    if (!userId) return;
    try {
      const [t, p, tg, tt] = await Promise.all([
        db.select().from(tasks).orderBy(tasks.updatedAt),
        db.select().from(projects).orderBy(projects.updatedAt),
        db.select().from(tags).orderBy(tags.updatedAt),
        db.select().from(taskTags).orderBy(taskTags.updatedAt),
      ]);
      setTaskList(t as Task[]);
      setProjectList(p as Project[]);
      setTagList(tg as Tag[]);
      setTaskTagList(tt as TaskTag[]);
    } catch (e) {
      console.error("loadAll error:", e);
      Alert.alert("Error", "Failed to load data");
    }
  }, [userId]);

  // --- Reactive watches ---
  useEffect(() => {
    if (!userId) return;
    const abortController = new AbortController();

    const taskQuery = db.select().from(tasks).orderBy(tasks.updatedAt);
    db.watch(
      taskQuery,
      {
        onResult: (results) => {
          setTaskList(results as Task[]);
          setReady(true);
          setError(null);
        },
        onError: (err) => {
          console.error("useDbTest tasks watch error:", err);
          setError(err);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );

    const projectQuery = db.select().from(projects).orderBy(projects.updatedAt);
    db.watch(
      projectQuery,
      {
        onResult: (results) => {
          setProjectList(results as Project[]);
        },
        onError: (err) => {
          console.error("useDbTest projects watch error:", err);
        },
      },
      { signal: abortController.signal },
    );

    const tagQuery = db.select().from(tags).orderBy(tags.updatedAt);
    db.watch(
      tagQuery,
      {
        onResult: (results) => {
          setTagList(results as Tag[]);
        },
        onError: (err) => {
          console.error("useDbTest tags watch error:", err);
        },
      },
      { signal: abortController.signal },
    );

    const taskTagQuery = db.select().from(taskTags).orderBy(taskTags.updatedAt);
    db.watch(
      taskTagQuery,
      {
        onResult: (results) => {
          setTaskTagList(results as TaskTag[]);
        },
        onError: (err) => {
          console.error("useDbTest task_tags watch error:", err);
        },
      },
      { signal: abortController.signal },
    );

    return () => abortController.abort();
  }, [userId]);

  // --- Task operations ---
  const insertTask = useCallback(async (category?: Category) => {
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
        category: category ?? "inbox",
        projectId: null,
        dueDate: null,
        completedAt: null,
        updatedAt: now,
      });
      await loadAll();
    } catch (e) {
      console.error("insertTask error:", e);
      Alert.alert("Error", "Failed to insert task");
    } finally {
      setLoading(false);
    }
  }, [userId, loadAll]);

  const completeTask = useCallback(async (taskId: string) => {
    setLoading(true);
    try {
      await db.update(tasks).set({
        completedAt: Date.now(),
        updatedAt: Date.now(),
      }).where(eq(tasks.id, taskId));
      await loadAll();
    } catch (e) {
      console.error("completeTask error:", e);
      Alert.alert("Error", "Failed to complete task");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  const deleteTask = useCallback(async (taskId: string) => {
    setLoading(true);
    try {
      await db.delete(tasks).where(eq(tasks.id, taskId));
      await loadAll();
    } catch (e) {
      console.error("deleteTask error:", e);
      Alert.alert("Error", "Failed to delete task");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  const deleteAllTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(tasks);
      await loadAll();
    } catch (e) {
      console.error("deleteAllTasks error:", e);
      Alert.alert("Error", "Failed to delete all tasks");
    } finally {
      setLoading(false);
    }
  }, [userId, loadAll]);

  // --- Project operations ---
  const insertProject = useCallback(async () => {
    if (!userId) {
      Alert.alert("Error", "No user ID available");
      return;
    }
    setLoading(true);
    try {
      const id = Crypto.randomUUID();
      const now = Date.now();
      await db.insert(projects).values({
        id,
        userId,
        title: `Project ${projectCountRef.current + 1}`,
        description: `Description for project ${projectCountRef.current + 1}`,
        isActive: true,
        updatedAt: now,
      });
      await loadAll();
    } catch (e) {
      console.error("insertProject error:", e);
      Alert.alert("Error", "Failed to insert project");
    } finally {
      setLoading(false);
    }
  }, [userId, loadAll]);

  const toggleProject = useCallback(async (projectId: string, isActive: boolean) => {
    setLoading(true);
    try {
      await db.update(projects).set({
        isActive: !isActive,
        updatedAt: Date.now(),
      }).where(eq(projects.id, projectId));
      await loadAll();
    } catch (e) {
      console.error("toggleProject error:", e);
      Alert.alert("Error", "Failed to toggle project");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  const deleteProject = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      await db.delete(projects).where(eq(projects.id, projectId));
      await loadAll();
    } catch (e) {
      console.error("deleteProject error:", e);
      Alert.alert("Error", "Failed to delete project");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  const deleteAllProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(projects);
      await loadAll();
    } catch (e) {
      console.error("deleteAllProjects error:", e);
      Alert.alert("Error", "Failed to delete all projects");
    } finally {
      setLoading(false);
    }
  }, [userId, loadAll]);

  // --- Tag operations ---
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
      await loadAll();
    } catch (e) {
      console.error("insertTag error:", e);
      Alert.alert("Error", "Failed to insert tag");
    } finally {
      setLoading(false);
    }
  }, [userId, loadAll]);

  const deleteTag = useCallback(async (tagId: string) => {
    setLoading(true);
    try {
      await db.delete(tags).where(eq(tags.id, tagId));
      await loadAll();
    } catch (e) {
      console.error("deleteTag error:", e);
      Alert.alert("Error", "Failed to delete tag");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  const deleteAllTags = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(tags);
      await loadAll();
    } catch (e) {
      console.error("deleteAllTags error:", e);
      Alert.alert("Error", "Failed to delete all tags");
    } finally {
      setLoading(false);
    }
  }, [userId, loadAll]);

  // --- Task-Tag operations ---
  const addTagToTask = useCallback(async (taskId: string, tagId: string) => {
    if (!userId) {
      Alert.alert("Error", "No user ID available");
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
        updatedAt: now,
      });
      await loadAll();
    } catch (e) {
      console.error("addTagToTask error:", e);
      Alert.alert("Error", "Failed to add tag to task");
    } finally {
      setLoading(false);
    }
  }, [loadAll, userId]);

  const removeTagFromTask = useCallback(async (taskId: string, tagId: string) => {
    setLoading(true);
    try {
      await db.delete(taskTags).where(
        and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId)),
      );
      await loadAll();
    } catch (e) {
      console.error("removeTagFromTask error:", e);
      Alert.alert("Error", "Failed to remove tag from task");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  const deleteAllTaskTags = useCallback(async () => {
    setLoading(true);
    try {
      await db.delete(taskTags);
      await loadAll();
    } catch (e) {
      console.error("deleteAllTaskTags error:", e);
      Alert.alert("Error", "Failed to delete all task tags");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  return {
    userId,
    taskList,
    projectList,
    tagList,
    taskTagList,
    loading,
    ready,
    error,
    loadAll,
    insertTask,
    completeTask,
    deleteTask,
    deleteAllTasks,
    insertProject,
    toggleProject,
    deleteProject,
    deleteAllProjects,
    insertTag,
    deleteTag,
    deleteAllTags,
    addTagToTask,
    removeTagFromTask,
    deleteAllTaskTags,
  };
}
