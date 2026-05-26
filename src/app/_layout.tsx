import { initializeBackgroundTask } from "@/lib/background-sync";
import { SplashScreenController } from "@/components/splash-screen-controller";
import { useAuthContext } from "@/hooks/use-auth-context";
import AuthProvider from "@/providers/auth-provider";
import { PowerSyncProvider } from "@/providers/PowerSyncProvider";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const { isLoggedIn } = useAuthContext();

  return (
    <Stack>
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
    const appMounted = Promise.resolve();
    initializeBackgroundTask(appMounted).catch((err) => {
      console.error("[Background Sync] Init error:", err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PowerSyncProvider>
          <SplashScreenController />
          <RootNavigator />
        </PowerSyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
