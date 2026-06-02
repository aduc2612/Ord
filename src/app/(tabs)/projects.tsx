import FabButton from "@/components/fab-button";
import ProjectDetailsSheet from "@/components/project-details-sheet";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
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
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      minHeight: 48,
    },
    cardLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    cardTitle: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
    },
    cardSubtitle: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    progressLabel: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
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

  const projectStats = useMemo(() => {
    return projectList.map((project) => {
      const projectTasks = taskList.filter((t) => t.projectId === project.id);
      const completed = projectTasks.filter(
        (t) => t.completedAt !== null,
      ).length;
      const total = projectTasks.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...project, completed, total, percent };
    });
  }, [projectList, taskList]);

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
    ({
      item,
    }: {
      item: (typeof projectStats)[number];
    }) => (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: theme.interaction.pressedOpacity },
        ]}
        onPress={() => handleProjectPress(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>
            {item.completed}/{item.total} completed
          </Text>
        </View>
        <AnimatedCircularProgress
          size={48}
          width={4}
          fill={item.percent}
          tintColor={theme.colors.primary}
          backgroundColor={theme.colors.outlineVariant}
          lineCap="round"
          rotation={0}
        >
          {() => (
            <Text style={styles.progressLabel}>{item.percent}%</Text>
          )}
        </AnimatedCircularProgress>
      </Pressable>
    ),
    [handleProjectPress, styles, theme],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.header}>Projects</Text>
      </View>

      <FlatList
        data={projectStats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No projects yet</Text>
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
