import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TODO: Replace placeholder counts with real data from hooks
const listItems = [
  { id: "inbox", label: "Inbox", count: 15 },
  { id: "projects", label: "Projects", count: 15 },
  { id: "all-tasks", label: "All tasks", count: 15 },
];

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    listItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      minHeight: 48,
      // ...shadows.md,
    },
    label: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    count: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      fontWeight: "600",
    },
  });
}

export default function ListsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.header}>Lists</Text>
        {listItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.listItem}
            onPress={() => {
              if (item.id === "inbox") {
                router.push("/(tabs)/inbox");
              } else if (item.id === "projects") {
                router.push("/(tabs)/projects");
              }
            }}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.count}>{item.count}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
