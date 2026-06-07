import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Pressable, StyleSheet, Text, View } from "react-native";

type OnboardingHeaderProps = {
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: theme.colors.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    spacer: {
      minHeight: 48,
      minWidth: 48,
    },
    progressWrapper: {
      flex: 1,
      marginHorizontal: spacing.md,
    },
    progressTrack: {
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.round,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.round,
    },
    nextButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    nextText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
    },
    nextTextDisabled: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.5,
    },
  });
}

export default function OnboardingHeader({
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
}: OnboardingHeaderProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const currentStep = useOnboardingStore((s) => s.currentStep);

  const progress = Math.max(0, Math.min(100, ((currentStep + 1) / 5) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.progressWrapper}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
      <Pressable
        style={styles.nextButton}
        onPress={onNext}
        disabled={nextDisabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          style={[styles.nextText, nextDisabled && styles.nextTextDisabled]}
        >
          {nextLabel}
        </Text>
      </Pressable>
    </View>
  );
}
