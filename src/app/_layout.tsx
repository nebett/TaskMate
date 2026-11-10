import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Sidebar } from '../components/Sidebar';
import { ToastProvider } from '../components/Toast';
import { useLayout } from '../hooks/useLayout';
import { TaskProvider, useTasks } from '../store/TaskContext';
import { T, ThemeProvider, useTheme } from '../theme';

function Shell() {
  const { c, isDark } = useTheme();
  const { isDesktop } = useLayout();
  const { loading } = useTasks();
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {isDesktop && <Sidebar />}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{
          headerTintColor: c.primaryText, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false,
          headerTitleStyle: { color: c.text, fontWeight: '600' }, contentStyle: { backgroundColor: c.bg }, headerBackTitle: 'Kembali',
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="task/[id]" options={{ title: 'Detail Tugas' }} />
          <Stack.Screen name="task/form" options={{ title: 'Tambah Tugas' }} />
        </Stack>
        {loading && (
          <View accessibilityLiveRegion="polite" style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', gap: 12 }]}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[T.body, { color: c.muted }]}>Memuat tugas...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TaskProvider>
          <Shell />
        </TaskProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
