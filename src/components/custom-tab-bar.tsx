import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  review: { label: "Review", active: "checkbox", inactive: "checkbox-outline" },
  settings: {
    label: "Settings",
    active: "settings",
    inactive: "settings-outline",
  },
  // "db-test": { label: "Test", active: "flask", inactive: "flask-outline" },
};

function createStyles(theme: Theme, bottomInset: number) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: theme.colors.surface,
      paddingBottom: bottomInset,
      paddingTop: spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xs,
    },
    label: {
      ...typography.bodySmall,
      marginTop: 2,
    },
    indicator: {
      position: "absolute",
      bottom: 0,
      alignSelf: "center",
      width: 32,
      height: 3,
      backgroundColor: theme.colors.primary,
      borderRadius: 1.5,
    },
  });
}

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
          const label = config.label;

          const isFocused = state.routes[state.index].key === route.key;
          const icons = { active: config.active, inactive: config.inactive };

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
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={onLongPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.tab}
            >
              <Ionicons
                name={isFocused ? icons.active : icons.inactive}
                size={24}
                color={
                  isFocused
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                    fontWeight: isFocused ? "700" : "400",
                  },
                ]}
              >
                {label}
              </Text>
              {isFocused && <View style={styles.indicator} />}
            </Pressable>
          );
        }),
    [state, navigation, theme, styles],
  );

  return <View style={styles.container}>{tabs}</View>;
}
