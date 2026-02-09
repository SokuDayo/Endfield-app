import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

const TabLayout = () => {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="farming"
        options={{
          title: "Farming",
          tabBarIcon: ({ color }) => (
            <Icon name="sword" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="essence"
        options={{
          title: "Essence",
          tabBarIcon: ({ color }) => (
            <Icon name="crystal-ball" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
