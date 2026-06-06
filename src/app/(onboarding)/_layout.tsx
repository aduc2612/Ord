import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

const STEP_ROUTES = [
  "./introduction",
  "./capture",
  "./clarify",
  "./confirmation",
  "./completion",
] as const;

export default function OnboardingLayout() {
  const theme = useTheme();

  const currentStep = useOnboardingStore((s) => s.currentStep);
  const onboardingComplete = useOnboardingStore((s) => s.onboardingComplete);
  const router = useRouter();

  useEffect(() => {
    if (onboardingComplete) {
      router.replace("/(tabs)");
      return;
    }
    router.replace(STEP_ROUTES[currentStep]);
  }, [currentStep, onboardingComplete, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="introduction" />
      <Stack.Screen name="capture" />
      <Stack.Screen name="clarify" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="completion" />
    </Stack>
  );
}
