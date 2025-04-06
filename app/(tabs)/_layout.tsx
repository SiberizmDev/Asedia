import { Tabs } from 'expo-router';
import { Moon, Heart, Settings, TreeDeciduousIcon } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#101013',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Atmosfer',
          tabBarIcon: ({ size, color }) => (
            <TreeDeciduousIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="relax"
        options={{
          title: 'Rahatlama',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}