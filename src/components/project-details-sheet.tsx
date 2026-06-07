import DropdownMenu from "@/components/dropdown-menu";
import FilterSheet, { type FilterSelections } from "@/components/filter-sheet";
import TaskDetailsSheet from "@/components/task-details-sheet";
import TaskItem from "@/components/task-item";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import ToastProvider from "@/providers/toast-provider";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export type ProjectDetailsSheetProps = {
  projectId: string;
  onDismiss: () => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    headerContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacing.xxxxl,
      backgroundColor: theme.colors.background,
      marginBottom: spacing.md,
    },
    headerTitle: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
    },
    titleInput: {
      ...typography.titleLarge,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    descriptionSpacer: {
      height: spacing.md,
    },
    descriptionInput: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      textAlignVertical: "top",
    },
    sectionGap: {
      height: spacing.lg,
    },
    sectionHeader: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.sm,
    },
    taskListContainer: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    emptyState: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      textAlign: "center",
    },
    notFoundContainer: {
      padding: spacing.lg,
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    notFoundText: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
    },
    headerDoneButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
    },
    headerDoneText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      minHeight: 48,
      marginBottom: spacing.md,
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
  });
}

export default function ProjectDetailsSheet({
  projectId,
  onDismiss,
}: ProjectDetailsSheetProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const sheetRef = useRef<TrueSheet>(null);

  const { projectList, updateProject, deleteProject } = useDbProjects();

  const { taskList, completeTask } = useDbTasks();
  const { taskTagList } = useDbTaskTags();

  const project = useMemo(
    () => projectList.find((p) => p.id === projectId),
    [projectList, projectId],
  );

  const projectTasks = useMemo(
    () => taskList.filter((t) => t.projectId === projectId),
    [taskList, projectId],
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [descHeight, setDescHeight] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSelections>({
    category: null,
    tags: [],
    projectId: null,
    overdue: false,
  });

  const now = useCurrentTime();

  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      if (filters.category && task.category !== filters.category) return false;
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((tagId) =>
          taskTagList.some((tt) => tt.taskId === task.id && tt.tagId === tagId),
        );
        if (!hasAllTags) return false;
      }
      if (filters.overdue) {
        if (
          task.dueDate === null ||
          task.dueDate >= now ||
          task.completedAt !== null
        ) {
          return false;
        }
      }
      return true;
    });
  }, [projectTasks, filters, taskTagList, now]);

  const filterCount =
    (filters.category ? 1 : 0) +
    filters.tags.length +
    (filters.overdue ? 1 : 0);

  const hasChangesRef = useRef(false);
  const pendingActionRef = useRef<"archive" | "delete" | null>(null);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    hasChangesRef.current = true;
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
    hasChangesRef.current = true;
  }, []);

  const saveChanges = useCallback(async () => {
    if (!project) return;

    if (!hasChangesRef.current) return;

    await updateProject(project.id, {
      title,
      description,
    });

    hasChangesRef.current = false;
  }, [project, title, description, updateProject]);

  const handleDone = useCallback(async () => {
    await saveChanges();
    sheetRef.current?.dismiss();
  }, [saveChanges]);

  const handleArchiveToggle = useCallback(async () => {
    if (!project) return;
    await saveChanges();
    pendingActionRef.current = "archive";
    sheetRef.current?.dismiss();
  }, [project, saveChanges]);

  const handleDelete = useCallback(() => {
    if (!project) return;
    pendingActionRef.current = "delete";
    sheetRef.current?.dismiss();
  }, [project]);

  const handleTaskPress = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    requestAnimationFrame(() => {
      TrueSheet.present("taskDetailsSheet");
    });
  }, []);

  const descriptionMinHeight = useMemo(
    () => Math.max(48, descHeight),
    [descHeight],
  );

  return (
    <>
      <TrueSheet
        ref={sheetRef}
        name="projectDetailsSheet"
        detents={[1]}
        cornerRadius={theme.borderRadius.xxl}
        grabber
        scrollable
        onWillPresent={() => {
          if (!project) return;
          hasChangesRef.current = false;
          setTitle(project.title);
          setDescription(project.description ?? "");
        }}
        onDidDismiss={() => {
          setTitle("");
          setDescription("");
          setFilters({
            category: null,
            tags: [],
            projectId: null,
            overdue: false,
          });
          setSelectedTaskId(null);
          const action = pendingActionRef.current;
          pendingActionRef.current = null;
          onDismiss();
          if (action === "archive" && project) {
            updateProject(project.id, { isActive: !project.isActive }).then(
              () => {
                Toast.show({
                  type: "success",
                  text1: project.isActive
                    ? "Project archived"
                    : "Project reactivated",
                });
              },
            );
          } else if (action === "delete" && project) {
            deleteProject(project.id).then(() => {
              Toast.show({ type: "success", text1: "Project deleted" });
            });
          }
        }}
        header={
          <>
            <View style={styles.headerContent}>
              <View style={styles.headerRow}>
                <DropdownMenu
                  name="projectDetailsDropdown"
                  options={[
                    {
                      icon:
                        project?.isActive === false
                          ? "refresh-outline"
                          : "archive-outline",
                      label:
                        project?.isActive === false
                          ? "Unarchive Project"
                          : "Archive Project",
                      onPress: handleArchiveToggle,
                    },
                    {
                      icon: "trash",
                      label: "Delete Project",
                      destructive: true,
                      onPress: handleDelete,
                    },
                  ]}
                />
                <Text style={styles.headerTitle}>Edit Project</Text>
                <Pressable
                  style={styles.headerDoneButton}
                  onPress={handleDone}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.headerDoneText}>Done</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Project name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />

              <View style={styles.descriptionSpacer} />

              <TextInput
                style={[
                  styles.descriptionInput,
                  { height: descriptionMinHeight },
                ]}
                value={description}
                onChangeText={handleDescriptionChange}
                onContentSizeChange={(e) =>
                  setDescHeight(e.nativeEvent.contentSize.height)
                }
                placeholder="Description"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.sectionGap} />

              <Text style={styles.sectionHeader}>Tasks</Text>

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
            <ToastProvider />
          </>
        }
      >
        {!project ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Project not found</Text>
          </View>
        ) : projectTasks.length === 0 ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.emptyState}>No tasks in this project</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.emptyState}>No tasks found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={({ item }) => (
              <TaskItem
                title={item.title}
                completed={item.completedAt !== null}
                onPress={() => handleTaskPress(item.id)}
                onCheckboxPress={() => completeTask(item.id)}
              />
            )}
            contentContainerStyle={styles.taskListContainer}
          />
        )}
      </TrueSheet>

      <FilterSheet
        onApply={(sel) => {
          setFilters(sel);
        }}
        availableFilters={["category", "tag", "overdue"]}
        initialSelections={filters}
      />

      <TaskDetailsSheet
        taskId={selectedTaskId ?? ""}
        onDismiss={() => setSelectedTaskId(null)}
      />
    </>
  );
}
