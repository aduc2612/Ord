import {
  borderRadius,
  componentStyles,
  spacing,
  typography,
} from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useDbTest } from "@/hooks/use-db-test";
import type { Task, Tag } from "@/db/schema";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: spacing.lg,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    userIdText: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.xl,
    },
    section: {
      gap: spacing.md,
    },
    sectionTitle: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
    },
    buttonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    button: {
      ...componentStyles.button,
      backgroundColor: theme.colors.primary,
      flex: 1,
      minWidth: 100,
    },
    buttonText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
    },
    secondaryButton: {
      ...componentStyles.button,
      backgroundColor: theme.colors.secondaryContainer,
      flex: 1,
      minWidth: 100,
    },
    secondaryButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onSecondaryContainer,
    },
    dangerButton: {
      ...componentStyles.button,
      backgroundColor: theme.colors.errorContainer,
      flex: 1,
      minWidth: 100,
    },
    dangerButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onErrorContainer,
    },
    resultContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...theme.shadows.sm,
    },
    resultTitle: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
      marginBottom: spacing.sm,
    },
    resultItem: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
    },
    resultItemLast: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xs,
    },
    statusText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: spacing.xl,
    },
    taskRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
    },
    taskRowLast: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.xs,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    taskTitleCompleted: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textDecorationLine: "line-through",
    },
    taskMeta: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    taskActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    smallButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.secondaryContainer,
    },
    smallButtonText: {
      ...typography.labelSmall,
      color: theme.colors.onSecondaryContainer,
    },
    smallDangerButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.errorContainer,
    },
    smallDangerButtonText: {
      ...typography.labelSmall,
      color: theme.colors.onErrorContainer,
    },
    tagChip: {
      ...componentStyles.chip,
      backgroundColor: theme.colors.tertiaryContainer,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    tagChipText: {
      ...typography.labelSmall,
      color: theme.colors.onTertiaryContainer,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing.xs,
    },
    linkButton: {
      ...typography.labelSmall,
      color: theme.colors.primary,
      paddingVertical: spacing.xs,
    },
  });
}

function TaskItem({ task, tags, styles, onComplete, onDelete, onAddTag }: {
  task: Task;
  tags: Tag[];
  styles: ReturnType<typeof createStyles>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTag: (taskId: string, tagId: string) => void;
}) {
  const isCompleted = task.completedAt != null;
  const taskTags = tags.filter((t) => t.id != null);

  return (
    <View style={styles.resultItem}>
      <View style={styles.taskRow}>
        <View style={styles.taskInfo}>
          <Text style={isCompleted ? styles.taskTitleCompleted : styles.taskTitle}>
            {task.title}
          </Text>
          <Text style={styles.taskMeta}>
            {task.category}
            {task.dueDate ? ` | Due: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
            {isCompleted ? ` | Completed: ${new Date(task.completedAt!).toLocaleDateString()}` : ""}
          </Text>
          {task.description ? (
            <Text style={[styles.taskMeta, { marginTop: 2 }]}>{task.description}</Text>
          ) : null}
        </View>
        <View style={styles.taskActions}>
          {!isCompleted ? (
            <Pressable style={styles.smallButton} onPress={() => onComplete(task.id)}>
              <Text style={styles.smallButtonText}>Done</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.smallDangerButton} onPress={() => onDelete(task.id)}>
            <Text style={styles.smallDangerButtonText}>Del</Text>
          </Pressable>
        </View>
      </View>
      {taskTags.length > 0 ? (
        <View style={styles.tagRow}>
          {taskTags.map((tag) => (
            <View key={tag.id} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag.title}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function DbTestScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const {
    userId,
    taskList,
    projectList,
    tagList,
    taskTagList,
    loading,
    ready,
    error,
    loadAll,
    insertTask,
    completeTask,
    deleteTask,
    deleteAllTasks,
    insertProject,
    toggleProject,
    deleteProject,
    deleteAllProjects,
    insertTag,
    deleteTag,
    deleteAllTags,
    addTagToTask,
    deleteAllTaskTags,
  } = useDbTest();

  const getTagsForTask = (taskId: string): Tag[] => {
    const tagIds = taskTagList.filter((tt) => tt.taskId === taskId).map((tt) => tt.tagId);
    return tagList.filter((t) => tagIds.includes(t.id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Database Test</Text>
        <Text style={styles.userIdText}>User: {userId ?? "Not logged in"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Global Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={loadAll}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Refresh All</Text>
            </Pressable>
          </View>
          {error ? (
            <Text style={styles.statusText}>
              Error: {typeof error === "string" ? error : error.message}
            </Text>
          ) : null}
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks ({taskList.length})</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={() => insertTask("inbox")}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Inbox</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={() => insertTask("next_action")}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Next</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={() => insertTask("waiting_for")}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Waiting</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={() => insertTask("someday")}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Someday</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={deleteAllTasks}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Tasks</Text>
            </Pressable>
          </View>
          {!ready ? (
            <Text style={styles.statusText}>Loading...</Text>
          ) : taskList.length === 0 ? (
            <Text style={styles.statusText}>No tasks yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {taskList.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  tags={getTagsForTask(task.id)}
                  styles={styles}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onAddTag={addTagToTask}
                />
              ))}
            </View>
          )}
        </View>

        {/* Projects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects ({projectList.length})</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={insertProject}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Project</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={deleteAllProjects}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Projects</Text>
            </Pressable>
          </View>
          {projectList.length === 0 ? (
            <Text style={styles.statusText}>No projects yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {projectList.map((project, index) => (
                <View
                  key={project.id}
                  style={index === projectList.length - 1 ? styles.taskRowLast : styles.taskRow}
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>
                      {project.title} {project.isActive ? "" : "(inactive)"}
                    </Text>
                    {project.description ? (
                      <Text style={styles.taskMeta}>{project.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.taskActions}>
                    <Pressable
                      style={styles.smallButton}
                      onPress={() => toggleProject(project.id, project.isActive)}
                    >
                      <Text style={styles.smallButtonText}>
                        {project.isActive ? "Deactivate" : "Activate"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.smallDangerButton}
                      onPress={() => deleteProject(project.id)}
                    >
                      <Text style={styles.smallDangerButtonText}>Del</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags ({tagList.length})</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={insertTag}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Tag</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={deleteAllTags}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Tags</Text>
            </Pressable>
          </View>
          {tagList.length === 0 ? (
            <Text style={styles.statusText}>No tags yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {tagList.map((tag, index) => (
                <View
                  key={tag.id}
                  style={index === tagList.length - 1 ? styles.taskRowLast : styles.taskRow}
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{tag.title}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <Pressable
                      style={styles.smallDangerButton}
                      onPress={() => deleteTag(tag.id)}
                    >
                      <Text style={styles.smallDangerButtonText}>Del</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Task-Tag Linking Section */}
        {taskList.length > 0 && tagList.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link Tags to Tasks</Text>
            <View style={styles.resultContainer}>
              {taskList.map((task) => {
                const linkedTagIds = taskTagList
                  .filter((tt) => tt.taskId === task.id)
                  .map((tt) => tt.tagId);
                const availableTags = tagList.filter((t) => !linkedTagIds.includes(t.id));

                return (
                  <View key={task.id} style={{ marginBottom: spacing.md }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {availableTags.length > 0 ? (
                      <View style={styles.buttonRow}>
                        {availableTags.slice(0, 3).map((tag) => (
                          <Pressable
                            key={tag.id}
                            style={({ pressed }) => [
                              styles.secondaryButton,
                              { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
                            ]}
                            onPress={() => addTagToTask(task.id, tag.id)}
                          >
                            <Text style={styles.secondaryButtonText}>+ {tag.title}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.taskMeta}>All tags linked</Text>
                    )}
                  </View>
                );
              })}
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.dangerButton,
                  { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
                ]}
                onPress={deleteAllTaskTags}
                disabled={loading}
              >
                <Text style={styles.dangerButtonText}>Clear All Links</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
