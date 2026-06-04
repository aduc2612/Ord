import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export type ProjectItemProps = {
  title: string;
  completed: number;
  total: number;
  percent: number;
  onPress: () => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      minHeight: 48,
      marginBottom: spacing.sm,
    },
    cardLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    cardTitle: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
    },
    cardSubtitle: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    progressLabel: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
    },
  });
}

export default function ProjectItem({
  title,
  completed,
  total,
  percent,
  onPress,
}: ProjectItemProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: theme.interaction.pressedOpacity },
      ]}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>
          {completed}/{total} completed
        </Text>
      </View>
      <AnimatedCircularProgress
        size={48}
        width={4}
        fill={percent}
        tintColor={theme.colors.primary}
        backgroundColor={theme.colors.outlineVariant}
        lineCap="round"
        rotation={0}
      >
        {() => <Text style={styles.progressLabel}>{percent}%</Text>}
      </AnimatedCircularProgress>
    </Pressable>
  );
}
