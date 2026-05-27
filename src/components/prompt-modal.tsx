import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { BottomSheet } from "@expo/ui/community/bottom-sheet";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      padding: spacing.lg,
      width: "100%",
      ...theme.shadows.lg,
    },
    title: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
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
      backgroundColor: theme.colors.surfaceVariant,
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
  visible: boolean;
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
  visible,
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
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setText(defaultValue);
      setShowError(false);
    }
  }, [visible, defaultValue]);

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const handleConfirm = useCallback(() => {
    if (!text.trim()) {
      setShowError(true);
      return;
    }
    onConfirm(text.trim());
    onCancel();
  }, [onConfirm, onCancel, text]);

  const handleChangeText = useCallback((value: string) => {
    setText(value);
    setShowError(false);
  }, []);

  return (
    <BottomSheet index={visible ? 0 : -1} onDismiss={onCancel} enablePanDownToClose>
      <View style={styles.container}>
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
          autoFocus
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
            onPress={onCancel}
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
    </BottomSheet>
  );
}
