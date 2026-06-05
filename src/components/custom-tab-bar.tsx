import { borderRadius, shadows, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface TabRoute {
  key: string;
  name: string;
  params?: object;
}

interface TabBarProps {
  state: {
    routes: TabRoute[];
    index: number;
  };
  descriptors?: Record<string, unknown>;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
}

const TAB_CONFIG: Record<
  string,
  { label: string; active: IoniconsName; inactive: IoniconsName }
> = {
  index: { label: "Home", active: "home", inactive: "home-outline" },
  lists: { label: "Lists", active: "list", inactive: "list-outline" },
  review: {
    label: "Review",
    active: "checkbox",
    inactive: "checkbox-outline",
  },
  settings: {
    label: "Settings",
    active: "settings",
    inactive: "settings-outline",
  },
  // "db-test": { label: "Test", active: "flask", inactive: "flask-outline" },
};

function createStyles(theme: Theme, bottomInset: number) {
  return StyleSheet.create({
    outer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: bottomInset + spacing.sm,
      paddingHorizontal: spacing.lg,
      pointerEvents: "box-none",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.round,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      ...shadows.lg,
    },
  });
}

interface TabItemProps {
  config: { label: string; active: IoniconsName; inactive: IoniconsName };
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  theme: Theme;
}

function TabItem({
  config,
  isFocused,
  onPress,
  onLongPress,
  theme,
}: TabItemProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  };

  if (isFocused) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: true }}
          accessibilityLabel={config.label}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            activeTabStyles.container,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons
            name={config.active}
            size={20}
            color={theme.colors.onPrimary}
          />
          <Text
            style={[activeTabStyles.label, { color: theme.colors.onPrimary }]}
          >
            {config.label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{}}
        accessibilityLabel={config.label}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={{ top: 8, bottom: 8, left: 14, right: 14 }}
        style={inactiveTabStyles.wrapper}
      >
        <Ionicons
          name={config.inactive}
          size={22}
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>
    </Animated.View>
  );
}

const activeTabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.round,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    columnGap: spacing.sm,
  },
  label: {
    ...typography.labelMedium,
  },
});

const inactiveTabStyles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
});

export default function CustomTabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );

  const tabs = useMemo(
    () =>
      state.routes
        .filter((route) => route.name in TAB_CONFIG)
        .map((route) => {
          const config = TAB_CONFIG[route.name];
          const isFocused = state.routes[state.index].key === route.key;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              config={config}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              theme={theme}
            />
          );
        }),
    [state, navigation, theme],
  );

  return (
    <View style={styles.outer}>
      <View style={styles.container}>{tabs}</View>
    </View>
  );
}
