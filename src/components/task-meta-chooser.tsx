import { borderRadius, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { formatDate } from "@/utils/format-date";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface TaskMetaChooserProps {
  selectedTagIds: string[];
  selectedProjectId: string | null;
  dueDate: Date | null;
  onTagPress: () => void;
  onProjectPress: () => void;
  onDueDatePress: () => void;
  onClearDueDate?: () => void;
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      minHeight: 48,
    },
    detailLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    detailValue: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      marginRight: spacing.sm,
    },
    detailValueRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
}

export default function TaskMetaChooser({
  selectedTagIds,
  selectedProjectId,
  dueDate,
  onTagPress,
  onProjectPress,
  onDueDatePress,
  onClearDueDate,
}: TaskMetaChooserProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <Pressable
        style={styles.detailRow}
        onPress={onTagPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.detailLabel}>Tag</Text>
        <View style={styles.detailValueRow}>
          <Text style={styles.detailValue}>
            {selectedTagIds.length > 0
              ? `${selectedTagIds.length} selected`
              : "None"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </Pressable>
      <Pressable
        style={styles.detailRow}
        onPress={onProjectPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.detailLabel}>Project</Text>
        <View style={styles.detailValueRow}>
          <Text style={styles.detailValue}>
            {selectedProjectId ? "Selected" : "None"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </Pressable>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Due date</Text>
        <View style={styles.detailValueRow}>
          <Pressable
            onPress={onDueDatePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>
                {dueDate ? formatDate(dueDate) : "None"}
              </Text>
              {!dueDate ? (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              ) : null}
            </View>
          </Pressable>
          {dueDate ? (
            <View style={styles.detailValueRow}>
              <Pressable
                onPress={onClearDueDate}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.onSurfaceVariant}
                style={{ marginLeft: spacing.sm }}
              />
            </View>
          ) : null}
        </View>
      </View>
    </>
  );
}
