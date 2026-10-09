import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TaskProvider } from '../store/TaskContext';
import { C } from '../theme';

export default function RootLayout() {
  return (
    <TaskProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: C.primary,
          headerStyle: { backgroundColor: C.bg },
          headerShadowVisible: false,
          headerTitleStyle: { color: C.text, fontWeight: '700' },
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Detail Tugas' }} />
        <Stack.Screen name="task/form" options={{ title: 'Tambah Tugas', presentation: 'modal' }} />
      </Stack>
    </TaskProvider>
  );
}
