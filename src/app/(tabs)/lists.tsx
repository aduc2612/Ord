import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { useMemo } from "react";
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
    },
    listItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      minHeight: 48,
      // ...shadows.md,
    },
    label: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    count: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      fontWeight: "600",
    },
  });
}

export default function ListsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { taskList } = useDbTasks();
  const { projectList } = useDbProjects();
  const { noteList } = useDbNotes();

  const listItems = useMemo(() => {
    const activeTasks = taskList.filter((t) => t.completedAt === null).length;
    const completedTasks = taskList.filter(
      (t) => t.completedAt !== null,
    ).length;
    const activeProjects = projectList.filter(
      (p) => p.isActive !== false,
    ).length;
    const archivedProjects = projectList.filter(
      (p) => p.isActive === false,
    ).length;
    return [
      { id: "inbox", label: "Inbox", count: noteList.length },
      { id: "projects", label: "Projects", count: activeProjects },
      { id: "tasks", label: "Tasks", count: activeTasks },
      {
        id: "completed",
        label: "Completed",
        count: completedTasks,
      },
      {
        id: "archived",
        label: "Archived",
        count: archivedProjects,
      },
    ];
  }, [taskList, projectList, noteList]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.tabBar,
          },
        ]}
      >
        <Text style={styles.header}>Lists</Text>
        {listItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.listItem}
            onPress={() => {
              if (item.id === "inbox") {
                router.push("/(tabs)/inbox");
              } else if (item.id === "projects") {
                router.push("/(tabs)/projects");
              } else if (item.id === "tasks") {
                router.push("/(tabs)/tasks");
              } else if (item.id === "completed") {
                router.push("/(tabs)/completed-tasks");
              } else if (item.id === "archived") {
                router.push("/(tabs)/archived-projects");
              }
            }}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.count}>{item.count}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
