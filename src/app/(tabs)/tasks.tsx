import FilterSheet, { type FilterSelections } from "@/components/filter-sheet";
import SearchBar from "@/components/search-bar";
import TaskDetailsSheet from "@/components/task-details-sheet";
import TaskItem from "@/components/task-item";
import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Project, Task, TaskTag } from "@/db/schema";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskFilters = {
  category: string | null;
  tags: string[];
  project: string | null;
  overdue: boolean | null;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: TaskFilters = {
  category: null,
  tags: [],
  project: null,
  overdue: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFilters(filtersStr: string | undefined): TaskFilters {
  if (!filtersStr) return DEFAULT_FILTERS;
  try {
    const parsed = JSON.parse(filtersStr);
    return {
      category: parsed.category ?? null,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      project: parsed.project ?? null,
      overdue: typeof parsed.overdue === "boolean" ? parsed.overdue : null,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    headerWrapper: {
      paddingHorizontal: spacing.lg,
    },
    topSection: {
      gap: spacing.lg,
      marginBottom: spacing.lg,
    },
    searchWrapper: {
      paddingHorizontal: spacing.lg,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      marginHorizontal: spacing.lg,
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
    taskItemWrapper: {
      paddingHorizontal: spacing.lg,
    },
    emptyText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      paddingVertical: spacing.xl,
    },
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filters?: string }>();

  // Parse initial filters from URL params
  const initialFilters = useMemo(
    () => parseFilters(params.filters),
    [params.filters],
  );

  // ── State ──────────────────────────────────────────────────────────────────

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterSelections>({
    category: initialFilters.category,
    tags: initialFilters.tags,
    projectId: null,
    overdue: initialFilters.overdue ?? false,
  });

  // Keep track of which params string was active the last time we applied
  // filters. On focus we compare the current params to this value:
  //   - changed (or undefined on first visit) → new deep-link push from another
  //     screen; apply the incoming params.
  //   - same → normal return after navigating away; reset to defaults so stale
  //     deep-link params don't persist across tab switches.
  const lastAppliedParamsRef = useRef<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (params.filters !== lastAppliedParamsRef.current) {
        // Params changed: apply them and remember what we applied.
        lastAppliedParamsRef.current = params.filters;
        setFilters({
          category: initialFilters.category,
          tags: initialFilters.tags,
          projectId: null,
          overdue: initialFilters.overdue ?? false,
        });
        setSearchQuery("");
      } else {
        // Same params as last time → returning from another screen, reset.
        setFilters({
          category: null,
          tags: [],
          projectId: null,
          overdue: false,
        });
        setSearchQuery("");
      }
    }, [params.filters, initialFilters]),
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // ── Data hooks ─────────────────────────────────────────────────────────────

  const { taskList } = useDbTasks();
  const { taskTagList } = useDbTaskTags();
  const { projectList } = useDbProjects();

  // Resolve project name from URL params to project ID
  useEffect(() => {
    if (initialFilters.project && projectList.length > 0) {
      const project = projectList.find(
        (p: Project) => p.title === initialFilters.project,
      );
      if (project) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- setFilters doesn't affect dependencies, safe one-time resolution
        setFilters((prev: FilterSelections) => {
          if (prev.projectId === project.id) return prev;
          return { ...prev, projectId: project.id };
        });
      }
    }
  }, [initialFilters.project, projectList]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    return taskList.filter((task: Task) => {
      // Skip completed tasks
      if (task.completedAt !== null) return false;

      // Category filter
      if (filters.category && task.category !== filters.category) return false;

      // Tags filter (task must have ALL selected tags)
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((tagId: string) =>
          taskTagList.some(
            (tt: TaskTag) => tt.taskId === task.id && tt.tagId === tagId,
          ),
        );
        if (!hasAllTags) return false;
      }

      // Project filter
      if (filters.projectId && task.projectId !== filters.projectId)
        return false;

      // Overdue filter
      if (filters.overdue) {
        const isOverdue =
          task.dueDate !== null &&
          task.completedAt === null &&
          task.dueDate < now;
        if (!isOverdue) return false;
      }

      // Search filter (match on title)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!task.title.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [taskList, filters, taskTagList, searchQuery, now]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filterCount = useMemo(() => {
    return (
      (filters.category ? 1 : 0) +
      filters.tags.length +
      (filters.projectId ? 1 : 0) +
      (filters.overdue ? 1 : 0)
    );
  }, [filters]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFilterApply = useCallback((sel: FilterSelections) => {
    setFilters(sel);
  }, []);

  const handleTaskPress = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    requestAnimationFrame(() => {
      TrueSheet.present("taskDetailsSheet");
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <View style={styles.taskItemWrapper}>
        <TaskItem title={item.title} onPress={() => handleTaskPress(item.id)} />
      </View>
    ),
    [handleTaskPress, styles.taskItemWrapper],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Fixed header area: title + search + filter */}
      <View
        style={[styles.topSection, { paddingTop: insets.top + spacing.lg }]}
      >
        <View style={styles.headerWrapper}>
          <Text style={styles.header}>Tasks</Text>
        </View>

        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks"
          />
        </View>

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
      </View>

      {/* Scrollable task list */}
      <FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={(item: Task) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks found</Text>
        }
      />

      {/* Filter bottom sheet */}
      <FilterSheet
        onApply={handleFilterApply}
        availableFilters={["category", "tag", "project"]}
        initialSelections={filters}
      />

      {/* Task details sheet */}
      <TaskDetailsSheet
        taskId={selectedTaskId ?? ""}
        onDismiss={() => setSelectedTaskId(null)}
      />
    </View>
  );
}
