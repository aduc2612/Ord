import { useTheme } from "@/hooks/use-theme";
import type { Theme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, Text } from "react-native";
import { spacing, borderRadius, typography, shadows } from "@/constants/theme";

async function onSignOutButtonPress() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
  }
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceVariant,
      ...shadows.sm,
    },
    text: {
      ...typography.labelLarge,
      color: theme.colors.error,
    },
  });
}

export default function SignOutButton() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable style={styles.button} onPress={onSignOutButtonPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Text style={styles.text}>Sign out</Text>
    </Pressable>
  );
}
