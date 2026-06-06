import SearchBar from "@/components/search-bar";
import TaskItem from "@/components/task-item";
import { spacing, typography } from "@/constants/theme";
import type { Task } from "@/db/schema";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompletedTasksScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const { taskList, uncompleteTask } = useDbTasks();
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search on focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery("");
      };
    }, []),
  );

  // Filter to completed tasks only
  const completedTasks = useMemo(() => {
    return taskList.filter((task) => task.completedAt !== null);
  }, [taskList]);

  // Apply search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return completedTasks;
    const query = searchQuery.toLowerCase().trim();
    return completedTasks.filter((task) =>
      task.title.toLowerCase().includes(query),
    );
  }, [completedTasks, searchQuery]);

  // Sort by completedAt descending (most recently completed first)
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort(
      (a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0),
    );
  }, [filteredTasks]);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <View style={styles.taskItemWrapper}>
        <TaskItem
          title={item.title}
          completed={true}
          onPress={() => {}}
          onCheckboxPress={() => uncompleteTask(item.id)}
        />
      </View>
    ),
    [uncompleteTask, styles.taskItemWrapper],
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.tabBar }]}>
      <View
        style={[styles.topSection, { paddingTop: insets.top + spacing.lg }]}
      >
        <View style={styles.headerWrapper}>
          <Text style={styles.header}>Completed</Text>
        </View>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search completed tasks"
          />
        </View>
      </View>

      <FlatList
        data={sortedTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No completed tasks found</Text>
        }
      />
    </View>
  );
}

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
