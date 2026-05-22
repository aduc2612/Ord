import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: borderRadius.xl,
      borderBottomRightRadius: borderRadius.xl,
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
  });
}

export type PromptModalProps = {
  visible: boolean;
  title: string;
  message?: string;
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
  defaultValue = "",
  cancelLabel = "Cancel",
  confirmLabel = "Save",
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(defaultValue);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setText(defaultValue);
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
    onConfirm(text);
    onCancel();
  }, [onConfirm, onCancel, text]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
              <Text style={styles.title}>{title}</Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Enter text..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                onSubmitEditing={handleConfirm}
                returnKeyType="done"
                autoFocus
              />
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
