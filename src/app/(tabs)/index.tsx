import SearchBar from "@/components/search-bar";
import SegmentedControl from "@/components/segmented-control";
import FabButton from "@/components/fab-button";
import {
  componentStyles,
  spacing,
  typography,
} from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const summaryOptions: { label: string; value: number }[] = [
  { label: "Inbox count", value: 15 },
  { label: "Last reviewed", value: 15 },
  { label: "Waiting For", value: 15 },
  { label: "Projects count", value: 15 },
  { label: "Overdue", value: 15 },
];

const segmentOptions = [
  { label: "Due Today", value: "due_today" },
  { label: "Next", value: "next" },
  { label: "Waiting For", value: "waiting_for" },
];

const fillerTasks: Record<string, string[]> = {
  due_today: ["Task 1", "Task 2", "Task 3", "Task 4"],
  next: ["Next Action 1", "Next Action 2"],
  waiting_for: ["Waiting: Client reply", "Waiting: Approval"],
};

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
      marginBottom: spacing.md,
    },
    summaryCard: {
      ...componentStyles.card,
      backgroundColor: theme.colors.surface,
      // ...shadows.md,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    summaryLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    summaryValue: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      fontWeight: "600",
    },
    taskListContainer: {
      gap: spacing.sm,
    },
    taskItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: componentStyles.card.borderRadius,
      padding: spacing.lg,
      gap: spacing.sm,
      // ...shadows.sm,
    },
    taskDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.onSurface,
    },
    taskText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    filterButton: {
      padding: spacing.sm,
    },
  });
}

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("due_today");

  const currentTasks = fillerTasks[selectedSegment] ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.header}>Home</Text>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks"
            style={{ flex: 1 }}
          />
          <Pressable
            style={styles.filterButton}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="filter" size={24} color={theme.colors.onSurface} />
          </Pressable>
        </View>

        {/* Summary Statistics Card */}
        <View style={styles.summaryCard}>
          {summaryOptions.map((item) => (
            <View key={item.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Segmented Control */}
        <SegmentedControl
          options={segmentOptions}
          selectedValue={selectedSegment}
          onSelect={setSelectedSegment}
        />

        {/* Task List */}
        <View style={styles.taskListContainer}>
          {currentTasks.map((task) => (
            <View key={task} style={styles.taskItem}>
              <View style={styles.taskDot} />
              <Text style={styles.taskText}>{task}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <FabButton type="note" />
    </View>
  );
}
