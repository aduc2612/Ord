import { connector, powerSyncDb } from "@/lib/powersync";
import { supabase } from "@/lib/supabase";
import { PowerSyncContext } from "@powersync/react-native";
import { PropsWithChildren, useEffect, useState } from "react";

export function PowerSyncProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

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
          } else {
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
      op = op.then(() => powerSyncDb.disconnect()).catch(() => {});
    };
  }, []);

  if (!isReady) return null;

  return (
    <PowerSyncContext.Provider value={powerSyncDb}>
      {children}
    </PowerSyncContext.Provider>
  );
}
