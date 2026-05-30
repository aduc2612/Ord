import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      {__DEV__ && <Tabs.Screen name="db-test" options={{ headerShown: false }} />}
      <Tabs.Screen name="lists" options={{ headerShown: false }} />
      <Tabs.Screen name="inbox" options={{ headerShown: false }} />
    </Tabs>
  );
}
