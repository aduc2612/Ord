import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type SegmentedOption = {
  label: string;
  value: string;
};

type SegmentedControlProps = {
  options: SegmentedOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
    },
    option: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadius.lg,
    },
    selectedOption: {
      backgroundColor: theme.colors.surfaceVariant,
      ...theme.shadows.sm,
    },
    optionText: {
      ...theme.typography.labelLarge,
      color: theme.colors.onSurfaceVariant,
    },
    selectedOptionText: {
      color: theme.colors.onSurface,
    },
  });
}

export default function SegmentedControl({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onSelect(option.value)}
            hitSlop={{ top: 6, bottom: 6 }}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
