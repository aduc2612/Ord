import ChooserModal from "@/components/chooser-modal";
import DropdownMenu from "@/components/dropdown-menu";
import SegmentedControl from "@/components/segmented-control";
import TaskMetaChooser from "@/components/task-meta-chooser";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { BottomSheet } from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

export type TaskDetailsSheetProps = {
  visible: boolean;
  taskId: string;
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
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    headerTitle: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
    },
    sectionGap: {
      height: spacing.lg,
    },
    titleInput: {
      ...typography.titleLarge,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
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
    dropdownOverlay: {
      flex: 1,
    },
    dropdownMenu: {
      position: "absolute",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      ...theme.shadows.lg,
      paddingVertical: spacing.xs,
      minWidth: 200,
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
    },
    dropdownItemText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      marginLeft: spacing.md,
    },
    dropdownItemTextDestructive: {
      ...typography.bodyMedium,
      color: theme.colors.error,
      marginLeft: spacing.md,
    },
  });
}

export default function TaskDetailsSheet({
  visible,
  taskId,
  onDismiss,
}: TaskDetailsSheetProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { taskList, updateTask, completeTask, deleteTask } = useDbTasks();
  const { addTagToTask, removeTagFromTask, taskTagList } = useDbTaskTags();

  const task = useMemo(
    () => taskList.find((t) => t.id === taskId),
    [taskList, taskId],
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("next_action");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [descHeight, setDescHeight] = useState<number>(0);
  const [showTagChooser, setShowTagChooser] = useState(false);
  const [showProjectChooser, setShowProjectChooser] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const hasChangesRef = useRef(false);
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const lastInitializedTaskIdRef = useRef<string | null>(null);
  const initialTagIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!task) return;

    if (lastInitializedTaskIdRef.current === taskId) return;

    lastInitializedTaskIdRef.current = taskId;
    hasChangesRef.current = false;
    const tagIds = taskTagList
      .filter((tt) => tt.taskId === taskId)
      .map((tt) => tt.tagId);
    initialTagIdsRef.current = tagIds;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setCategory(task.category);
    setSelectedTagIds(tagIds);
    setSelectedProjectId(task.projectId ?? null);
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
  }, [task, taskTagList, taskId]);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    hasChangesRef.current = true;
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
    hasChangesRef.current = true;
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    hasChangesRef.current = true;
  }, []);

  const handleTagSelect = useCallback((ids: string[]) => {
    setSelectedTagIds(ids);
    hasChangesRef.current = true;
  }, []);

  const handleProjectSelect = useCallback((ids: string[]) => {
    setSelectedProjectId(ids.length > 0 ? ids[0] : null);
    hasChangesRef.current = true;
  }, []);

  const handleTagPress = useCallback(() => {
    setShowTagChooser(true);
  }, []);

  const handleProjectPress = useCallback(() => {
    setShowProjectChooser(true);
  }, []);

  const handleDueDatePress = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const handleDatePickerChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (event.type === "set" && selectedDate) {
        setDueDate(selectedDate);
        hasChangesRef.current = true;
      }
    },
    [],
  );

  const saveChanges = useCallback(async () => {
    if (!hasChangesRef.current || !task) return;

    try {
      const isSomeday = category === "someday";

      const initialTagIdsForTask = initialTagIdsRef.current;
      const toRemove = isSomeday
        ? initialTagIdsForTask
        : initialTagIdsForTask.filter((id) => !selectedTagIds.includes(id));
      const toAdd = isSomeday
        ? []
        : selectedTagIds.filter((id) => !initialTagIdsForTask.includes(id));

      await updateTask(task.id, {
        title,
        description: isSomeday ? null : description || null,
        category: category as "next_action" | "waiting_for" | "someday",
        projectId: isSomeday ? null : selectedProjectId,
        dueDate: isSomeday ? null : dueDate ? dueDate.getTime() : null,
      });

      await Promise.all([
        ...toRemove.map((tagId) => removeTagFromTask(task.id, tagId)),
        ...toAdd.map((tagId) => addTagToTask(task.id, tagId)),
      ]);

      hasChangesRef.current = false;
    } catch {
      Toast.show({ type: "error", text1: "Failed to save changes" });
    }
  }, [
    task,
    title,
    description,
    category,
    selectedTagIds,
    selectedProjectId,
    dueDate,
    updateTask,
    addTagToTask,
    removeTagFromTask,
  ]);

  saveRef.current = saveChanges;

  const handleClose = useCallback(() => {
    saveChanges();
    onDismiss();
  }, [saveChanges, onDismiss]);

  const handleMarkComplete = useCallback(async () => {
    if (!task) return;
    await completeTask(task.id);
    Toast.show({ type: "success", text1: "Task completed" });
    onDismiss();
  }, [task, completeTask, onDismiss]);

  const handleDelete = useCallback(async () => {
    if (!task) return;
    await deleteTask(task.id);
    Toast.show({ type: "success", text1: "Task deleted" });
    onDismiss();
  }, [task, deleteTask, onDismiss]);

  const scrollContentStyle = useMemo(
    () => styles.scrollContent,
    [styles.scrollContent],
  );

  const descriptionMinHeight = useMemo(
    () => Math.max(48, descHeight),
    [descHeight],
  );

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      onDismiss={onDismiss}
      // snapPoints={["50%", "90%"]}
      enablePanDownToClose
    >
      {!task ? (
        <View style={{ padding: spacing.lg }}>
          <Text style={styles.headerTitle}>Task not found</Text>
        </View>
      ) : (
        <>
          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={scrollContentStyle}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerRow}>
                <DropdownMenu
                  options={[
                    {
                      icon: "checkmark-circle",
                      label: "Mark Complete",
                      onPress: handleMarkComplete,
                    },
                    {
                      icon: "trash",
                      label: "Delete Task",
                      destructive: true,
                      onPress: handleDelete,
                    },
                  ]}
                />
                <Text style={styles.headerTitle}>Edit Task</Text>
                <Pressable
                  style={styles.headerDoneButton}
                  onPress={handleClose}
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
                placeholder="Task name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />

              <View style={{ height: spacing.md }} />

              {category !== "someday" ? (
                <>
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
                </>
              ) : null}

              <SegmentedControl
                options={[
                  { label: "Next", value: "next_action" },
                  { label: "Waiting For", value: "waiting_for" },
                  { label: "Someday", value: "someday" },
                ]}
                selectedValue={category}
                onSelect={handleCategoryChange}
              />

              <View style={styles.sectionGap} />

              {category !== "someday" ? (
                <TaskMetaChooser
                  selectedTagIds={selectedTagIds}
                  selectedProjectId={selectedProjectId}
                  dueDate={dueDate}
                  onTagPress={handleTagPress}
                  onProjectPress={handleProjectPress}
                  onDueDatePress={handleDueDatePress}
                />
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>

          <ChooserModal
            type="tag"
            visible={showTagChooser}
            selectedIds={selectedTagIds}
            onClose={() => setShowTagChooser(false)}
            onSelect={handleTagSelect}
          />
          <ChooserModal
            type="project"
            visible={showProjectChooser}
            selectedIds={selectedProjectId ? [selectedProjectId] : []}
            onClose={() => setShowProjectChooser(false)}
            onSelect={handleProjectSelect}
          />
          {showDatePicker ? (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleDatePickerChange}
            />
          ) : null}
        </>
      )}
    </BottomSheet>
  );
}
