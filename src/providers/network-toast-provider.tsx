import { useTheme, type Theme } from "@/hooks/use-theme";
import NetInfo from "@react-native-community/netinfo";
import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { type BaseToastProps } from "react-native-toast-message";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      marginHorizontal: theme.spacing.lg,
      alignItems: "center",
    },
    text: {
      ...theme.typography.bodyMedium,
    },
    toastOfflineContainer: {
      backgroundColor: theme.colors.error,
    },
    toastOfflineText: {
      color: theme.colors.onError,
    },
    toastOnlineContainer: {
      backgroundColor: theme.colors.success,
    },
    toastOnlineText: {
      color: theme.colors.onSuccess,
    },
    toastErrorContainer: {
      backgroundColor: theme.colors.error,
    },
    toastErrorText: {
      color: theme.colors.onError,
    },
    // FIX: Added missing success toast styles. Calls to
    // Toast.show({ type: "success" }) were silently swallowed because
    // "success" had no entry in the config, so the library rendered nothing.
    toastSuccessContainer: {
      backgroundColor: theme.colors.success,
    },
    toastSuccessText: {
      color: theme.colors.onSuccess,
    },
  });
}

function toastConfig(theme: Theme) {
  const styles = createStyles(theme);

  return {
    offline: (props: BaseToastProps) => (
      <View
        style={[styles.base, styles.toastOfflineContainer]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Text style={[styles.text, styles.toastOfflineText]}>
          {props.text1}
        </Text>
      </View>
    ),
    online: (props: BaseToastProps) => (
      <View style={[styles.base, styles.toastOnlineContainer]}>
        <Text style={[styles.text, styles.toastOnlineText]}>{props.text1}</Text>
      </View>
    ),
    error: (props: BaseToastProps) => (
      <View style={[styles.base, styles.toastErrorContainer]}>
        <Text style={[styles.text, styles.toastErrorText]}>{props.text1}</Text>
      </View>
    ),
    // FIX: "success" type was missing — any Toast.show({ type: "success" })
    // call in the app was silently ignored.
    success: (props: BaseToastProps) => (
      <View style={[styles.base, styles.toastSuccessContainer]}>
        <Text style={[styles.text, styles.toastSuccessText]}>
          {props.text1}
        </Text>
      </View>
    ),
  };
}

export default function NetworkToastProvider({ children }: PropsWithChildren) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const wasConnectedRef = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? true;

      if (wasConnectedRef.current !== isConnected) {
        Toast.show({
          type: isConnected ? "online" : "offline",
          text1: isConnected ? "Back online" : "You are offline",
          visibilityTime: isConnected ? 3000 : 4000,
          autoHide: true,
        });
      }

      wasConnectedRef.current = isConnected;
    });

    return () => unsubscribe();
  }, []);

  const config = useMemo(() => toastConfig(theme), [theme]);

  return (
    <>
      {children}
      <Toast config={config} topOffset={insets.top + theme.spacing.sm} />
    </>
  );
}
