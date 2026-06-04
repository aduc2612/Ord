import FilterSheet, { type FilterSelections } from "@/components/filter-sheet";
import SearchBar from "@/components/search-bar";
import SegmentedControl from "@/components/segmented-control";
import TaskDetailsSheet from "@/components/task-details-sheet";
import TaskItem from "@/components/task-item";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ToastProvider from "@/providers/toast-provider";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

// ─── Constants ───────────────────────────────────────────────────────────────

const segmentOptions = [
  { label: "Due Today", value: "due_today" },
  { label: "Next", value: "next" },
  { label: "Waiting For", value: "waiting_for" },
];

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(theme: Theme) {
  return StyleSheet.create({
    stickyHeader: {
      paddingTop: spacing.xxxxl,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      minHeight: 48,
    },
    filterLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    filterValue: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      marginRight: spacing.sm,
    },
    filterValueRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    searchBarFill: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    listContainer: {
      backgroundColor: theme.colors.background,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    emptyState: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xl,
      textAlign: "center",
    },
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TodaySheet() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const { taskList, completeTask } = useDbTasks();
  const { taskTagList } = useDbTaskTags();

  // ── Internal state (resets when sheet opens) ────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("due_today");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSelections>({
    category: null,
    tags: [],
    projectId: null,
    overdue: false,
  });

  // ── Derived data ─────────────────────────────────────────────────────────

  const todayStart = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }, []);

  const todayEnd = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now.getTime();
  }, []);

  const hasTasksDueToday = useMemo(
    () =>
      taskList.some(
        (t) =>
          t.completedAt === null &&
          t.dueDate !== null &&
          t.dueDate >= todayStart &&
          t.dueDate <= todayEnd,
      ),
    [taskList, todayStart, todayEnd],
  );

  // Dynamic segment options: "Due Today" becomes "Upcoming" when no tasks due today
  const dynamicSegmentOptions = useMemo(() => {
    if (hasTasksDueToday) return segmentOptions;
    return segmentOptions.map((opt) =>
      opt.value === "due_today"
        ? { label: "Upcoming", value: "due_today" }
        : opt,
    );
  }, [hasTasksDueToday]);

  // Filter tasks by segment
  const segmentFilteredTasks = useMemo(() => {
    const incompleteTasks = taskList.filter((t) => t.completedAt === null);

    switch (selectedSegment) {
      case "due_today":
        if (hasTasksDueToday) {
          // Show tasks due today
          return incompleteTasks.filter(
            (t) =>
              t.dueDate !== null &&
              t.dueDate >= todayStart &&
              t.dueDate <= todayEnd,
          );
        }
        // Show upcoming tasks (due_date > today)
        return incompleteTasks.filter(
          (t) => t.dueDate !== null && t.dueDate > todayEnd,
        );
      case "next":
        return incompleteTasks.filter((t) => t.category === "next_action");
      case "waiting_for":
        return incompleteTasks.filter((t) => t.category === "waiting_for");
      default:
        return incompleteTasks;
    }
  }, [taskList, selectedSegment, hasTasksDueToday, todayStart, todayEnd]);

  // Apply additional filters (category, tags)
  const filteredTasks = useMemo(() => {
    return segmentFilteredTasks.filter((task) => {
      if (filters.category && task.category !== filters.category) return false;
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((tagId) =>
          taskTagList.some((tt) => tt.taskId === task.id && tt.tagId === tagId),
        );
        if (!hasAllTags) return false;
      }
      return true;
    });
  }, [segmentFilteredTasks, filters, taskTagList]);

  // Apply search
  const searchedTasks = useMemo(() => {
    if (!searchQuery.trim()) return filteredTasks;
    const query = searchQuery.toLowerCase();
    return filteredTasks.filter((t) => t.title.toLowerCase().includes(query));
  }, [filteredTasks, searchQuery]);

  const filterCount = (filters.category ? 1 : 0) + filters.tags.length;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleTaskPress = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    requestAnimationFrame(() => {
      TrueSheet.present("taskDetailsSheet");
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof searchedTasks)[number] }) => (
      <TaskItem
        title={item.title}
        completed={false}
        onPress={() => handleTaskPress(item.id)}
        onCheckboxPress={() => completeTask(item.id)}
      />
    ),
    [handleTaskPress, completeTask],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <TrueSheet
        name="todaySheet"
        detents={[0.5, 1]}
        cornerRadius={theme.borderRadius.xxl}
        grabber
        scrollable
        onDidDismiss={() => {
          setSearchQuery("");
          setSelectedSegment("due_today");
          setSelectedTaskId(null);
          setFilters({
            category: null,
            tags: [],
            projectId: null,
            overdue: false,
          });
        }}
        header={
          <>
            <View style={styles.stickyHeader}>
              {/* Search Row */}
              <View style={styles.searchRow}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search tasks"
                  style={styles.searchBarFill}
                />
              </View>

              {/* Filter Row */}
              <Pressable
                style={styles.filterRow}
                onPress={() => TrueSheet.present("filterSheet")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.filterLabel}>Filter</Text>
                <View style={styles.filterValueRow}>
                  <Text style={styles.filterValue}>
                    {filterCount > 0 ? `${filterCount} selected` : "None"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              </Pressable>

              {/* Segmented Control */}
              <SegmentedControl
                options={dynamicSegmentOptions}
                selectedValue={selectedSegment}
                onSelect={setSelectedSegment}
              />
            </View>
            <ToastProvider />
          </>
        }
      >
        {searchedTasks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyState}>No tasks found</Text>
          </View>
        ) : (
          <FlatList
            data={searchedTasks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            style={styles.listContainer}
          />
        )}
      </TrueSheet>

      <FilterSheet
        onApply={(sel) => {
          setFilters(sel);
        }}
        availableFilters={["tag"]}
        initialSelections={filters}
      />

      <TaskDetailsSheet
        taskId={selectedTaskId ?? ""}
        onDismiss={() => setSelectedTaskId(null)}
      />
    </>
  );
}
