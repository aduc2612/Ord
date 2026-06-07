import { useAuthContext } from "@/hooks/use-auth-context";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuthContext();
  const hydrated = useOnboardingStore((s) => s._hydrated);

  useEffect(() => {
    if (!isLoading && hydrated) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading, hydrated]);

  return null;
}
