import {
  componentStyles,
  interaction,
  spacing,
  typography,
} from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type TaskItemProps = {
  title: string;
  onPress: () => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: componentStyles.card.borderRadius,
      padding: spacing.lg,
      gap: spacing.sm,
      minHeight: 48,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.onSurface,
    },
    title: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
  });
}

export default function TaskItem({ title, onPress }: TaskItemProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: interaction.pressedOpacity },
      ]}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.dot} />
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}
