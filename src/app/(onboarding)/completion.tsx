import OnboardingHeader from "@/components/onboarding-header";
import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: spacing.xxl,
    },
    message: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
      textAlign: "center",
    },
  });
}

export default function CompletionScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const onboardingComplete = useOnboardingStore((s) => s.onboardingComplete);

  const handleDone = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  useEffect(() => {
    if (onboardingComplete) {
      router.replace("/(tabs)" as Href);
    }
  }, [onboardingComplete, router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingHeader onNext={handleDone} nextLabel="Done" />
      <View style={styles.content}>
        <Text style={styles.message}>Your system is ready.</Text>
      </View>
    </View>
  );
}
