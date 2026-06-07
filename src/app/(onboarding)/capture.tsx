import OnboardingHeader from "@/components/onboarding-header";
import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
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
    title: {
      ...typography.headlineMedium,
      color: theme.colors.onBackground,
      marginBottom: spacing.lg,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      // maxHeight: 200,
      textAlignVertical: "top",
    },
  });
}

export default function CaptureScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const capturedNoteText = useOnboardingStore((s) => s.capturedNoteText);
  const setCapturedNote = useOnboardingStore((s) => s.setCapturedNote);
  const setStep = useOnboardingStore((s) => s.setStep);

  const [text, setText] = useState(capturedNoteText);

  const handleNext = useCallback(() => {
    if (!text.trim()) return;
    setCapturedNote(text.trim());
    setStep(2);
  }, [text, setCapturedNote, setStep]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingHeader onNext={handleNext} nextDisabled={!text.trim()} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {"What's one thing on your mind right now?"}
        </Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type your thoughts..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline={false}
          autoFocus
        />
      </View>
    </View>
  );
}
