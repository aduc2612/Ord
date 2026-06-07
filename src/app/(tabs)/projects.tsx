import FabButton from "@/components/fab-button";
import ProjectDetailsSheet from "@/components/project-details-sheet";
import ProjectItem from "@/components/project-item";
import SearchBar from "@/components/search-bar";
import { spacing, typography } from "@/constants/theme";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerWrapper: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
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

export default function ProjectsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const { projectList } = useDbProjects();
  const { taskList } = useDbTasks();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const projectStats = useMemo(() => {
    return projectList
      .filter((project) => project.isActive !== false)
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
    if (!searchQuery.trim()) return projectStats;
    const query = searchQuery.toLowerCase().trim();
    return projectStats.filter((p) => p.title.toLowerCase().includes(query));
  }, [projectStats, searchQuery]);

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
    ({ item }: { item: (typeof projectStats)[number] }) => (
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
      <View
        style={[styles.headerWrapper, { paddingTop: insets.top + spacing.lg }]}
      >
        <Text style={styles.header}>Projects</Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search projects"
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
          <Text style={styles.emptyText}>No projects found</Text>
        }
      />

      <FabButton type="project" name="projectsFabPrompt" />

      <ProjectDetailsSheet
        projectId={selectedProjectId ?? ""}
        onDismiss={handleDismiss}
      />
    </View>
  );
}
