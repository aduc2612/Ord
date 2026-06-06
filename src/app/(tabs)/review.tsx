import ReviewSheet from "@/components/review-sheet";
import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useReviewStore } from "@/store/review-store";
import { formatDate } from "@/utils/format-date";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    centerArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.xl,
    },
    lastReviewedText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xxl,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    startButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
      fontWeight: "600",
    },
  });
}

export default function ReviewScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const { currentStep, lastReviewedAt, startReview } = useReviewStore();

  const formattedDate = useMemo(
    () => formatDate(lastReviewedAt),
    [lastReviewedAt],
  );

  const buttonLabel = currentStep > 0 ? "Resume" : "Start";

  const handleStart = useCallback(() => {
    if (currentStep === 0) {
      startReview();
    }
    TrueSheet.present("reviewSheet");
  }, [currentStep, startReview]);

  const handleSheetDismiss = useCallback(() => {}, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.tabBar,
          },
        ]}
      >
        <Text style={styles.header}>Review</Text>
        <View style={styles.centerArea}>
          <Text style={styles.lastReviewedText}>
            Last reviewed: {formattedDate}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && { opacity: theme.interaction.pressedOpacity },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleStart}
          >
            <Text style={styles.startButtonText}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </View>
      <ReviewSheet onDismiss={handleSheetDismiss} />
    </View>
  );
}
