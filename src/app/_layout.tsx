import { SplashScreenController } from "@/components/splash-screen-controller";
import { useAuthContext } from "@/hooks/use-auth-context";
import { initializeBackgroundTask } from "@/lib/background-sync";
import AuthProvider from "@/providers/auth-provider";
import NetworkToastProvider from "@/providers/network-toast-provider";
import { PowerSyncProvider } from "@/providers/powersync-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

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

export default function RootLayout() {
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
            <NetworkToastProvider>
              <BottomSheetModalProvider>
                <SplashScreenController />
                <RootNavigator />
              </BottomSheetModalProvider>
            </NetworkToastProvider>
          </PowerSyncProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
