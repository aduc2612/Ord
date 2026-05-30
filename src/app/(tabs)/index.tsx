import FabButton from "@/components/fab-button";
import SearchBar from "@/components/search-bar";
import SegmentedControl from "@/components/segmented-control";
import TaskDetailsSheet from "@/components/task-details-sheet";
import TaskItem from "@/components/task-item";
import { componentStyles, spacing, typography } from "@/constants/theme";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const segmentOptions = [
  { label: "Due Today", value: "due_today" },
  { label: "Next", value: "next" },
  { label: "Waiting For", value: "waiting_for" },
];

// TODO: Replace with real task data from hooks
const fillerTasks: Record<string, string[]> = {
  due_today: ["Task 1", "Task 2", "Task 3", "Task 4"],
  next: ["Next Action 1", "Next Action 2"],
  waiting_for: ["Waiting: Client reply", "Waiting: Approval"],
};

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
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
      marginBottom: spacing.md,
    },
    summaryCard: {
      ...componentStyles.card,
      backgroundColor: theme.colors.surface,
      // ...shadows.md,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    summaryLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    summaryValue: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      fontWeight: "600",
    },
    taskListContainer: {
      gap: spacing.sm,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    filterButton: {
      padding: spacing.sm,
    },
  });
}

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("due_today");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { noteList } = useDbNotes();
  const { taskList } = useDbTasks();
  const { projectList } = useDbProjects();

  const inboxCount = noteList.length;

  const waitingForCount = useMemo(
    () =>
      taskList.filter(
        (t) => t.category === "waiting_for" && t.completedAt === null,
      ).length,
    [taskList],
  );

  const projectsCount = projectList.length;

  const overdueCount = useMemo(
    () =>
      taskList.filter(
        (t) =>
          t.completedAt === null &&
          t.dueDate !== null &&
          t.dueDate < Date.now(), // eslint-disable-line react-hooks/purity -- overdue must reflect current time
      ).length,
    [taskList],
  );

  const summaryRows = useMemo(
    () => [
      {
        label: "Inbox count",
        value: inboxCount,
        onPress: () => router.push("/(tabs)/inbox"),
      },
      {
        label: "Waiting For",
        value: waitingForCount,
        onPress: () =>
          router.push({
            pathname: "/(tabs)/tasks",
            params: {
              filters: JSON.stringify({ category: "waiting_for" }),
            },
          }),
      },
      {
        label: "Projects count",
        value: projectsCount,
        onPress: () => router.push("/(tabs)/lists"),
      },
      {
        label: "Overdue",
        value: overdueCount,
        onPress: () =>
          router.push({
            pathname: "/(tabs)/tasks",
            params: {
              filters: JSON.stringify({ overdue: true }),
            },
          }),
      },
    ],
    [inboxCount, waitingForCount, projectsCount, overdueCount, router],
  );

  const currentTasks = fillerTasks[selectedSegment] ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.header}>Home</Text>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks"
            style={{ flex: 1 }}
          />
          <Pressable
            style={styles.filterButton}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="filter" size={24} color={theme.colors.onSurface} />
          </Pressable>
        </View>

        {/* Summary Statistics Card */}
        <View style={styles.summaryCard}>
          {summaryRows.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.summaryRow,
                pressed && { opacity: theme.interaction.pressedOpacity },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={item.onPress}
            >
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </Pressable>
          ))}
        </View>

        {/* Segmented Control */}
        <SegmentedControl
          options={segmentOptions}
          selectedValue={selectedSegment}
          onSelect={setSelectedSegment}
        />

        {/* Task List */}
        <View style={styles.taskListContainer}>
          {currentTasks.map((task) => (
            <TaskItem
              key={task}
              title={task}
              onPress={() => setSelectedTaskId(task)}
            />
          ))}
        </View>
      </ScrollView>
      <FabButton type="note" />
      <TaskDetailsSheet
        visible={selectedTaskId !== null}
        taskId={selectedTaskId ?? ""}
        onDismiss={() => setSelectedTaskId(null)}
      />
    </View>
  );
}
