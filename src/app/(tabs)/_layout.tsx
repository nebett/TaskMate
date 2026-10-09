import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme';

type Icon = keyof typeof Ionicons.glyphMap;
const icon = (name: string) =>
  function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return <Ionicons name={(focused ? name : `${name}-outline`) as Icon} size={24} color={color} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: C.border, paddingTop: 4 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tugas', tabBarIcon: icon('checkbox') }} />
      <Tabs.Screen name="calendar" options={{ title: 'Kalender', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminder', tabBarIcon: icon('notifications') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
