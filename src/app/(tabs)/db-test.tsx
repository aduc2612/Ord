import {
  borderRadius,
  componentStyles,
  spacing,
  typography,
} from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useDbTest } from "@/hooks/use-db-test";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: spacing.lg,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    button: {
      ...componentStyles.button,
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
    },
    secondaryButton: {
      ...componentStyles.button,
      backgroundColor: theme.colors.secondaryContainer,
    },
    secondaryButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onSecondaryContainer,
    },
    dangerButton: {
      ...componentStyles.button,
      backgroundColor: theme.colors.errorContainer,
    },
    dangerButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onErrorContainer,
    },
    resultContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...theme.shadows.sm,
    },
    resultTitle: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
      marginBottom: spacing.sm,
    },
    resultItem: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xs,
    },
    statusText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: spacing.xl,
    },
    buttonGroup: {
      gap: spacing.md,
    },
  });
}

export default function DbTestScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { success, error, items, loading, loadItems, insertItem, deleteAll } = useDbTest();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Database Test</Text>
        </View>
        <Text style={styles.statusText}>Migration error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Database Test</Text>
        </View>
        <Text style={styles.statusText}>Applying migrations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Database Test</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.buttonGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
            ]}
            onPress={insertItem}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Insert Item</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
            ]}
            onPress={loadItems}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.dangerButton,
              { opacity: pressed || loading ? theme.interaction.pressedOpacity : 1 },
            ]}
            onPress={deleteAll}
            disabled={loading}
          >
            <Text style={styles.dangerButtonText}>Delete All</Text>
          </Pressable>
        </View>

        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Items ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={styles.statusText}>No items yet</Text>
          ) : (
            items.map((item) => (
              <Text key={item.id} style={styles.resultItem}>
                {item.title}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
