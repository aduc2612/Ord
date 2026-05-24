import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import type { ViewStyle } from "react-native";
import { StyleSheet, TextInput, View } from "react-native";

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.round,
      paddingHorizontal: spacing.lg,
    },
    input: {
      flex: 1,
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      paddingVertical: spacing.md,
    },
  });
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  style,
}: SearchBarProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
      />
      <Ionicons name="search" size={20} color={theme.colors.onSurfaceVariant} />
    </View>
  );
}
