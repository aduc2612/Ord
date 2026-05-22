import type { Project } from "@/db/schema";
import { projects } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { eq, and } from "drizzle-orm";

export function useDbProjects() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const projectCountRef = useRef(projectList.length);
  projectCountRef.current = projectList.length;

  const clearState = useCallback(() => {
    setProjectList([]);
    setError(null);
    setReady(false);
  }, []);

  const loadProjects = useCallback(async () => {
    if (!userId) {
      clearState();
      return;
    }
    try {
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(projects.updatedAt);
      setProjectList(result as Project[]);
      setReady(true);
      setError(null);
    } catch (e) {
      console.error("loadProjects error:", e);
      Alert.alert("Error", "Failed to load projects");
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
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.updatedAt);

    db.watch(
      query,
      {
        onResult: (results) => {
          setProjectList(results as Project[]);
          setReady(true);
          setError(null);
        },
        onError: (err) => {
          console.error("useDbProjects watch error:", err);
          setError(err);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );

    return () => abortController.abort();
  }, [userId, clearState]);

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
      await loadProjects();
    } catch (e) {
      console.error("insertProject error:", e);
      Alert.alert("Error", "Failed to insert project");
    } finally {
      setLoading(false);
    }
  }, [userId, loadProjects]);

  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<Pick<Project, "title" | "description" | "isActive">>,
    ) => {
      if (!userId) {
        Alert.alert("Error", "No user ID available");
        return;
      }
      setLoading(true);
      try {
        await db
          .update(projects)
          .set({ ...updates, updatedAt: Date.now() })
          .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
        await loadProjects();
      } catch (e) {
        console.error("updateProject error:", e);
        Alert.alert("Error", "Failed to update project");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const toggleProject = useCallback(
    async (projectId: string, isActive: boolean) => {
      if (!userId) return;
      setLoading(true);
      try {
        await db
          .update(projects)
          .set({
            isActive: !isActive,
            updatedAt: Date.now(),
          })
          .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
        await loadProjects();
      } catch (e) {
        console.error("toggleProject error:", e);
        Alert.alert("Error", "Failed to toggle project");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!userId) return;
      setLoading(true);
      try {
        await db
          .delete(projects)
          .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
        await loadProjects();
      } catch (e) {
        console.error("deleteProject error:", e);
        Alert.alert("Error", "Failed to delete project");
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const deleteAllProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(projects).where(eq(projects.userId, userId));
      await loadProjects();
    } catch (e) {
      console.error("deleteAllProjects error:", e);
      Alert.alert("Error", "Failed to delete all projects");
    } finally {
      setLoading(false);
    }
  }, [userId, loadProjects]);

  return {
    projectList,
    loading,
    ready,
    error,
    loadProjects,
    insertProject,
    updateProject,
    toggleProject,
    deleteProject,
    deleteAllProjects,
  };
}
