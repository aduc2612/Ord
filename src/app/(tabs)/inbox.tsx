import SearchBar from "@/components/search-bar";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbNotes } from "@/hooks/use-db-notes";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    noteList: {
      gap: spacing.sm,
    },
    noteItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
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
  });
}

export default function InboxScreen() {
  const { noteList, ready } = useDbNotes();
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Inbox</Text>
          <Pressable
            style={styles.processButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.processButtonText}>Process</Text>
          </Pressable>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes"
        />

        <View style={styles.noteList}>
          {ready && noteList.length === 0 ? (
            <Text style={styles.emptyText}>No notes yet</Text>
          ) : (
            noteList.map((note) => (
              <Pressable
                key={note.id}
                style={styles.noteItem}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.noteText}>{note.title}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
