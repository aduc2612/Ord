import PromptModal from "@/components/prompt-modal";
import SearchBar from "@/components/search-bar";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTags } from "@/hooks/use-db-tags";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ToastProvider from "@/providers/toast-provider";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type ChooserType = "tag" | "project";

export type ChooserModalProps = {
  name: string;
  type: ChooserType;
  selectedIds: string[];
  onClose: () => void;
  onSelect: (ids: string[]) => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxxxl,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
    },
    closeButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    closeButtonText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
    },
    newButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    newButtonText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
    },
    noneRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      minHeight: 48,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      minHeight: 48,
    },
    itemLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    searchWrapper: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
  });
}

export default function ChooserModal({
  name,
  type,
  selectedIds,
  onClose,
  onSelect,
}: ChooserModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const sheetRef = useRef<TrueSheet>(null);
  const { tagList, insertTag } = useDbTags();
  const { projectList, insertProject } = useDbProjects();
  const promptName = `${name}Prompt`;
  const [searchQuery, setSearchQuery] = useState("");

  const items = type === "tag" ? tagList : projectList;

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => item.title.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const handleSelect = useCallback(
    (id: string | null) => {
      if (type === "tag") {
        if (id === null) {
          onSelect([]);
        } else {
          const exists = selectedIds.includes(id);
          const next = exists
            ? selectedIds.filter((i) => i !== id)
            : [...selectedIds, id];
          onSelect(next);
        }
      } else {
        onSelect(id === null ? [] : [id]);
      }
    },
    [type, selectedIds, onSelect],
  );

  const handleCreateNew = useCallback(
    async (value: string) => {
      if (type === "tag") {
        await insertTag(value);
      } else {
        await insertProject(value);
      }
    },
    [type, insertTag, insertProject],
  );

  const renderItem = ({ item }: { item: { id: string; title: string } }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <Pressable
        style={styles.itemRow}
        onPress={() => handleSelect(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.itemLabel}>{item.title}</Text>
        {isSelected ? (
          <Ionicons name="checkmark" size={22} color={theme.colors.primary} />
        ) : null}
      </Pressable>
    );
  };

  const noneSelected = selectedIds.length === 0;

  return (
    <>
      <TrueSheet
        ref={sheetRef}
        name={name}
        detents={[0.5, 1]}
        cornerRadius={theme.borderRadius.xxl}
        grabber
        scrollable
        onWillPresent={() => {
          setSearchQuery("");
        }}
        onDidDismiss={() => {
          setSearchQuery("");
          onClose();
        }}
        header={
          <>
            <View style={styles.header}>
              <Pressable
                style={styles.newButton}
                onPress={() => TrueSheet.present(promptName)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.newButtonText}>New</Text>
              </Pressable>
              <Text style={styles.headerTitle}>
                {type === "tag" ? "Tags" : "Projects"}
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => sheetRef.current?.dismiss()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </Pressable>
            </View>
            <ToastProvider />
          </>
        }
      >
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search ${type === "tag" ? "tags" : "projects"}`}
          />
        </View>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Pressable
              style={styles.noneRow}
              onPress={() => handleSelect(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.itemLabel}>None</Text>
              {noneSelected ? (
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={theme.colors.primary}
                />
              ) : null}
            </Pressable>
          }
        />
      </TrueSheet>
      <PromptModal
        name={promptName}
        title={type === "tag" ? "New Tag" : "New Project"}
        placeholder={type === "tag" ? "Tag name" : "Project name"}
        onConfirm={handleCreateNew}
        onCancel={() => {}}
      />
    </>
  );
}
