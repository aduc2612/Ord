import type { Note } from "@/db/schema";
import { notes } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { eq, and, asc } from "drizzle-orm";

export function useDbNotes() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [noteList, setNoteList] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const noteCountRef = useRef(noteList.length);
  useEffect(() => {
    noteCountRef.current = noteList.length;
  }, [noteList.length]);

  const clearState = useCallback(() => {
    setNoteList([]);
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
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(asc(notes.createdAt));

    db.watch(
      query,
      {
        onResult: (results) => {
          setNoteList(results as Note[]);
          setReady(true);
          setError(null);
        },
        onError: (err) => {
          console.error("useDbNotes watch error:", err);
          setError(err);
          setReady(true);
        },
      },
      { signal: abortController.signal },
    );

    return () => abortController.abort();
  }, [userId, clearState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const insertNote = useCallback(
    async (title?: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        const id = Crypto.randomUUID();
        const now = Date.now();
        await db.insert(notes).values({
          id,
          userId,
          title: title ?? `Note ${noteCountRef.current + 1}`,
          createdAt: now,
          updatedAt: now,
        });
      } catch (e) {
        console.error("insertNote error:", e);
        Toast.show({ type: "error", text1: "Failed to insert note" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const updateNote = useCallback(
    async (
      noteId: string,
      updates: Partial<Pick<Note, "title">>,
    ) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .update(notes)
          .set({ ...updates, updatedAt: Date.now() })
          .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
      } catch (e) {
        console.error("updateNote error:", e);
        Toast.show({ type: "error", text1: "Failed to update note" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!userId) {
        Toast.show({ type: "error", text1: "No user ID available" });
        return;
      }
      setLoading(true);
      try {
        await db
          .delete(notes)
          .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
      } catch (e) {
        console.error("deleteNote error:", e);
        Toast.show({ type: "error", text1: "Failed to delete note" });
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteAllNotes = useCallback(async () => {
    if (!userId) {
      Toast.show({ type: "error", text1: "No user ID available" });
      return;
    }
    setLoading(true);
    try {
      await db.delete(notes).where(eq(notes.userId, userId));
    } catch (e) {
      console.error("deleteAllNotes error:", e);
      Toast.show({ type: "error", text1: "Failed to delete all notes" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    noteList,
    loading,
    ready,
    error,
    insertNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
  };
}
