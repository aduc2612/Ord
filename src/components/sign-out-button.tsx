import { useTheme } from "@/hooks/use-theme";
import type { Theme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
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
    <TouchableOpacity style={styles.button} onPress={onSignOutButtonPress} hitSlop={{ top: 2, bottom: 2 }}>
      <Text style={styles.text}>Sign out</Text>
    </TouchableOpacity>
  );
}
