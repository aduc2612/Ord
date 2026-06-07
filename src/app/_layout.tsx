import { isRunningInExpoGo } from "expo";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from "@sentry/react-native";

import { SplashScreenController } from "@/components/splash-screen-controller";
import { useAuthContext } from "@/hooks/use-auth-context";
import { initializeBackgroundTask } from "@/lib/background-sync";
import AuthProvider from "@/providers/auth-provider";
import NetworkToastProvider from "@/providers/network-toast-provider";
import ToastProvider from "@/providers/toast-provider";
import { PowerSyncProvider } from "@/providers/powersync-provider";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,

  // Tracing — lower to 0.1–0.2 in high-traffic production
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,

  // Profiling — runs on a subset of traced transactions
  profilesSampleRate: 1.0,

  // Session Replay — always capture on error, sample sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,

  // Logging
  enableLogs: true,

  // Integrations
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
  ],

  // Disable native frames tracking in Expo Go (not supported)
  enableNativeFramesTracking: !isRunningInExpoGo(),

  // Environment
  environment: __DEV__ ? "development" : "production",

  // Debug mode in dev for troubleshooting
  debug: __DEV__,
});

function RootNavigator() {
  const { isLoggedIn } = useAuthContext();

  return (
    <Stack
      screenOptions={{
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function RootLayout() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializeBackgroundTask()
      .then((fn) => {
        cleanup = fn;
      })
      .catch((err) => {
        console.error("[Background Sync] Init error:", err);
      });
    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <PowerSyncProvider>
            <ToastProvider>
              <NetworkToastProvider>
                <SplashScreenController />
                <RootNavigator />
              </NetworkToastProvider>
            </ToastProvider>
          </PowerSyncProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
