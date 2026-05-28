import PromptModal from "@/components/prompt-modal";
import SearchBar from "@/components/search-bar";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTags } from "@/hooks/use-db-tags";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { BottomSheet } from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type ChooserType = "tag" | "project";

export type ChooserModalProps = {
  visible: boolean;
  type: ChooserType;
  selectedIds: string[];
  onClose: () => void;
  onSelect: (ids: string[]) => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingTop: spacing.lg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
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
  visible,
  type,
  selectedIds,
  onClose,
  onSelect,
}: ChooserModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { tagList, insertTag } = useDbTags();
  const { projectList, insertProject } = useDbProjects();
  const [showPrompt, setShowPrompt] = useState(false);
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
      setShowPrompt(false);
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
      <BottomSheet
        index={visible ? 0 : -1}
        onDismiss={onClose}
        // snapPoints={["50%", "90%"]}
        enablePanDownToClose
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={styles.newButton}
              onPress={() => setShowPrompt(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.newButtonText}>New</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {type === "tag" ? "Tags" : "Projects"}
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${type === "tag" ? "tags" : "projects"}`}
            />
          </View>
          <FlashList
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
        </View>
        <Toast />
      </BottomSheet>
      <PromptModal
        visible={showPrompt}
        title={type === "tag" ? "New Tag" : "New Project"}
        placeholder={type === "tag" ? "Tag name" : "Project name"}
        onConfirm={handleCreateNew}
        onCancel={() => setShowPrompt(false)}
      />
    </>
  );
}
