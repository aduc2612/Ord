import ClarifySheet from "@/components/clarify-sheet";
import FabButton from "@/components/fab-button";
import SearchBar from "@/components/search-bar";
import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Note } from "@/db/schema";
import { useDbNotes } from "@/hooks/use-db-notes";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    processButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    processButtonText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
    },
    searchWrapper: {
      paddingHorizontal: spacing.lg,
    },
    noteItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    noteText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    emptyText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      textAlign: "center",
      paddingVertical: spacing.lg,
    },
    topSection: {
      gap: spacing.lg,
      paddingBottom: spacing.lg,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
  });
}

export default function InboxScreen() {
  const { noteList, ready } = useDbNotes();
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [showClarify, setShowClarify] = useState(false);
  const [clarifyNoteId, setClarifyNoteId] = useState("");
  const [clarifyQueue, setClarifyQueue] = useState<string[]>([]);
  const [clarifyTotal, setClarifyTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery("");
      };
    }, []),
  );

  const sortedNotes = useMemo(
    () => [...noteList].sort((a, b) => a.createdAt - b.createdAt),
    [noteList],
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return sortedNotes;
    const query = searchQuery.toLowerCase().trim();
    return sortedNotes.filter((note) =>
      note.title.toLowerCase().includes(query),
    );
  }, [sortedNotes, searchQuery]);

  const handleProcess = useCallback(() => {
    const available = sortedNotes;
    if (available.length === 0) {
      Toast.show({ type: "error", text1: "No notes to process" });
      return;
    }
    setClarifyNoteId(available[0].id);
    setClarifyQueue(available.slice(1).map((n) => n.id));
    setClarifyTotal(available.length);
    setShowClarify(true);
  }, [sortedNotes]);

  const handleClarifyDismiss = useCallback(() => {
    setShowClarify(false);
  }, []);

  const handleClarifyProcessed = useCallback(
    (nextId: string | null, remainingQueue: string[]) => {
      if (nextId) {
        setClarifyNoteId(nextId);
        setClarifyQueue(remainingQueue);
      } else {
        setShowClarify(false);
      }
    },
    [],
  );

  const renderItem = ({ item }: { item: Note }) => (
    <Pressable
      style={styles.noteItem}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.noteText}>{item.title}</Text>
    </Pressable>
  );
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topSection,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Inbox</Text>
          <Pressable
            style={styles.processButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleProcess}
          >
            <Text style={styles.processButtonText}>Process</Text>
          </Pressable>
        </View>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes"
          />
        </View>
      </View>
      <FlashList
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          ready ? <Text style={styles.emptyText}>No notes found</Text> : null
        }
      />
      <FabButton type="note" />
      <ClarifySheet
        visible={showClarify}
        noteId={clarifyNoteId}
        noteQueue={clarifyQueue}
        totalNotes={clarifyTotal}
        onDismiss={handleClarifyDismiss}
        onProcessed={handleClarifyProcessed}
      />
    </View>
  );
}
