import type { Project } from "@/db/schema";
import { projects } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { eq, and, asc } from "drizzle-orm";

export function useDbProjects() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const projectCountRef = useRef(projectList.length);
  useEffect(() => {
    projectCountRef.current = projectList.length;
  }, [projectList.length]);

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
        .orderBy(asc(projects.createdAt));
      setProjectList(result as Project[]);
      setReady(true);
      setError(null);
    } catch (e) {
      console.error("loadProjects error:", e);
      Toast.show({ type: "error", text1: "Failed to load projects" });
    }
  }, [userId, clearState]);

  /* eslint-disable react-hooks/set-state-in-effect */
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
      .orderBy(asc(projects.createdAt));

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
  /* eslint-enable react-hooks/set-state-in-effect */

  const insertProject = useCallback(
    async (title?: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        const id = Crypto.randomUUID();
        const now = Date.now();
        await db.insert(projects).values({
          id,
          userId,
          title: title ?? `Project ${projectCountRef.current + 1}`,
          description: title ? "" : `Description for project ${projectCountRef.current + 1}`,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        await loadProjects();
      } catch (e) {
        console.error("insertProject error:", e);
        Toast.show({ type: "error", text1: "Failed to insert project" });
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<Pick<Project, "title" | "description" | "isActive">>,
    ) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
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
        Toast.show({ type: "error", text1: "Failed to update project" });
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const toggleProject = useCallback(
    async (projectId: string, isActive: boolean) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
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
        Toast.show({ type: "error", text1: "Failed to toggle project" });
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .delete(projects)
          .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
        await loadProjects();
      } catch (e) {
        console.error("deleteProject error:", e);
        Toast.show({ type: "error", text1: "Failed to delete project" });
      } finally {
        setLoading(false);
      }
    },
    [userId, loadProjects],
  );

  const deleteAllProjects = useCallback(async () => {
    if (!userId) {
      Toast.show({ type: "error", text1: "No user ID available" });
      return;
    }
    setLoading(true);
    try {
      await db.delete(projects).where(eq(projects.userId, userId));
      await loadProjects();
    } catch (e) {
      console.error("deleteAllProjects error:", e);
      Toast.show({ type: "error", text1: "Failed to delete all projects" });
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
