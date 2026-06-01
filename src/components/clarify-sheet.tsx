import ChooserModal from "@/components/chooser-modal";
import SegmentedControl from "@/components/segmented-control";
import TaskMetaChooser from "@/components/task-meta-chooser";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import NetworkToastProvider from "@/providers/network-toast-provider";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    stickyHeader: {
      paddingTop: spacing.xxxxl,
      backgroundColor: theme.colors.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerCloseButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    headerNextButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    headerNextText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
    },
    progressWrapper: {
      flex: 1,
      marginHorizontal: spacing.md,
    },
    progressTrack: {
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.round,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.round,
    },
    clarifyingText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      paddingBottom: spacing.lg,
    },
    sectionGap: {
      height: spacing.lg,
    },
    actionLabel: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
      marginBottom: spacing.sm,
    },
    actionInput: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    doneHelperText: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: spacing.sm,
    },
  });
}

type PrimaryAction = "" | "trash" | "someday" | "actionable";
type SecondaryAction = "" | "done_2min" | "delegate" | "defer";

export default function ClarifySheet({
  noteId,
  noteQueue,
  onDismiss,
  onProcessed,
}: {
  noteId: string;
  noteQueue: string[];
  onDismiss: () => void;
  onProcessed: (nextId: string | null, remainingQueue: string[]) => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const sheetRef = useRef<TrueSheet>(null);
  const { noteList, deleteNote } = useDbNotes();
  const { insertTask } = useDbTasks();
  const { addTagToTask } = useDbTaskTags();

  const [primaryAction, setPrimaryAction] = useState<PrimaryAction>("");
  const [secondaryAction, setSecondaryAction] = useState<SecondaryAction>("");
  const [actionText, setActionText] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showTagChooser, setShowTagChooser] = useState(false);
  const [showProjectChooser, setShowProjectChooser] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const totalNotes = noteQueue.length + 1;
  const currentIndex = totalNotes - noteQueue.length - 1;
  const progress =
    totalNotes > 0 ? Math.min((currentIndex + 1) / totalNotes, 1) : 0;

  const currentNote = useMemo(
    () => noteList.find((n) => n.id === noteId),
    [noteList, noteId],
  );

  const handleNext = useCallback(async () => {
    if (!primaryAction) {
      Toast.show({ type: "error", text1: "Please select an action" });
      return;
    }

    if (primaryAction === "actionable") {
      if (!secondaryAction) {
        Toast.show({ type: "error", text1: "Please select a sub-action" });
        return;
      }
      if (!actionText.trim()) {
        Toast.show({
          type: "error",
          text1: "Please enter a next action",
        });
        return;
      }
    }

    if (!currentNote) return;

    if (primaryAction === "trash") {
      await deleteNote(currentNote.id);
    } else if (primaryAction === "someday") {
      try {
        const taskId = await insertTask({
          category: "someday",
          title: currentNote.title,
        });
        if (!taskId) {
          Toast.show({ type: "error", text1: "Failed to create task" });
          return;
        }
        if (selectedTagIds.length > 0) {
          await Promise.all(
            selectedTagIds.map((tagId) => addTagToTask(taskId, tagId)),
          );
        }
        await deleteNote(currentNote.id);
      } catch {
        Toast.show({
          type: "error",
          text1: "An error occurred. The note was not deleted.",
        });
        return;
      }
    } else if (primaryAction === "actionable") {
      try {
        let taskId: string | undefined;

        if (secondaryAction === "done_2min") {
          taskId = await insertTask({
            category: "next_action",
            title: actionText.trim(),
          });
        } else if (secondaryAction === "delegate") {
          taskId = await insertTask({
            category: "waiting_for",
            title: actionText.trim(),
            projectId: selectedProjectId,
            dueDate: dueDate?.getTime() ?? null,
          });
        } else if (secondaryAction === "defer") {
          taskId = await insertTask({
            category: "next_action",
            title: actionText.trim(),
            projectId: selectedProjectId,
            dueDate: dueDate?.getTime() ?? null,
          });
        }

        if (!taskId) {
          Toast.show({ type: "error", text1: "Failed to create task" });
          return;
        }

        if (selectedTagIds.length > 0) {
          await Promise.all(
            selectedTagIds.map((tagId) => addTagToTask(taskId, tagId)),
          );
        }

        await deleteNote(currentNote.id);
      } catch {
        Toast.show({
          type: "error",
          text1: "An error occurred. The note was not deleted.",
        });
        return;
      }
    }

    if (noteQueue.length > 0) {
      onProcessed(noteQueue[0], noteQueue.slice(1));
    } else {
      sheetRef.current?.dismiss();
    }
  }, [
    primaryAction,
    secondaryAction,
    actionText,
    currentNote,
    deleteNote,
    insertTask,
    addTagToTask,
    selectedProjectId,
    selectedTagIds,
    dueDate,
    noteQueue,
    onProcessed,
  ]);

  const handleChangeActionText = useCallback((text: string) => {
    setActionText(text);
  }, []);

  const handlePrimarySelect = useCallback((value: string) => {
    setPrimaryAction(value as PrimaryAction);
    if (value !== "actionable") {
      setSecondaryAction("");
      setActionText("");
      setSelectedTagIds([]);
      setSelectedProjectId(null);
      setDueDate(null);
    }
  }, []);

  const handleSecondarySelect = useCallback((value: string) => {
    setSecondaryAction(value as SecondaryAction);
  }, []);

  const handleDateValueChange = useCallback(
    (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
      setDueDate(selectedDate);
      setShowDatePicker(false);
    },
    [],
  );

  const handleDatePickerDismiss = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const handleTagSelect = useCallback((ids: string[]) => {
    setSelectedTagIds(ids);
  }, []);

  const handleProjectSelect = useCallback((ids: string[]) => {
    setSelectedProjectId(ids.length > 0 ? ids[0] : null);
  }, []);

  const handleClearDueDate = useCallback(() => {
    setDueDate(null);
  }, []);

  const showSecondSection = primaryAction === "actionable";
  const showDetailSection =
    secondaryAction === "delegate" || secondaryAction === "defer";
  const showDoneHelper = secondaryAction === "done_2min";

  return (
    <>
      <TrueSheet
        ref={sheetRef}
        name="clarifySheet"
        detents={[1]}
        cornerRadius={theme.borderRadius.xxl}
        grabber
        scrollable
        onWillPresent={() => {
          setPrimaryAction("");
          setSecondaryAction("");
          setActionText("");
          setSelectedTagIds([]);
          setSelectedProjectId(null);
          setDueDate(null);
          setShowDatePicker(false);
        }}
        onDidDismiss={() => {
          setPrimaryAction("");
          setSecondaryAction("");
          setActionText("");
          setSelectedTagIds([]);
          setSelectedProjectId(null);
          setDueDate(null);
          setShowDatePicker(false);
          onDismiss();
        }}
        header={
          <View style={styles.stickyHeader}>
            <Pressable
              style={styles.headerCloseButton}
              onPress={() => sheetRef.current?.dismiss()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close"
                size={28}
                color={theme.colors.onBackground}
              />
            </Pressable>
            <View style={styles.progressWrapper}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>
            <Pressable
              style={styles.headerNextButton}
              onPress={handleNext}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.headerNextText}>Next</Text>
            </Pressable>
          </View>
        }
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.clarifyingText} numberOfLines={1}>
            Clarifying: {currentNote?.title ?? ""}
          </Text>

          <SegmentedControl
            options={[
              { label: "Trash", value: "trash" },
              { label: "Someday", value: "someday" },
              { label: "Actionable", value: "actionable" },
            ]}
            selectedValue={primaryAction}
            onSelect={handlePrimarySelect}
          />

          {showSecondSection ? (
            <>
              <View style={styles.sectionGap} />
              <Text style={styles.actionLabel}>
                {"What's the very next physical action?"}
              </Text>
              <TextInput
                style={styles.actionInput}
                value={actionText}
                onChangeText={handleChangeActionText}
                placeholder="Describe the next action..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              <View style={styles.sectionGap} />
              <SegmentedControl
                options={[
                  { label: "Done in 2 min", value: "done_2min" },
                  { label: "Delegate", value: "delegate" },
                  { label: "Defer", value: "defer" },
                ]}
                selectedValue={secondaryAction}
                onSelect={handleSecondarySelect}
              />
              {showDoneHelper ? (
                <Text style={styles.doneHelperText}>
                  Finish the task NOW before pressing Next
                </Text>
              ) : null}
            </>
          ) : null}

          {showDetailSection ? (
            <>
              <View style={styles.sectionGap} />
              <TaskMetaChooser
                selectedTagIds={selectedTagIds}
                selectedProjectId={selectedProjectId}
                dueDate={dueDate}
                onTagPress={() => setShowTagChooser(true)}
                onProjectPress={() => setShowProjectChooser(true)}
                onDueDatePress={() => setShowDatePicker(true)}
                onClearDueDate={handleClearDueDate}
              />
            </>
          ) : null}
        </ScrollView>
        <NetworkToastProvider></NetworkToastProvider>
      </TrueSheet>

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
          onValueChange={handleDateValueChange}
          onDismiss={handleDatePickerDismiss}
        />
      ) : null}
    </>
  );
}
