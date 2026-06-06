import DropdownMenu from "@/components/dropdown-menu";
import { spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { useThemeStore } from "@/store/theme-store";
import type { ThemePreference } from "@/store/theme-store";
import { supabase } from "@/lib/supabase";
import { useStatus } from "@powersync/react-native";
import { formatRelativeTime } from "@/utils/format-date";
import * as Application from "expo-application";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  FEEDBACK_EMAIL,
  feedbackTemplates,
} from "@/constants/feedback-templates";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
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
    errorBadge: {
      ...typography.labelSmall,
      backgroundColor: theme.colors.error,
      color: theme.colors.onError,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      overflow: "hidden",
    },
    offlineBadge: {
      ...typography.labelSmall,
      backgroundColor: theme.colors.surfaceVariant,
      color: theme.colors.onSurfaceVariant,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      overflow: "hidden",
    },
    syncingBadge: {
      ...typography.labelSmall,
      backgroundColor: theme.colors.warning,
      color: theme.colors.onWarning,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      overflow: "hidden",
    },
    profileEmail: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
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
  const preference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setThemePreference);
  const status = useStatus();

  const isConnected = status.connected;
  const hasSynced = status.hasSynced;
  // const isSyncing =
  //   status.dataFlowStatus?.downloading || status.dataFlowStatus?.uploading;
  const hasError =
    status.dataFlowStatus?.downloadError != null ||
    status.dataFlowStatus?.uploadError != null;
  const lastSyncedAt = status.lastSyncedAt;

  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail("Not provided");
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.tabBar,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Settings</Text>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={styles.rowContent}>
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
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: theme.interaction.pressedOpacity },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => TrueSheet.present("theme-picker")}
          >
            <Ionicons
              name="sunny-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Theme</Text>
              <Text style={styles.rowSubtitle}>
                {preferenceLabel(preference)}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </Pressable>
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons
              name={
                !isConnected
                  ? "cloud-offline"
                  : hasError && !hasSynced
                    ? "cloud-offline"
                    : hasSynced
                      ? "checkmark-circle"
                      : "sync"
              }
              size={20}
              color={
                !isConnected
                  ? theme.colors.onSurfaceVariant
                  : hasError && !hasSynced
                    ? theme.colors.error
                    : hasSynced
                      ? theme.colors.success
                      : theme.colors.onWarning
              }
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Sync status</Text>
              <Text style={styles.rowSubtitle}>
                {!isConnected
                  ? "Offline · changes saved locally"
                  : hasError && !hasSynced
                    ? "Sync error · working offline"
                    : hasSynced
                      ? lastSyncedAt
                        ? `Last synced ${formatRelativeTime(lastSyncedAt)}`
                        : "Synced"
                      : "Syncing your data…"}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text
                style={
                  !isConnected
                    ? styles.offlineBadge
                    : hasError && !hasSynced
                      ? styles.errorBadge
                      : hasSynced
                        ? styles.syncedBadge
                        : styles.syncingBadge
                }
              >
                {!isConnected
                  ? "Offline"
                  : hasError && !hasSynced
                    ? "Error"
                    : hasSynced
                      ? "Synced"
                      : "Syncing…"}
              </Text>
            </View>
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: theme.interaction.pressedOpacity },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => TrueSheet.present("feedback-picker")}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Send feedback</Text>
              <Text style={styles.rowSubtitle}>
                Report a bug or suggest a feature
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </Pressable>
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
              <Text style={styles.badgeText}>
                {Application.nativeApplicationVersion ?? "?.?.?"} (
                {Application.nativeBuildVersion ?? "?"})
              </Text>
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

      <DropdownMenu
        name="theme-picker"
        title="Theme"
        showTrigger={false}
        options={[
          {
            icon: "phone-portrait-outline",
            label: "System Default",
            selected: preference === "system",
            onPress: () => setThemePreference("system"),
          },
          {
            icon: "sunny-outline",
            label: "Light",
            selected: preference === "light",
            onPress: () => setThemePreference("light"),
          },
          {
            icon: "moon-outline",
            label: "Dark",
            selected: preference === "dark",
            onPress: () => setThemePreference("dark"),
          },
        ]}
      />

      <DropdownMenu
        name="feedback-picker"
        title="Send feedback"
        showTrigger={false}
        options={(
          Object.entries(feedbackTemplates) as [
            keyof typeof feedbackTemplates,
            (typeof feedbackTemplates)[keyof typeof feedbackTemplates],
          ][]
        ).map(([, tpl]) => ({
          icon: tpl.icon,
          label: tpl.label,
          onPress: () => {
            return Linking.openURL(
              `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`,
            );
          },
        }))}
      />
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function preferenceLabel(preference: ThemePreference): string {
  switch (preference) {
    case "system":
      return "System default";
    case "light":
      return "Light";
    case "dark":
      return "Dark";
  }
}

// ─── Row helper ──────────────────────────────────────────────────────────────

function SettingsRow({
  icon,
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
