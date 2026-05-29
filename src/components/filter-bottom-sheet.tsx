import SegmentedControl, {
  type SegmentedOption,
} from "@/components/segmented-control";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTags } from "@/hooks/use-db-tags";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { BottomSheet } from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterSegment = "category" | "tag" | "project";

export type FilterSelections = {
  category: string | null; // single select: "next_action" | "waiting_for" | "someday" | null
  tags: string[]; // multi-select: array of tag ids
  projectId: string | null; // single select: project id | null
};

export type FilterBottomSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: FilterSelections) => void;
  /** Which filter segments to show. Defaults to all three. */
  availableFilters?: FilterSegment[];
  /** Initial selections to pre-populate when the sheet opens. */
  initialSelections?: FilterSelections;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "Next", value: "next_action" },
  { label: "Waiting For", value: "waiting_for" },
  { label: "Someday", value: "someday" },
];

const DEFAULT_SELECTIONS: FilterSelections = {
  category: null,
  tags: [],
  projectId: null,
};

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    doneButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    doneButtonText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
    },
    segmentWrapper: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
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
    itemLabelSelected: {
      color: theme.colors.primary,
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
    noneLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FilterBottomSheet({
  visible,
  onDismiss,
  onApply,
  availableFilters = ["category", "tag", "project"],
  initialSelections,
}: FilterBottomSheetProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { tagList } = useDbTags();
  const { projectList } = useDbProjects();

  // ── Draft state (temporary until "Done") ─────────────────────────────────
  const [draftCategory, setDraftCategory] = useState<string | null>(
    DEFAULT_SELECTIONS.category,
  );
  const [draftTags, setDraftTags] = useState<string[]>(DEFAULT_SELECTIONS.tags);
  const [draftProjectId, setDraftProjectId] = useState<string | null>(
    DEFAULT_SELECTIONS.projectId,
  );
  const [activeSegment, setActiveSegment] = useState<FilterSegment>(
    availableFilters[0] ?? "category",
  );

  // Seed draft from initial selections when the sheet opens
  useEffect(() => {
    if (visible) {
      const init = initialSelections ?? DEFAULT_SELECTIONS;
      setDraftCategory(init.category);
      setDraftTags([...init.tags]);
      setDraftProjectId(init.projectId);
      setActiveSegment(availableFilters[0] ?? "category");
    }
  }, [visible, initialSelections, availableFilters]);

  // ── Derived visibility: Someday hides Tag + Project ──────────────────────
  const isSomeday = draftCategory === "someday";

  const visibleSegments = useMemo(() => {
    if (isSomeday) {
      // Someday: only show category
      return availableFilters.filter((s) => s === "category");
    }
    return availableFilters;
  }, [availableFilters, isSomeday]);

  // Build segmented control options from visible segments
  const segmentLabels: Record<FilterSegment, string> = {
    category: "Category",
    tag: "Tag",
    project: "Project",
  };

  const segmentOptions: SegmentedOption[] = visibleSegments.map((seg) => ({
    label: segmentLabels[seg],
    value: seg,
  }));

  // Ensure activeSegment is valid for current visible segments
  const effectiveSegment = visibleSegments.includes(activeSegment)
    ? activeSegment
    : (visibleSegments[0] ?? "category");

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback(
    (value: string) => {
      setDraftCategory(value === draftCategory ? null : value);
    },
    [draftCategory],
  );

  const handleTagToggle = useCallback((tagId: string) => {
    setDraftTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }, []);

  const handleProjectSelect = useCallback(
    (projectId: string) => {
      setDraftProjectId(projectId === draftProjectId ? null : projectId);
    },
    [draftProjectId],
  );

  const handleDone = useCallback(() => {
    onApply({
      category: draftCategory,
      tags: isSomeday ? [] : draftTags,
      projectId: isSomeday ? null : draftProjectId,
    });
  }, [draftCategory, draftTags, draftProjectId, isSomeday, onApply]);

  // ── List data based on active segment ────────────────────────────────────

  type ListItem = { id: string; label: string };

  const listData: ListItem[] = useMemo(() => {
    switch (effectiveSegment) {
      case "category":
        return CATEGORY_OPTIONS.map((opt) => ({
          id: opt.value,
          label: opt.label,
        }));
      case "tag":
        return tagList.map((t) => ({ id: t.id, label: t.title }));
      case "project":
        return projectList.map((p) => ({ id: p.id, label: p.title }));
      default:
        return [];
    }
  }, [effectiveSegment, tagList, projectList]);

  // ── Render helpers ───────────────────────────────────────────────────────

  const isItemSelected = useCallback(
    (id: string) => {
      switch (effectiveSegment) {
        case "category":
          return draftCategory === id;
        case "tag":
          return draftTags.includes(id);
        case "project":
          return draftProjectId === id;
        default:
          return false;
      }
    },
    [effectiveSegment, draftCategory, draftTags, draftProjectId],
  );

  const handleItemPress = useCallback(
    (id: string) => {
      switch (effectiveSegment) {
        case "category":
          handleCategorySelect(id);
          break;
        case "tag":
          handleTagToggle(id);
          break;
        case "project":
          handleProjectSelect(id);
          break;
      }
    },
    [
      effectiveSegment,
      handleCategorySelect,
      handleTagToggle,
      handleProjectSelect,
    ],
  );

  const handleNonePress = useCallback(() => {
    switch (effectiveSegment) {
      case "category":
        setDraftCategory(null);
        break;
      case "tag":
        setDraftTags([]);
        break;
      case "project":
        setDraftProjectId(null);
        break;
    }
  }, [effectiveSegment]);

  const isNoneSelected = useMemo(() => {
    switch (effectiveSegment) {
      case "category":
        return draftCategory === null;
      case "tag":
        return draftTags.length === 0;
      case "project":
        return draftProjectId === null;
      default:
        return true;
    }
  }, [effectiveSegment, draftCategory, draftTags, draftProjectId]);

  // ── Render item ──────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      const selected = isItemSelected(item.id);
      return (
        <Pressable
          style={styles.itemRow}
          onPress={() => handleItemPress(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[styles.itemLabel, selected && styles.itemLabelSelected]}
          >
            {item.label}
          </Text>
          {selected ? (
            <Ionicons name="checkmark" size={22} color={theme.colors.primary} />
          ) : null}
        </Pressable>
      );
    },
    [isItemSelected, handleItemPress, styles, theme],
  );

  // ── Single-segment mode: skip segmented control ──────────────────────────

  const showSegmentedControl = segmentOptions.length > 1;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      onDismiss={onDismiss}
      enablePanDownToClose
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter</Text>
          <Pressable
            style={styles.doneButton}
            onPress={handleDone}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>

        {/* Segmented control */}
        {showSegmentedControl ? (
          <View style={styles.segmentWrapper}>
            <SegmentedControl
              options={segmentOptions}
              selectedValue={effectiveSegment}
              onSelect={(val) => setActiveSegment(val as FilterSegment)}
            />
          </View>
        ) : null}

        {/* Content list */}
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Pressable
              style={styles.noneRow}
              onPress={handleNonePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.noneLabel}>None</Text>
              {isNoneSelected ? (
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
    </BottomSheet>
  );
}
