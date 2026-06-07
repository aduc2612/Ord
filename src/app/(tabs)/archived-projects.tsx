import ProjectDetailsSheet from "@/components/project-details-sheet";
import ProjectItem from "@/components/project-item";
import SearchBar from "@/components/search-bar";
import { spacing, typography } from "@/constants/theme";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ArchivedProjectsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom, insets.top);

  const { projectList } = useDbProjects();
  const { taskList } = useDbTasks();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter to archived projects only
  const archivedProjectStats = useMemo(() => {
    return projectList
      .filter((project) => project.isActive === false)
      .map((project) => {
        const projectTasks = taskList.filter((t) => t.projectId === project.id);
        const completed = projectTasks.filter(
          (t) => t.completedAt !== null,
        ).length;
        const total = projectTasks.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...project, completed, total, percent };
      });
  }, [projectList, taskList]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return archivedProjectStats;
    const query = searchQuery.toLowerCase().trim();
    return archivedProjectStats.filter((p) =>
      p.title.toLowerCase().includes(query),
    );
  }, [archivedProjectStats, searchQuery]);

  const handleProjectPress = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    requestAnimationFrame(() => {
      TrueSheet.present("projectDetailsSheet");
    });
  }, []);

  const handleDismiss = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof archivedProjectStats)[number] }) => (
      <ProjectItem
        title={item.title}
        completed={item.completed}
        total={item.total}
        percent={item.percent}
        onPress={() => handleProjectPress(item.id)}
      />
    ),
    [handleProjectPress],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={styles.header}>Archived Projects</Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search archived projects"
        />
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.tabBar,
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No archived projects found</Text>
        }
      />

      <ProjectDetailsSheet
        projectId={selectedProjectId ?? ""}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

function createStyles(theme: Theme, insetsBottom: number, insetsTop: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: insetsBottom + spacing.tabBar,
    },
    headerWrapper: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      paddingTop: insetsTop + spacing.lg,
    },
    searchWrapper: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    emptyText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      paddingVertical: spacing.xl,
    },
  });
}
