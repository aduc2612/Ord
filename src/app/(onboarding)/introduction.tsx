import OnboardingHeader from "@/components/onboarding-header";
import { images } from "@/constants/images";
import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useCallback } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: spacing.lg,
    },
    image: {
      width: "100%",
      height: 500,
      marginBottom: spacing.xxxl,
      backgroundColor: "#fff",
    },
    title: {
      ...typography.headlineMedium,
      color: theme.colors.onBackground,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    subtitle: {
      ...typography.bodyLarge,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      paddingHorizontal: spacing.lg,
    },
  });
}

export default function IntroductionScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const setStep = useOnboardingStore((s) => s.setStep);

  const handleNext = useCallback(() => {
    setStep(1);
  }, [setStep]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingHeader onNext={handleNext} />
      <View style={styles.content}>
        <Image
          source={images.workspaceImage}
          style={styles.image}
          resizeMode="stretch"
        />
        <Text style={styles.title}>Achieve Mind Like Water.</Text>
        <Text style={styles.subtitle}>
          Get your tasks out of your head and into a system you can trust.
        </Text>
      </View>
    </View>
  );
}
