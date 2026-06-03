import { useTheme, type Theme } from "@/hooks/use-theme";
import { PropsWithChildren, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { type BaseToastProps } from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      marginHorizontal: theme.spacing.lg,
    },
    text: {
      ...theme.typography.bodyMedium,
      flex: 1,
    },
    successContainer: {
      backgroundColor: theme.colors.success,
    },
    successText: {
      color: theme.colors.onSuccess,
    },
    errorContainer: {
      backgroundColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.onError,
    },
    warningContainer: {
      backgroundColor: theme.colors.warning,
    },
    warningText: {
      color: theme.colors.onWarning,
    },
    generalContainer: {
      backgroundColor: theme.colors.surface,
    },
    generalText: {
      color: theme.colors.onSurface,
    },
    onlineContainer: {
      backgroundColor: theme.colors.success,
    },
    onlineText: {
      color: theme.colors.onSuccess,
    },
    offlineContainer: {
      backgroundColor: theme.colors.error,
    },
    offlineText: {
      color: theme.colors.onError,
    },
  });
}

export function toastConfig(theme: Theme) {
  const styles = createStyles(theme);

  return {
    success: (props: BaseToastProps) => (
      <View
        style={[styles.base, styles.successContainer]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={theme.colors.onSuccess}
        />
        <Text style={[styles.text, styles.successText]}>{props.text1}</Text>
      </View>
    ),
    error: (props: BaseToastProps) => (
      <View
        style={[styles.base, styles.errorContainer]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Ionicons name="close-circle" size={20} color={theme.colors.onError} />
        <Text style={[styles.text, styles.errorText]}>{props.text1}</Text>
      </View>
    ),
    warning: (props: BaseToastProps) => (
      <View
        style={[styles.base, styles.warningContainer]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Ionicons
          name="alert-circle"
          size={20}
          color={theme.colors.onWarning}
        />
        <Text style={[styles.text, styles.warningText]}>{props.text1}</Text>
      </View>
    ),
    general: (props: BaseToastProps) => (
      <View
        style={[styles.base, styles.generalContainer]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Ionicons
          name="information-circle"
          size={20}
          color={theme.colors.onSurface}
        />
        <Text style={[styles.text, styles.generalText]}>{props.text1}</Text>
      </View>
    ),
    online: (props: BaseToastProps) => (
      <View style={[styles.base, styles.onlineContainer]}>
        <Ionicons name="cloud-done" size={20} color={theme.colors.onSuccess} />
        <Text style={[styles.text, styles.onlineText]}>{props.text1}</Text>
      </View>
    ),
    offline: (props: BaseToastProps) => (
      <View style={[styles.base, styles.offlineContainer]}>
        <Ionicons name="cloud-offline" size={20} color={theme.colors.onError} />
        <Text style={[styles.text, styles.offlineText]}>{props.text1}</Text>
      </View>
    ),
  };
}

export default function ToastProvider({ children }: PropsWithChildren) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const config = useMemo(() => toastConfig(theme), [theme]);

  return (
    <>
      {children}
      <Toast
        config={config}
        topOffset={insets.top + theme.spacing.sm}
        swipeable={false}
        visibilityTime={1000}
      />
    </>
  );
}
