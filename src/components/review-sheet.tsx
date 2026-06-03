import ClarifySheet from "@/components/clarify-sheet";
import ProjectDetailsSheet from "@/components/project-details-sheet";
import TaskDetailsSheet from "@/components/task-details-sheet";
import { borderRadius, spacing, typography } from "@/constants/theme";
import { physicalSweepItems } from "@/data/review-data";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTasks } from "@/hooks/use-db-tasks";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useReviewStore } from "@/store/review-store";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ToastProvider from "@/providers/toast-provider";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacing.xxxxl,
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.colors.background,
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
    headerStepText: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
    },
    subtitle: {
      ...typography.bodyLarge,
      color: theme.colors.onBackground,
      marginBottom: spacing.md,
    },
    checklistContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    checklistItem: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 48,
      gap: spacing.md,
    },
    checklistText: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
    },
    brainDumpInput: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
      minHeight: 48,
      justifyContent: "center",
      marginTop: spacing.md,
    },
    addButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
    },
    helperText: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    countText: {
      ...typography.bodyLarge,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    clarifyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
      minHeight: 48,
      justifyContent: "center",
    },
    clarifyButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      minHeight: 48,
      gap: spacing.md,
    },
    listItemText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      flex: 1,
    },
    emptyText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      paddingVertical: spacing.xl,
    },
    stepTitle: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
      marginTop: spacing.xl,
      marginBottom: spacing.xl,
    },
  });
}

type ReviewSheetProps = {
  onDismiss: () => void;
};

export default function ReviewSheet({ onDismiss }: ReviewSheetProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const sheetRef = useRef<TrueSheet>(null);

  const { currentStep, setStep, completeReview } = useReviewStore();
  const { noteList, insertNote } = useDbNotes();
  const { taskList } = useDbTasks();
  const { projectList } = useDbProjects();

  // Step 1 local state
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Step 2 local state
  const [brainDumpText, setBrainDumpText] = useState("");

  // Step 3 ClarifySheet state
  const [clarifyNoteId, setClarifyNoteId] = useState("");
  const [clarifyQueue, setClarifyQueue] = useState<string[]>([]);

  // Step 4/6 TaskDetailsSheet state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Step 5 ProjectDetailsSheet state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const waitingForTasks = useMemo(
    () =>
      taskList.filter(
        (t) => t.category === "waiting_for" && t.completedAt === null,
      ),
    [taskList],
  );

  const somedayTasks = useMemo(
    () =>
      taskList.filter(
        (t) => t.category === "someday" && t.completedAt === null,
      ),
    [taskList],
  );

  const activeProjects = useMemo(
    () => projectList.filter((p) => p.isActive === true),
    [projectList],
  );

  const displayStep = currentStep > 0 && currentStep <= 6 ? currentStep : 1;

  const toggleChecked = useCallback((index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleAddNote = useCallback(async () => {
    if (!brainDumpText.trim()) {
      Toast.show({ type: "warning", text1: "Note can't be empty" });
      return;
    }
    await insertNote(brainDumpText.trim());
    setBrainDumpText("");
  }, [brainDumpText, insertNote]);

  const handleClarifyPress = useCallback(() => {
    if (noteList.length === 0) {
      Toast.show({ type: "warning", text1: "No notes to clarify" });
      return;
    }
    setClarifyNoteId(noteList[0].id);
    setClarifyQueue(noteList.slice(1).map((n) => n.id));
    requestAnimationFrame(() => {
      TrueSheet.present("clarifySheet");
    });
  }, [noteList]);

  const handleClarifyDismiss = useCallback(() => {
    setClarifyNoteId("");
    setClarifyQueue([]);
  }, []);

  const handleClarifyProcessed = useCallback(
    (nextId: string | null, remainingQueue: string[]) => {
      if (nextId) {
        setClarifyNoteId(nextId);
        setClarifyQueue(remainingQueue);
      }
    },
    [],
  );

  const handleTaskPress = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    requestAnimationFrame(() => {
      TrueSheet.present("taskDetailsSheet");
    });
  }, []);

  const handleTaskDismiss = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handleProjectPress = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    requestAnimationFrame(() => {
      TrueSheet.present("projectDetailsSheet");
    });
  }, []);

  const handleProjectDismiss = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setStep(currentStep + 1);
    } else {
      completeReview();
      sheetRef.current?.dismiss();
    }
  }, [currentStep, setStep, completeReview]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [currentStep, setStep]);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const renderChecklistItem = (item: string, index: number) => {
    const isChecked = checkedItems.has(index);
    return (
      <Pressable
        key={item}
        style={styles.checklistItem}
        onPress={() => toggleChecked(index)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={isChecked ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={
            isChecked ? theme.colors.primary : theme.colors.onSurfaceVariant
          }
        />
        <Text
          style={[
            styles.checklistText,
            isChecked && { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  const waitingForKeyExtractor = useCallback(
    (item: { id: string }) => item.id,
    [],
  );

  const somedayKeyExtractor = useCallback(
    (item: { id: string }) => item.id,
    [],
  );

  const activeProjectsKeyExtractor = useCallback(
    (item: { id: string }) => item.id,
    [],
  );

  const renderWaitingForItem = ({
    item,
  }: {
    item: { id: string; title: string };
  }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => handleTaskPress(item.id)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.listItemText}>{item.title}</Text>
    </Pressable>
  );

  const renderSomedayItem = ({
    item,
  }: {
    item: { id: string; title: string };
  }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => handleTaskPress(item.id)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.listItemText}>{item.title}</Text>
    </Pressable>
  );

  const renderProjectItem = ({
    item,
  }: {
    item: { id: string; title: string };
  }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => handleProjectPress(item.id)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.listItemText}>{item.title}</Text>
    </Pressable>
  );

  const renderStepContent = () => {
    switch (displayStep) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Step 1 — Physical Sweep</Text>
            <Text style={styles.subtitle}>Clear these:</Text>
            <View style={styles.checklistContainer}>
              {physicalSweepItems.map((item, index) =>
                renderChecklistItem(item, index),
              )}
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Step 2 — Brain Dump</Text>
            <Text style={styles.subtitle}>{"What's on your mind?"}</Text>
            <TextInput
              style={styles.brainDumpInput}
              value={brainDumpText}
              onChangeText={setBrainDumpText}
              placeholder="One thought at a time"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
            <Pressable
              style={styles.addButton}
              onPress={handleAddNote}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
            <Text style={styles.helperText}>
              Dump everything until your mind is empty.
            </Text>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Step 3 — Clarify Inbox</Text>
            <Text style={styles.countText}>
              {noteList.length} {noteList.length === 1 ? "note" : "notes"} left
            </Text>
            <Pressable
              style={styles.clarifyButton}
              onPress={handleClarifyPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clarifyButtonText}>Clarify</Text>
            </Pressable>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>Step 4 — Waiting For</Text>
            {waitingForTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks waiting for</Text>
            ) : (
              <FlatList
                data={waitingForTasks}
                renderItem={renderWaitingForItem}
                keyExtractor={waitingForKeyExtractor}
                scrollEnabled={false}
              />
            )}
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.stepTitle}>Step 5 — Projects</Text>
            {activeProjects.length === 0 ? (
              <Text style={styles.emptyText}>No active projects</Text>
            ) : (
              <FlatList
                data={activeProjects}
                renderItem={renderProjectItem}
                keyExtractor={activeProjectsKeyExtractor}
                scrollEnabled={false}
              />
            )}
          </>
        );

      case 6:
        return (
          <>
            <Text style={styles.stepTitle}>Step 6 — Someday/Maybe</Text>
            {somedayTasks.length === 0 ? (
              <Text style={styles.emptyText}>No someday/maybe tasks</Text>
            ) : (
              <FlatList
                data={somedayTasks}
                renderItem={renderSomedayItem}
                keyExtractor={somedayKeyExtractor}
                scrollEnabled={false}
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <TrueSheet
        ref={sheetRef}
        name="reviewSheet"
        detents={[1]}
        cornerRadius={theme.borderRadius.xxl}
        grabber
        scrollable
        onWillPresent={() => {
          setCheckedItems(new Set());
          setBrainDumpText("");
        }}
        onDidDismiss={() => {
          setCheckedItems(new Set());
          setBrainDumpText("");
          setClarifyNoteId("");
          setClarifyQueue([]);
          setSelectedTaskId(null);
          setSelectedProjectId(null);
          handleDismiss();
        }}
        header={
          <>
            <View style={styles.headerRow}>
              <Pressable
                style={styles.headerCloseButton}
                onPress={handleBack}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={theme.colors.onBackground}
                />
              </Pressable>
              <Text style={styles.headerStepText}>Step {displayStep}/6</Text>
              <Pressable
                style={styles.headerNextButton}
                onPress={handleNext}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {displayStep < 6 ? (
                  <Ionicons
                    name="chevron-forward"
                    size={28}
                    color={theme.colors.onBackground}
                  />
                ) : (
                  <Text style={styles.headerNextText}>Done</Text>
                )}
              </Pressable>
            </View>
            <ToastProvider />
          </>
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>
      </TrueSheet>

      <ClarifySheet
        noteId={clarifyNoteId}
        noteQueue={clarifyQueue}
        onDismiss={handleClarifyDismiss}
        onProcessed={handleClarifyProcessed}
      />

      <TaskDetailsSheet
        taskId={selectedTaskId ?? ""}
        onDismiss={handleTaskDismiss}
      />

      <ProjectDetailsSheet
        projectId={selectedProjectId ?? ""}
        onDismiss={handleProjectDismiss}
      />
    </>
  );
}
