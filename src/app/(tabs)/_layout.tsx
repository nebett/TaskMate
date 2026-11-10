import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { IconName } from '../../components/ui';
import { NAV } from '../../components/Sidebar';
import { useLayout } from '../../hooks/useLayout';
import { useTheme } from '../../theme';

export default function TabsLayout() {
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  const { bottom } = useSafeAreaInsets();
  const icon = (name: IconName) =>
    function TabIcon({ color, focused }: { color: string | import('react-native').ColorValue; focused: boolean }) {
      return (
        <View style={{ width: 58, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? c.primarySoft : 'transparent' }}>
          <Feather name={name} size={21} color={color as string} />
        </View>
      );
    };
  const names = ['index', 'tasks', 'calendar', 'reminders', 'profile'];
  return (
    <Tabs screenOptions={{
      headerShown: false, sceneStyle: { backgroundColor: c.bg },
      tabBarActiveTintColor: c.primaryText, tabBarInactiveTintColor: c.muted,
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      tabBarStyle: isDesktop ? { display: 'none' } : { backgroundColor: c.surface, borderTopColor: c.border, paddingTop: 8, paddingBottom: bottom || 8, height: 66 + bottom },
    }}>
      {NAV.map((n, i) => (
        <Tabs.Screen key={n.href} name={names[i]} options={{ title: n.label, tabBarIcon: icon(n.icon), tabBarAccessibilityLabel: n.label }} />
      ))}
    </Tabs>
  );
}
