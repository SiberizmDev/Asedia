import { Tabs } from 'expo-router';
import { Moon, Focus, Wind, Heart, Settings, TreeDeciduousIcon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background[0],
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Atmosfer',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TreeDeciduousIcon size={size} color={color} />
          ),
        }}
      />
       <Tabs.Screen
        name="feel"
        options={{
          title: 'Hisset',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="relax"
        options={{
          title: 'Esinti',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Wind size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}