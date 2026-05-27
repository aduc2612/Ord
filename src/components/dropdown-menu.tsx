import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type DropdownOption = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export type DropdownMenuProps = {
  options: DropdownOption[];
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    trigger: {
      minWidth: 48,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      flex: 1,
      // backgroundColor: "rgba(0,0,0,0.4)",
    },
    menu: {
      position: "absolute",
      right: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      minWidth: 200,
      paddingVertical: spacing.sm,
      ...theme.shadows.lg,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    menuItemLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    menuItemLabelDestructive: {
      color: theme.colors.error,
    },
    menuItemIcon: {
      width: 24,
      alignItems: "center",
    },
  });
}

export default function DropdownMenu({ options }: DropdownMenuProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const handleSelect = useCallback(
    (option: DropdownOption) => {
      option.onPress();
      close();
    },
    [close],
  );

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
        ]}
        onPress={() => setVisible(true)}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={theme.colors.onSurface}
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.overlay} onPress={close}>
          <View />
        </Pressable>
        <View style={[styles.menu, { top: insets.top + 48 }]}>
          {options.map((option, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={() => handleSelect(option)}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={
                    option.destructive
                      ? theme.colors.error
                      : theme.colors.onSurfaceVariant
                  }
                />
              </View>
              <Text
                style={[
                  styles.menuItemLabel,
                  option.destructive && styles.menuItemLabelDestructive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}
