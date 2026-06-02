import { borderRadius, spacing, typography } from "@/constants/theme";
import { useKeyboard } from "@/hooks/use-keyboard";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: spacing.lg,
      width: "100%",
      ...theme.shadows.lg,
    },
    title: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
      marginBottom: spacing.xs,
    },
    message: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.md,
    },
    input: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.lg,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing.sm,
    },
    cancelButton: {
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
    },
    cancelText: {
      ...typography.labelLarge,
      color: theme.colors.onSurfaceVariant,
    },
    confirmButton: {
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.primary,
    },
    confirmText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
    },
    errorText: {
      ...typography.bodySmall,
      color: theme.colors.error,
      marginBottom: spacing.sm,
      marginLeft: spacing.md,
    },
  });
}

export type PromptModalProps = {
  name: string;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export default function PromptModal({
  name,
  title,
  message,
  placeholder,
  defaultValue = "",
  cancelLabel = "Cancel",
  confirmLabel = "Save",
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [text, setText] = useState(defaultValue);
  const [showError, setShowError] = useState(false);
  const sheetRef = useRef<TrueSheet>(null);
  const inputRef = useRef<TextInput>(null);

  const insets = useSafeAreaInsets();

  const isKeyboardOpen = useKeyboard();

  const handleConfirm = useCallback(() => {
    if (!text.trim()) {
      setShowError(true);
      return;
    }
    onConfirm(text.trim());
    sheetRef.current?.dismiss();
  }, [onConfirm, text]);

  const handleChangeText = useCallback((value: string) => {
    setText(value);
    setShowError(false);
  }, []);

  return (
    <TrueSheet
      ref={sheetRef}
      name={name}
      detents={["auto"]}
      cornerRadius={theme.borderRadius.xxl}
      grabber
      onWillPresent={() => {
        setText(defaultValue);
        setShowError(false);
      }}
      onDidPresent={() => {
        inputRef.current?.focus();
      }}
      onDidDismiss={() => {
        onCancel();
      }}
      insetAdjustment="never"
    >
      <View
        style={[
          styles.container,
          {
            paddingBottom:
              insets.bottom * (1 - Number(isKeyboardOpen)) + spacing.xl,
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder={placeholder ?? "Enter text..."}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          onSubmitEditing={handleConfirm}
          returnKeyType="done"
        />
        {showError ? (
          <Text style={styles.errorText}>Please enter a value</Text>
        ) : null}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
            ]}
            onPress={() => sheetRef.current?.dismiss()}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
            ]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </TrueSheet>
  );
}
