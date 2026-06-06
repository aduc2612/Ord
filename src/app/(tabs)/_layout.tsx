import CustomTabBar from "@/components/custom-tab-bar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      {__DEV__ && <Tabs.Screen name="db-test" />}
      <Tabs.Screen name="lists" />
      <Tabs.Screen name="inbox" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
      <Tabs.Screen name="completed-tasks" options={{ href: null }} />
      <Tabs.Screen name="archived-projects" options={{ href: null }} />
      <Tabs.Screen name="review" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
