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
  });
}

function toastConfig(theme: Theme) {
  const styles = createStyles(theme);

  return {
    offline: (props: BaseToastProps) => (
      <View
        style={[styles.base, { backgroundColor: theme.colors.error }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Text style={[styles.text, { color: theme.colors.onError }]}>
          {props.text1}
        </Text>
      </View>
    ),
    online: (props: BaseToastProps) => (
      <View style={[styles.base, { backgroundColor: theme.colors.success }]}>
        <Text style={[styles.text, { color: theme.colors.onSuccess }]}>
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
