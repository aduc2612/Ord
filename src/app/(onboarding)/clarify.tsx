import ChooserModal from "@/components/chooser-modal";
import OnboardingHeader from "@/components/onboarding-header";
import SegmentedControl from "@/components/segmented-control";
import TaskMetaChooser from "@/components/task-meta-chooser";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type PrimaryAction = "" | "someday" | "actionable";
type SecondaryAction = "" | "done_2min" | "delegate" | "defer";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxxl,
    },
    clarifyingLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    clarifyingText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      padding: spacing.md,
    },
    clarifyingScrollContainer: {
      maxHeight: 80,
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

export default function ClarifyScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const capturedNoteText = useOnboardingStore((s) => s.capturedNoteText);
  const setCreatedTaskTitle = useOnboardingStore((s) => s.setCreatedTaskTitle);
  const setStep = useOnboardingStore((s) => s.setStep);

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isSavingRef = useRef(false);

  const handleNext = useCallback(async () => {
    if (!primaryAction) {
      Toast.show({ type: "warning", text1: "Please select an action" });
      return;
    }

    if (primaryAction === "actionable") {
      if (!secondaryAction) {
        Toast.show({ type: "warning", text1: "Please select a sub-action" });
        return;
      }
      if (!actionText.trim()) {
        Toast.show({ type: "warning", text1: "Please enter a next action" });
        return;
      }
    }

    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      let taskId: string | undefined;
      let title: string;

      if (primaryAction === "someday") {
        title = capturedNoteText;
        taskId = await insertTask({ category: "someday", title });
      } else if (primaryAction === "actionable") {
        title = actionText.trim();
        if (secondaryAction === "done_2min") {
          taskId = await insertTask({ category: "next_action", title });
        } else if (secondaryAction === "delegate") {
          taskId = await insertTask({
            category: "waiting_for",
            title,
            projectId: selectedProjectId,
            dueDate: dueDate?.getTime() ?? null,
          });
        } else if (secondaryAction === "defer") {
          taskId = await insertTask({
            category: "next_action",
            title,
            projectId: selectedProjectId,
            dueDate: dueDate?.getTime() ?? null,
          });
        }
      }

      if (!taskId) {
        Toast.show({ type: "error", text1: "Failed to create task" });
        return;
      }

      if (selectedTagIds.length > 0) {
        await Promise.all(
          selectedTagIds.map((tagId) => addTagToTask(taskId!, tagId)),
        );
      }

      setCreatedTaskTitle(
        primaryAction === "someday" ? capturedNoteText : actionText.trim(),
      );
      Keyboard.dismiss();
      setStep(3);
    } catch {
      Toast.show({ type: "error", text1: "An error occurred" });
    } finally {
      isSavingRef.current = false;
    }
  }, [
    primaryAction,
    secondaryAction,
    actionText,
    capturedNoteText,
    selectedTagIds,
    selectedProjectId,
    dueDate,
    insertTask,
    addTagToTask,
    setCreatedTaskTitle,
    setStep,
  ]);

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
    (_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
      if (selectedDate) {
        setDueDate(selectedDate);
      }
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingHeader onNext={handleNext} nextDisabled={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.clarifyingLabel}>
          Clarifying:{" "}
          <Text style={styles.clarifyingText}>{capturedNoteText}</Text>
        </Text>

        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clarifyingScrollContainer}
        >
          
        </ScrollView> */}

        <View style={styles.sectionGap} />

        <SegmentedControl
          options={[
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
              onChangeText={setActionText}
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
              onTagPress={() => TrueSheet.present("chooserTag")}
              onProjectPress={() => TrueSheet.present("chooserProject")}
              onDueDatePress={() => setShowDatePicker(true)}
              onClearDueDate={handleClearDueDate}
            />
          </>
        ) : null}
      </ScrollView>

      <ChooserModal
        name="chooserTag"
        type="tag"
        selectedIds={selectedTagIds}
        onClose={() => {}}
        onSelect={handleTagSelect}
      />
      <ChooserModal
        name="chooserProject"
        type="project"
        selectedIds={selectedProjectId ? [selectedProjectId] : []}
        onClose={() => {}}
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
    </View>
  );
}
