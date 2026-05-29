import DropdownMenu from "@/components/dropdown-menu";
import FilterBottomSheet, {
  type FilterSelections,
} from "@/components/filter-bottom-sheet";
import TaskDetailsSheet from "@/components/task-details-sheet";
import TaskItem from "@/components/task-item";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import {
  BottomSheet,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export type ProjectDetailsSheetProps = {
  visible: boolean;
  projectId: string;
  onDismiss: () => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    keyboardAvoiding: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    },
    emptyState: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xl,
      textAlign: "center",
    },
    notFoundContainer: {
      padding: spacing.lg,
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
  visible,
  projectId,
  onDismiss,
}: ProjectDetailsSheetProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const sheetRef = useRef<BottomSheetMethods>(null);

  const { projectList, updateProject, deleteProject } = useDbProjects();

  const { taskList } = useDbTasks();
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
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterSelections>({
    category: null,
    tags: [],
    projectId: null,
  });

  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      if (filters.category && task.category !== filters.category) return false;
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((tagId) =>
          taskTagList.some((tt) => tt.taskId === task.id && tt.tagId === tagId),
        );
        if (!hasAllTags) return false;
      }
      return true;
    });
  }, [projectTasks, filters, taskTagList]);

  const filterCount = (filters.category ? 1 : 0) + filters.tags.length;

  const hasChangesRef = useRef(false);
  const lastInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!project || !visible) return;

    if (lastInitializedRef.current === projectId) return;

    lastInitializedRef.current = projectId;

    setTitle(project.title);
    setDescription(project.description ?? "");

    hasChangesRef.current = false;
  }, [project, projectId, visible]);

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

    sheetRef.current?.close();

    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [saveChanges, onDismiss]);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();

    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [onDismiss]);

  const handleArchiveToggle = useCallback(async () => {
    if (!project) return;

    await saveChanges();

    sheetRef.current?.close();

    setTimeout(async () => {
      onDismiss();

      await updateProject(project.id, {
        isActive: !project.isActive,
      });

      Toast.show({
        type: "success",
        text1: project.isActive ? "Project archived" : "Project reactivated",
      });
    }, 300);
  }, [project, updateProject, onDismiss, saveChanges]);

  const handleDelete = useCallback(async () => {
    if (!project) return;

    sheetRef.current?.close();

    setTimeout(async () => {
      onDismiss();

      await deleteProject(project.id);

      Toast.show({
        type: "success",
        text1: "Project deleted",
      });
    }, 300);
  }, [project, deleteProject, onDismiss]);

  const handleTaskPress = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const descriptionMinHeight = useMemo(
    () => Math.max(48, descHeight),
    [descHeight],
  );

  if (!visible) {
    return null;
  }

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        key={projectId}
        index={0}
        enablePanDownToClose
        onDismiss={handleClose}
      >
        {!project ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Project not found</Text>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerRow}>
                <DropdownMenu
                  options={[
                    {
                      icon: project.isActive
                        ? "archive-outline"
                        : "refresh-outline",
                      label: project.isActive
                        ? "Archive Project"
                        : "Unarchive Project",
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

              <View style={styles.sectionGap} />

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
                onPress={() => setFilterVisible(true)}
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

              {projectTasks.length === 0 ? (
                <Text style={styles.emptyState}>No tasks in this project</Text>
              ) : filteredTasks.length === 0 ? (
                <Text style={styles.emptyState}>No tasks found</Text>
              ) : (
                <FlashList
                  data={filteredTasks}
                  renderItem={({ item }) => (
                    <TaskItem
                      title={item.title}
                      onPress={() => handleTaskPress(item.id)}
                    />
                  )}
                  contentContainerStyle={styles.taskListContainer}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </BottomSheet>

      <FilterBottomSheet
        visible={filterVisible}
        onDismiss={() => setFilterVisible(false)}
        onApply={(sel) => {
          setFilters(sel);
          setFilterVisible(false);
        }}
        availableFilters={["category", "tag"]}
        initialSelections={filters}
      />

      {selectedTaskId ? (
        <TaskDetailsSheet
          visible={true}
          taskId={selectedTaskId}
          onDismiss={() => setSelectedTaskId(null)}
        />
      ) : null}
    </>
  );
}
