import FabButton from "@/components/fab-button";
import TaskDetailsSheet from "@/components/task-details-sheet";
import TodaySheet from "@/components/today-sheet";
import { componentStyles, spacing, typography } from "@/constants/theme";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import { useCurrentTime } from "@/hooks/use-current-time";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRouter } from "expo-router";
import { usePendingFiltersStore } from "@/store/pending-filters";
import { useReviewStore } from "@/store/review-store";
import { formatDate } from "@/utils/format-date";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
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
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
      marginBottom: spacing.md,
    },
    summaryCard: {
      ...componentStyles.card,
      backgroundColor: theme.colors.surface,
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
    summaryValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    viewTasksButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: componentStyles.card.borderRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    viewTasksButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
      fontWeight: "600",
    },
  });
}

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setPendingFilters = usePendingFiltersStore((s) => s.setPendingFilters);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { noteList } = useDbNotes();
  const { taskList } = useDbTasks();
  const { projectList } = useDbProjects();

  const lastReviewedAt = useReviewStore((s) => s.lastReviewedAt);
  const now = useCurrentTime();

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
        (t) => t.completedAt === null && t.dueDate !== null && t.dueDate < now,
      ).length,
    [taskList, now],
  );

  const summaryRows = useMemo(
    () => [
      {
        label: "Inbox",
        value: inboxCount,
        onPress: () => router.push("/(tabs)/inbox"),
      },
      {
        label: "Waiting For",
        value: waitingForCount,
        onPress: () => {
          setPendingFilters({
            category: "waiting_for",
            tags: [],
            projectId: null,
            overdue: false,
          });
          router.push("/(tabs)/tasks");
        },
      },
      {
        label: "Projects",
        value: projectsCount,
        onPress: () => router.push("/(tabs)/projects"),
      },
      {
        label: "Overdue",
        value: overdueCount,
        onPress: () => {
          setPendingFilters({
            category: null,
            tags: [],
            projectId: null,
            overdue: true,
          });
          router.push("/(tabs)/tasks");
        },
      },
      {
        label: "Last reviewed",
        value: formatDate(lastReviewedAt),
        onPress: () => router.push("/(tabs)/review"),
      },
    ],
    [
      inboxCount,
      waitingForCount,
      projectsCount,
      overdueCount,
      lastReviewedAt,
      router,
      setPendingFilters,
    ],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.header}>Home</Text>

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
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* View Today's Tasks Button */}
        <Pressable
          style={({ pressed }) => [
            styles.viewTasksButton,
            pressed && { opacity: theme.interaction.pressedOpacity },
          ]}
          onPress={() => TrueSheet.present("todaySheet")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewTasksButtonText}>
            View Today&apos;s Tasks
          </Text>
        </Pressable>
      </ScrollView>
      <FabButton type="note" name="indexFabPrompt" />
      <TodaySheet />
      <TaskDetailsSheet
        taskId={selectedTaskId ?? ""}
        onDismiss={() => setSelectedTaskId(null)}
      />
    </View>
  );
}
