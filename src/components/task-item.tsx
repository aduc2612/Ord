import {
  componentStyles,
  interaction,
  spacing,
  typography,
} from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

export type TaskItemProps = {
  title: string;
  completed: boolean;
  onPress: () => void;
  onCheckboxPress?: () => void;
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
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    titleCompleted: {
      color: theme.colors.onSurfaceVariant,
    },
  });
}

export default function TaskItem({
  title,
  completed,
  onPress,
  onCheckboxPress,
}: TaskItemProps) {
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
      <Pressable
        onPress={onCheckboxPress ?? onPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={completed ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={
            completed ? theme.colors.primary : theme.colors.onSurfaceVariant
          }
        />
      </Pressable>
      <Text style={[styles.title, completed && styles.titleCompleted]}>
        {title}
      </Text>
    </Pressable>
  );
}
