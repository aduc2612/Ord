import type { PrimaryAction, SecondaryAction } from "@/types/onboarding";
import { useDbTaskTags } from "@/hooks/use-db-task-tags";
import { useDbTasks } from "@/hooks/use-db-tasks";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Keyboard } from "react-native";
import { useRef, useCallback } from "react";
import Toast from "react-native-toast-message";

interface UseClarifyWorkflowParams {
  primaryAction: PrimaryAction;
  secondaryAction: SecondaryAction;
  actionText: string;
  capturedNoteText: string;
  selectedTagIds: string[];
  selectedProjectId: string | null;
  dueDate: Date | null;
}

export function useClarifyWorkflow({
  primaryAction,
  secondaryAction,
  actionText,
  capturedNoteText,
  selectedTagIds,
  selectedProjectId,
  dueDate,
}: UseClarifyWorkflowParams) {
  const { insertTask } = useDbTasks();
  const { addTagToTask } = useDbTaskTags();
  const setCreatedTaskTitle = useOnboardingStore((s) => s.setCreatedTaskTitle);
  const setStep = useOnboardingStore((s) => s.setStep);
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
        // TODO: refactor addTagToTask to throw on failure so allSettled catches rejections
        const tagResults = await Promise.allSettled(
          selectedTagIds.map((tagId) => addTagToTask(taskId!, tagId)),
        );
        const tagFailures = tagResults.filter((r) => r.status === "rejected");
        if (tagFailures.length > 0) {
          Toast.show({ type: "error", text1: "Failed to link some tags" });
          return;
        }
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

  return { handleNext };
}
