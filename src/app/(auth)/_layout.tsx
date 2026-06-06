import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "fade",
        animationDuration: 200,
      }}
    />
  );
}
