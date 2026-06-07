import { SplashScreenController } from "@/components/splash-screen-controller";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useTheme } from "@/hooks/use-theme";
import { initializeBackgroundTask } from "@/lib/background-sync";
import AuthProvider from "@/providers/auth-provider";
import NetworkToastProvider from "@/providers/network-toast-provider";
import { PowerSyncProvider } from "@/providers/powersync-provider";
import ToastProvider from "@/providers/toast-provider";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuthContext();
  const theme = useTheme();
  const onboardingComplete = useOnboardingStore((s) => s.onboardingComplete);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);
  const isHydrated = useOnboardingStore((s) => s._hydrated);

  // Reset onboarding state when user signs out (not during initial load)
  useEffect(() => {
    if (!isLoggedIn && !isLoading && isHydrated) {
      resetOnboarding();
    }
  }, [isLoggedIn, isLoading, isHydrated, resetOnboarding]);

  return (
    <Stack
      screenOptions={{
        // animation: "none",
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Protected guard={isLoggedIn && onboardingComplete}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn && !onboardingComplete}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const theme = useTheme();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);
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
