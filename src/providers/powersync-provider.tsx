import { connector, powerSyncDb } from "@/lib/powersync";
import { supabase } from "@/lib/supabase";
import { PowerSyncContext } from "@powersync/react-native";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";

export function PowerSyncProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const hasShownSyncToast = useRef(false);
  const listenerCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isFirstCallback = true;
    let cancelled = false;
    let op = Promise.resolve();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      op = op
        .then(async () => {
          if (cancelled) return;
          if (session) {
            await powerSyncDb.connect(connector);

            hasShownSyncToast.current = false;
            listenerCleanup.current = powerSyncDb.registerListener({
              statusChanged: (status) => {
                if (!hasShownSyncToast.current && status.hasSynced) {
                  hasShownSyncToast.current = true;
                  Toast.show({
                    type: "success",
                    text1: "Synced successfully",
                  });
                }

                if (!status.hasSynced && status.dataFlowStatus?.downloadError) {
                  Toast.show({
                    type: "error",
                    text1: "Sync failed — working with local data",
                    visibilityTime: 5000,
                  });
                }
              },
            });
          } else {
            listenerCleanup.current?.();
            listenerCleanup.current = null;
            hasShownSyncToast.current = false;
            await powerSyncDb.disconnectAndClear();
          }
        })
        .catch((err) => {
          console.error("[PowerSync] Auth state change error:", err);
        });
      if (isFirstCallback) {
        isFirstCallback = false;
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      op = op
        .then(() => {
          listenerCleanup.current?.();
          listenerCleanup.current = null;
          hasShownSyncToast.current = false;
          return powerSyncDb.disconnect();
        })
        .catch(() => {});
    };
  }, []);

  if (!isReady) return null;

  return (
    <PowerSyncContext.Provider value={powerSyncDb}>
      {children}
    </PowerSyncContext.Provider>
  );
}
