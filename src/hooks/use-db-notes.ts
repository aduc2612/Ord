import type { Note } from "@/db/schema";
import { notes } from "@/db/schema";
import { db } from "@/lib/powersync-db";
import { useAuthContext } from "@/hooks/use-auth-context";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { eq, and } from "drizzle-orm";

export function useDbNotes() {
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const [noteList, setNoteList] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const noteCountRef = useRef(noteList.length);
  noteCountRef.current = noteList.length;

  const clearState = useCallback(() => {
    setNoteList([]);
    setError(null);
    setReady(false);
  }, []);

  const loadNotes = useCallback(async () => {
    if (!userId) {
      clearState();
      return;
    }
    try {
      const result = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, userId));
      setNoteList(result as Note[]);
      setReady(true);
      setError(null);
    } catch (e) {
      console.error("loadNotes error:", e);
      Alert.alert("Error", "Failed to load notes");
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
      .from(notes)
      .where(eq(notes.userId, userId));

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

  const insertNote = useCallback(async () => {
    if (!userId) {
      Alert.alert("Error", "No user ID available");
      return;
    }
    setLoading(true);
    try {
      const id = Crypto.randomUUID();
      await db.insert(notes).values({
        id,
        userId,
        title: `Note ${noteCountRef.current + 1}`,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error("insertNote error:", e);
      Alert.alert("Error", "Failed to insert note");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateNote = useCallback(
    async (
      noteId: string,
      updates: Partial<Pick<Note, "title">>,
    ) => {
      if (!userId) {
        Alert.alert("Error", "No user ID available");
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
        Alert.alert("Error", "Failed to update note");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!userId) return;
      setLoading(true);
      try {
        await db
          .delete(notes)
          .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
      } catch (e) {
        console.error("deleteNote error:", e);
        Alert.alert("Error", "Failed to delete note");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteAllNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await db.delete(notes).where(eq(notes.userId, userId));
    } catch (e) {
      console.error("deleteAllNotes error:", e);
      Alert.alert("Error", "Failed to delete all notes");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    noteList,
    loading,
    ready,
    error,
    loadNotes,
    insertNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
  };
}
