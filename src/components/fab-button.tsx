import { borderRadius } from "@/constants/theme";
import { useDbNotes } from "@/hooks/use-db-notes";
import { useDbProjects } from "@/hooks/use-db-projects";
import { useDbTags } from "@/hooks/use-db-tags";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import type { FabType } from "@/types/fab";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import PromptModal from "./prompt-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAB_CONFIGS: Record<
  FabType,
  {
    title: string;
    placeholder: string;
    confirmLabel: string;
  }
> = {
  note: {
    title: "Add Note",
    placeholder: "Note title...",
    confirmLabel: "Add",
  },
  project: {
    title: "Add Project",
    placeholder: "Project title...",
    confirmLabel: "Add",
  },
  tag: {
    title: "Add Tag",
    placeholder: "Tag name...",
    confirmLabel: "Add",
  },
};

type FabButtonProps = {
  type: FabType;
  name: string;
};

function createStyles(theme: Theme, insetsBottom: number) {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: theme.spacing.tabBar + theme.spacing.sm + insetsBottom,
      right: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: borderRadius.xl,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadows.lg,
    },
  });
}

export default function FabButton({ type, name }: FabButtonProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);

  const { insertNote } = useDbNotes();
  const { insertProject } = useDbProjects();
  const { insertTag } = useDbTags();

  const insertFn = useMemo(() => {
    switch (type) {
      case "note":
        return insertNote;
      case "project":
        return insertProject;
      case "tag":
        return insertTag;
    }
  }, [type, insertNote, insertProject, insertTag]);

  const config = FAB_CONFIGS[type];

  const handleConfirm = useCallback(
    (value: string) => {
      insertFn(value);
    },
    [insertFn],
  );

  const handleCancel = useCallback(() => {}, []);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { opacity: pressed ? theme.interaction.pressedOpacity : 1 },
        ]}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        onPress={() => TrueSheet.present(name)}
      >
        <Ionicons name="add" size={28} color={theme.colors.onPrimary} />
      </Pressable>
      <PromptModal
        name={name}
        title={config.title}
        placeholder={config.placeholder}
        confirmLabel={config.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
