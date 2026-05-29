import type { FilterSelections } from "@/components/filter-bottom-sheet";
import FilterBottomSheet from "@/components/filter-bottom-sheet";
import ProjectDetailsSheet from "@/components/project-details-sheet";
import PromptModal from "@/components/prompt-modal";
import TaskDetailsSheet from "@/components/task-details-sheet";
import {
  borderRadius,
  componentStyles,
  spacing,
  typography,
} from "@/constants/theme";
import type { Tag, Task } from "@/db/schema";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTags } from "@/hooks/use-db-tags";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
    editSmallButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.tertiaryContainer,
    },
    editSmallButtonText: {
      ...typography.labelSmall,
      color: theme.colors.onTertiaryContainer,
    },
  });
}

function TaskItem({
  task,
  tags,
  styles,
  onComplete,
  onDelete,
  onEdit,
}: {
  task: Task;
  tags: Tag[];
  styles: ReturnType<typeof createStyles>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const isCompleted = task.completedAt != null;
  const taskTags = tags.filter((t) => t.id != null);

  return (
    <View style={styles.resultItem}>
      <View style={styles.taskRow}>
        <View style={styles.taskInfo}>
          <Text
            style={isCompleted ? styles.taskTitleCompleted : styles.taskTitle}
          >
            {task.title}
          </Text>
          <Text style={styles.taskMeta}>
            {task.category}
            {task.dueDate
              ? ` | Due: ${new Date(task.dueDate).toLocaleDateString()}`
              : ""}
            {isCompleted
              ? ` | Completed: ${new Date(task.completedAt!).toLocaleDateString()}`
              : ""}
          </Text>
          {task.description ? (
            <Text style={[styles.taskMeta, { marginTop: 2 }]}>
              {task.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.taskActions}>
          {!isCompleted ? (
            <Pressable
              style={styles.smallButton}
              onPress={() => onComplete(task.id)}
            >
              <Text style={styles.smallButtonText}>Done</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={styles.editSmallButton}
            onPress={() => onEdit(task.id)}
          >
            <Text style={styles.editSmallButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={styles.smallDangerButton}
            onPress={() => onDelete(task.id)}
          >
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
  const { claims } = useAuthContext();
  const userId = claims?.sub as string | undefined;

  const tasks = useDbTasks();
  const projects = useDbProjects();
  const tags = useDbTags();
  const taskTags = useDbTaskTags();
  const notes = useDbNotes();

  const loading =
    tasks.loading ||
    projects.loading ||
    tags.loading ||
    taskTags.loading ||
    notes.loading;
  const ready =
    tasks.ready &&
    projects.ready &&
    tags.ready &&
    taskTags.ready &&
    notes.ready;
  const error =
    tasks.error ||
    projects.error ||
    tags.error ||
    taskTags.error ||
    notes.error;

  const loadAll = () => {
    Promise.all([
      tasks.loadTasks(),
      projects.loadProjects(),
      tags.loadTags(),
      taskTags.loadTaskTags(),
    ]);
  };

  const [prompt, setPrompt] = useState<{
    visible: boolean;
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({
    visible: false,
    title: "",
    message: "",
    defaultValue: "",
    onConfirm: () => {},
  });

  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [sheetProjectId, setSheetProjectId] = useState<string | null>(null);

  // Filter bottom sheet test state
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filterSheetConfig, setFilterSheetConfig] = useState<
    ("category" | "tag" | "project")[]
  >(["category", "tag", "project"]);
  const [appliedFilters, setAppliedFilters] = useState<FilterSelections | null>(
    null,
  );

  const editTaskTitle = (taskId: string) => {
    setSheetTaskId(taskId);
  };

  const editNoteTitle = (noteId: string, currentTitle: string) => {
    setPrompt({
      visible: true,
      title: "Edit Note",
      message: "Enter a new title for this note:",
      defaultValue: currentTitle,
      onConfirm: (newTitle) => {
        if (newTitle.trim()) {
          notes.updateNote(noteId, { title: newTitle.trim() });
        }
      },
    });
  };

  const editTagTitle = (tagId: string, currentTitle: string) => {
    setPrompt({
      visible: true,
      title: "Edit Tag",
      message: "Enter a new title for this tag:",
      defaultValue: currentTitle,
      onConfirm: (newTitle) => {
        if (newTitle.trim()) {
          tags.updateTag(tagId, { title: newTitle.trim() });
        }
      },
    });
  };

  const getTagsForTask = (taskId: string): Tag[] => {
    const tagIds = taskTags.taskTagList
      .filter((tt) => tt.taskId === taskId)
      .map((tt) => tt.tagId);
    return tags.tagList.filter((t) => tagIds.includes(t.id));
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
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
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
          <Text style={styles.sectionTitle}>
            Tasks ({tasks.taskList.length})
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => tasks.insertTask({ category: "next_action" })}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Next</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => tasks.insertTask({ category: "waiting_for" })}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Waiting</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => tasks.insertTask({ category: "someday" })}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Someday</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={tasks.deleteAllTasks}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Tasks</Text>
            </Pressable>
          </View>
          {!ready ? (
            <Text style={styles.statusText}>Loading...</Text>
          ) : tasks.taskList.length === 0 ? (
            <Text style={styles.statusText}>No tasks yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {tasks.taskList.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  tags={getTagsForTask(task.id)}
                  styles={styles}
                  onComplete={tasks.completeTask}
                  onDelete={tasks.deleteTask}
                  onEdit={editTaskTitle}
                />
              ))}
            </View>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Notes ({notes.noteList.length})
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => notes.insertNote()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Note</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={notes.deleteAllNotes}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Notes</Text>
            </Pressable>
          </View>
          {notes.noteList.length === 0 ? (
            <Text style={styles.statusText}>No notes yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {notes.noteList.map((note, index) => (
                <View
                  key={note.id}
                  style={
                    index === notes.noteList.length - 1
                      ? styles.taskRowLast
                      : styles.taskRow
                  }
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{note.title}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <Pressable
                      style={styles.editSmallButton}
                      onPress={() => editNoteTitle(note.id, note.title)}
                    >
                      <Text style={styles.editSmallButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.smallDangerButton}
                      onPress={() => notes.deleteNote(note.id)}
                    >
                      <Text style={styles.smallDangerButtonText}>Del</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Projects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Projects ({projects.projectList.length})
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => projects.insertProject()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Project</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={projects.deleteAllProjects}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Projects</Text>
            </Pressable>
          </View>
          {projects.projectList.length === 0 ? (
            <Text style={styles.statusText}>No projects yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {projects.projectList.map((project, index) => (
                <View
                  key={project.id}
                  style={
                    index === projects.projectList.length - 1
                      ? styles.taskRowLast
                      : styles.taskRow
                  }
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
                      style={styles.editSmallButton}
                      onPress={() => setSheetProjectId(project.id)}
                    >
                      <Text style={styles.editSmallButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.smallButton}
                      onPress={() =>
                        projects.toggleProject(project.id, project.isActive)
                      }
                    >
                      <Text style={styles.smallButtonText}>
                        {project.isActive ? "Deactivate" : "Activate"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.smallDangerButton}
                      onPress={() => projects.deleteProject(project.id)}
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
          <Text style={styles.sectionTitle}>Tags ({tags.tagList.length})</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => tags.insertTag()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>+ Tag</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                {
                  opacity:
                    pressed || loading ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={tags.deleteAllTags}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>Delete All Tags</Text>
            </Pressable>
          </View>
          {tags.tagList.length === 0 ? (
            <Text style={styles.statusText}>No tags yet</Text>
          ) : (
            <View style={styles.resultContainer}>
              {tags.tagList.map((tag, index) => (
                <View
                  key={tag.id}
                  style={
                    index === tags.tagList.length - 1
                      ? styles.taskRowLast
                      : styles.taskRow
                  }
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{tag.title}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <Pressable
                      style={styles.editSmallButton}
                      onPress={() => editTagTitle(tag.id, tag.title)}
                    >
                      <Text style={styles.editSmallButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.smallDangerButton}
                      onPress={() => tags.deleteTag(tag.id)}
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
        {tasks.taskList.length > 0 && tags.tagList.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link Tags to Tasks</Text>
            <View style={styles.resultContainer}>
              {tasks.taskList.map((task) => {
                const linkedTagIds = taskTags.taskTagList
                  .filter((tt) => tt.taskId === task.id)
                  .map((tt) => tt.tagId);
                const availableTags = tags.tagList.filter(
                  (t) => !linkedTagIds.includes(t.id),
                );

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
                              {
                                opacity: pressed
                                  ? theme.interaction.pressedOpacity
                                  : 1,
                              },
                            ]}
                            onPress={() =>
                              taskTags.addTagToTask(task.id, tag.id)
                            }
                          >
                            <Text style={styles.secondaryButtonText}>
                              + {tag.title}
                            </Text>
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
                  {
                    opacity:
                      pressed || loading ? theme.interaction.pressedOpacity : 1,
                  },
                ]}
                onPress={taskTags.deleteAllTaskTags}
                disabled={loading}
              >
                <Text style={styles.dangerButtonText}>Clear All Links</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Filter Bottom Sheet Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter Bottom Sheet</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  opacity: pressed ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => {
                setFilterSheetConfig(["category", "tag", "project"]);
                setFilterSheetVisible(true);
              }}
            >
              <Text style={styles.buttonText}>All Filters</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  opacity: pressed ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => {
                setFilterSheetConfig(["category", "tag"]);
                setFilterSheetVisible(true);
              }}
            >
              <Text style={styles.secondaryButtonText}>Cat + Tag</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  opacity: pressed ? theme.interaction.pressedOpacity : 1,
                },
              ]}
              onPress={() => {
                setFilterSheetConfig(["tag"]);
                setFilterSheetVisible(true);
              }}
            >
              <Text style={styles.secondaryButtonText}>Tag Only</Text>
            </Pressable>
          </View>
          {appliedFilters ? (
            <View style={styles.resultContainer}>
              <Text style={styles.taskTitle}>Applied Filters:</Text>
              <Text style={styles.taskMeta}>
                Category: {appliedFilters.category ?? "None"}
              </Text>
              <Text style={styles.taskMeta}>
                Tags:{" "}
                {appliedFilters.tags.length > 0
                  ? appliedFilters.tags
                      .map((id) => {
                        const tag = tags.tagList.find((t) => t.id === id);
                        return tag?.title ?? id;
                      })
                      .join(", ")
                  : "None"}
              </Text>
              <Text style={styles.taskMeta}>
                Project:{" "}
                {appliedFilters.projectId
                  ? (() => {
                      const proj = projects.projectList.find(
                        (p) => p.id === appliedFilters.projectId,
                      );
                      return proj?.title ?? appliedFilters.projectId;
                    })()
                  : "None"}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <PromptModal
        visible={prompt.visible}
        title={prompt.title}
        message={prompt.message}
        defaultValue={prompt.defaultValue}
        onConfirm={prompt.onConfirm}
        onCancel={() => setPrompt((p) => ({ ...p, visible: false }))}
      />
      {sheetTaskId ? (
        <TaskDetailsSheet
          visible={!!sheetTaskId}
          taskId={sheetTaskId}
          onDismiss={() => setSheetTaskId(null)}
        />
      ) : null}
      {sheetProjectId ? (
        // <ProjectDetailsSheet
        //   visible={!!sheetProjectId}
        //   projectId={sheetProjectId}
        //   onDismiss={() => setSheetProjectId(null)}
        // />
        <ProjectDetailsSheet
          visible={sheetProjectId !== null}
          projectId={sheetProjectId ?? ""}
          onDismiss={() => {
            setSheetProjectId(null);
          }}
        />
      ) : null}
      <FilterBottomSheet
        visible={filterSheetVisible}
        availableFilters={filterSheetConfig}
        initialSelections={appliedFilters ?? undefined}
        onDismiss={() => setFilterSheetVisible(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setFilterSheetVisible(false);
        }}
      />
    </View>
  );
}
