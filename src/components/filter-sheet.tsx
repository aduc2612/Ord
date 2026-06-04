import SegmentedControl, {
  type SegmentedOption,
} from "@/components/segmented-control";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTags } from "@/hooks/use-db-tags";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ToastProvider from "@/providers/toast-provider";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterSegment = "category" | "tag" | "project" | "overdue";

export type FilterSelections = {
  category: string | null; // single select: "next_action" | "waiting_for" | "someday" | null
  tags: string[]; // multi-select: array of tag ids
  projectId: string | null; // single select: project id | null
  overdue: boolean; // true = show overdue only, false = no overdue filter
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
  overdue: false,
};

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    stickyHeader: {
      backgroundColor: theme.colors.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      paddingTop: spacing.xxxxl,
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
    overdueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    overdueLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FilterSheet({
  onApply,
  availableFilters = ["category", "tag", "project"],
  initialSelections,
}: {
  onApply: (filters: FilterSelections) => void;
  availableFilters?: FilterSegment[];
  initialSelections?: FilterSelections;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { tagList } = useDbTags();
  const { projectList } = useDbProjects();

  const sheetRef = useRef<TrueSheet>(null);

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
  const [draftOverdue, setDraftOverdue] = useState<boolean>(
    DEFAULT_SELECTIONS.overdue,
  );

  // ── Derived visibility: Someday hides Tag + Project ──────────────────────
  const isSomeday = draftCategory === "someday";

  const visibleSegments = useMemo(() => {
    if (isSomeday) {
      // Someday: only show category
      return availableFilters.filter((s) => s === "category");
    }
    // Exclude "overdue" — it's rendered as a standalone Switch, not a segment tab
    return availableFilters.filter((s) => s !== "overdue");
  }, [availableFilters, isSomeday]);

  // Build segmented control options from visible segments
  const segmentLabels: Record<FilterSegment, string> = {
    category: "Category",
    tag: "Tag",
    project: "Project",
    overdue: "Overdue",
  };

  const segmentOptions: SegmentedOption[] = visibleSegments.map((seg) => ({
    label: segmentLabels[seg],
    value: seg,
  }));

  // Ensure activeSegment is valid for current visible segments
  const effectiveSegment = (
    visibleSegments as readonly FilterSegment[]
  ).includes(activeSegment)
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
      overdue: draftOverdue,
    });
    sheetRef.current?.dismiss();
  }, [
    draftCategory,
    draftTags,
    draftProjectId,
    draftOverdue,
    isSomeday,
    onApply,
  ]);

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
      case "overdue":
        return [];
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
        case "overdue":
          return draftOverdue;
        default:
          return false;
      }
    },
    [effectiveSegment, draftCategory, draftTags, draftProjectId, draftOverdue],
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
        case "overdue":
          setDraftOverdue((prev) => !prev);
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
      case "overdue":
        setDraftOverdue(false);
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
      case "overdue":
        return !draftOverdue;
      default:
        return true;
    }
  }, [
    effectiveSegment,
    draftCategory,
    draftTags,
    draftProjectId,
    draftOverdue,
  ]);

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
    <TrueSheet
      ref={sheetRef}
      name="filterSheet"
      detents={[0.5, 1]}
      cornerRadius={theme.borderRadius.xxl}
      grabber
      scrollable
      onWillPresent={() => {
        const init = initialSelections ?? DEFAULT_SELECTIONS;
        setDraftCategory(init.category);
        setDraftTags([...init.tags]);
        setDraftProjectId(init.projectId);
        setDraftOverdue(init.overdue);
        setActiveSegment(availableFilters[0] ?? "category");
      }}
      header={
        <>
          <View style={styles.stickyHeader}>
            <Text style={styles.headerTitle}>Filter</Text>
            <Pressable
              style={styles.doneButton}
              onPress={handleDone}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
          <ToastProvider />
        </>
      }
    >
      <View style={styles.container}>
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

        {/* Overdue toggle (only when caller opts in) */}
        {availableFilters.includes("overdue") ? (
          <View style={styles.overdueRow}>
            <Text style={styles.overdueLabel}>Overdue only</Text>
            <Switch
              value={draftOverdue}
              onValueChange={setDraftOverdue}
              trackColor={{
                false: theme.colors.outlineVariant,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
            />
          </View>
        ) : null}

        {/* Content list (hidden for overdue segment — it's a toggle) */}
        {effectiveSegment !== "overdue" ? (
          <FlatList
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
        ) : null}
      </View>
    </TrueSheet>
  );
}
