import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { AppState } from "react-native";

import { connector, powerSyncDb } from "@/lib/powersync";

const BACKGROUND_SYNC_TASK = "ord-background-powersync-task";
const MINIMUM_INTERVAL = 15;
let lastProcessedTime = 0;
const DEBOUNCE_MS = 200;

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log(`[Background Sync] Starting at ${new Date().toISOString()}`);

    if (powerSyncDb.connected) {
      console.log("[Background Sync] Already connected, skipping");
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const previousSyncAt = powerSyncDb.currentStatus.lastSyncedAt;

    await powerSyncDb.connect(connector);

    await new Promise<void>((resolve) => {
      console.log("[Background Sync] Waiting for sync to complete");
      const unregister = powerSyncDb.registerListener({
        statusChanged: (status) => {
          const syncedThisRun =
            Boolean(status.lastSyncedAt) &&
            previousSyncAt?.getTime() !== status.lastSyncedAt?.getTime();
          const downloading = status.dataFlowStatus?.downloading ?? false;
          const uploading = status.dataFlowStatus?.uploading ?? false;

          if (syncedThisRun && !downloading && !uploading) {
            console.log("[Background Sync] Sync complete");
            resolve();
            unregister();
          }
        },
      });
    });
  } catch (error) {
    console.error("[Background Sync] Failed:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
});

export const initializeBackgroundTask = async (): Promise<() => void> => {
  const subscription = AppState.addEventListener("change", async (nextAppState) => {
    const now = Date.now();
    if (now - lastProcessedTime < DEBOUNCE_MS) return;
    lastProcessedTime = now;

    try {
      if (nextAppState === "active") {
        const isTaskRegistered =
          await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
        if (isTaskRegistered) {
          console.log(
            "[Background Sync] App is active. Unregistering background task.",
          );
          try {
            await BackgroundTask.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
          } catch (err) {
            console.log(
              "[Background Sync] Task already unregistered, skipping.",
              err,
            );
          }
        }
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        const isTaskRegistered =
          await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
        if (!isTaskRegistered) {
          console.log(
            "[Background Sync] App is backgrounded. Registering background task.",
          );
          try {
            await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
              minimumInterval: MINIMUM_INTERVAL,
            });
          } catch (err) {
            console.log(
              "[Background Sync] Task already registered, skipping.",
              err,
            );
          }
        }
      }
    } catch (err) {
      console.error("[Background Sync] Handler error:", err);
    }
  });

  const initialAppState = AppState.currentState;
  if (initialAppState === "background" || initialAppState === "inactive") {
    const isTaskRegistered =
      await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isTaskRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: MINIMUM_INTERVAL,
      });
    }
  }

  return () => {
    subscription.remove();
  };
};
