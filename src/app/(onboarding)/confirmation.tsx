import OnboardingHeader from "@/components/onboarding-header";
import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme, insetsTop: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: insetsTop,
    },
    content: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    quote: {
      ...typography.bodyLarge,
      color: theme.colors.onBackground,
      // textAlign: "center",
      lineHeight: typography.titleLarge.lineHeight,
    },
    subtitle: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    boldText: {
      fontWeight: typography.titleMedium.fontWeight,
    },
  });
}

export default function ConfirmationScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);
  const setStep = useOnboardingStore((s) => s.setStep);
  const createdTaskTitle = useOnboardingStore((s) => s.createdTaskTitle);

  const handleNext = useCallback(() => {
    setStep(4);
  }, [setStep]);

  return (
    <View style={styles.container}>
      <OnboardingHeader onNext={handleNext} />
      <View style={styles.content}>
        <Text style={styles.quote}>
          There you go: &ldquo;
          <Text style={styles.boldText}>{createdTaskTitle}</Text>
          &rdquo; just got offloaded from your mind into a system you can trust.
        </Text>
        <Text style={styles.subtitle}>
          Your mind is for having ideas, not holding them.
        </Text>
      </View>
    </View>
  );
}
