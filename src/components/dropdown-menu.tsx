import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ToastProvider from "@/providers/toast-provider";
import { useCallback, useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export type DropdownOption = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void | Promise<void>;
  destructive?: boolean;
};

export type DropdownMenuProps = {
  name: string;
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxxxl,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      ...typography.titleMedium,
      color: theme.colors.onBackground,
    },
    doneButton: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    doneButtonText: {
      ...typography.labelLarge,
      color: theme.colors.primary,
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
      color: theme.colors.onBackground,
    },
    menuItemLabelDestructive: {
      color: theme.colors.error,
    },
    menuItemIcon: {
      width: 24,
      alignItems: "center",
    },
    menuContent: {
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.background,
      paddingTop: spacing.xxxxl,
    },
  });
}

export default function DropdownMenu({ name, options }: DropdownMenuProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const sheetRef = useRef<TrueSheet>(null);

  const handleSelect = useCallback(async (option: DropdownOption) => {
    try {
      await option.onPress();
    } catch (err) {
      console.error("Dropdown option error:", err);
    } finally {
      sheetRef.current?.dismiss();
    }
  }, []);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
        ]}
        onPress={() => TrueSheet.present(name)}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={theme.colors.onSurface}
        />
      </Pressable>

      <TrueSheet
        ref={sheetRef}
        name={name}
        detents={["auto"]}
        cornerRadius={theme.borderRadius.xxl}
        grabber
        header={
          <>
            <ToastProvider />
          </>
        }
      >
        <FlatList
          data={options}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
              ]}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={
                    item.destructive
                      ? theme.colors.error
                      : theme.colors.onSurfaceVariant
                  }
                />
              </View>
              <Text
                style={[
                  styles.menuItemLabel,
                  item.destructive && styles.menuItemLabelDestructive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.menuContent}
        />
      </TrueSheet>
    </>
  );
}
