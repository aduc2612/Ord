import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const options = { headerShown: false };

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    header: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    sectionLabel: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
      marginBottom: spacing.xs,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
    },
    rowContent: {
      flex: 1,
      minWidth: 0,
    },
    rowLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    rowLabelDanger: {
      ...typography.bodyMedium,
      color: theme.colors.error,
    },
    rowSubtitle: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    badgeText: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    syncedBadge: {
      ...typography.labelSmall,
      backgroundColor: "#E1F5EE",
      color: "#0F6E56",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      overflow: "hidden",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      ...typography.labelMedium,
      color: theme.colors.onPrimaryContainer,
    },
    profileName: {
      ...typography.bodyMedium,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    profileEmail: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
  });
}

async function handleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out:", error);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { profile } = useAuthContext();

  const userName = (profile?.name as string) ?? "User";
  const userEmail = (profile?.email as string) ?? "user@example.com";
  const userInitials =
    userName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Settings</Text>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: theme.interaction.pressedOpacity },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() =>
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: handleSignOut,
                },
              ])
            }
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.rowLabelDanger}>Sign out</Text>
          </Pressable>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="sunny-outline"
            label="Theme"
            subtitle="System default"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            subtitle="Daily digest · 8:00 AM"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="calendar-outline"
            label="Weekly review day"
            subtitle="Friday"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="time-outline"
            label="Default due time"
            subtitle="End of day · 5:00 PM"
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons
              name="sync-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Sync status</Text>
              <Text style={styles.rowSubtitle}>Last synced just now</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.syncedBadge}>Synced</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="chatbubble-outline"
            label="Send feedback"
            subtitle="Report a bug or suggest a feature"
            styles={styles}
            theme={theme}
          />
          <View style={styles.row}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Version</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.badgeText}>1.0.0 (42)</Text>
            </View>
          </View>
          <SettingsRow
            icon="shield-outline"
            label="Privacy policy"
            styles={styles}
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Row helper ──────────────────────────────────────────────────────────────

function SettingsRow({
  icon,
  colorScheme,
  label,
  subtitle,
  styles,
  theme,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && { opacity: theme.interaction.pressedOpacity },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={() => {}}
    >
      <Ionicons
        name={icon as never}
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    </Pressable>
  );
}
