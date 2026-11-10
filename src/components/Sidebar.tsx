import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Btn, Icon, IconName, ThemeSwitch, useFocusRing } from './ui';
import { SIDEBAR_W } from '../hooks/useLayout';
import { R, T, useTheme } from '../theme';

export const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/tasks', label: 'Tugas', icon: 'check-square' },
  { href: '/calendar', label: 'Kalender', icon: 'calendar' },
  { href: '/reminders', label: 'Reminder', icon: 'bell' },
  { href: '/profile', label: 'Profil', icon: 'user' },
];

export const isActive = (href: string, path: string) =>
  href === '/' ? path === '/' : href === '/tasks' ? path.startsWith('/task') : path.startsWith(href);

function Item({ href, label, icon, active }: { href: string; label: string; icon: IconName; active: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const f = useFocusRing();
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} accessibilityState={{ selected: active }}
      onPress={() => router.navigate(href as any)} {...f.handlers}
      style={(s: any) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: R.md,
        backgroundColor: active ? c.primarySoft : s.hovered ? c.surfaceAlt : 'transparent' }, f.ring]}>
      <Icon name={icon} size={19} color={active ? c.primaryText : c.muted} />
      <Text style={{ fontSize: 15, fontWeight: active ? '700' : '500', color: active ? c.primaryText : c.text }}>{label}</Text>
    </Pressable>
  );
}

export function Sidebar() {
  const { c } = useTheme();
  const router = useRouter();
  const path = usePathname();
  return (
    <View role="navigation" style={{ width: SIDEBAR_W, backgroundColor: c.surface, borderRightWidth: 1, borderRightColor: c.border, paddingVertical: 24, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 }}>
        <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={22} color={c.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>TaskMate</Text>
          <Text style={[T.tiny, { color: c.muted }]}>One Place for All Your College Tasks</Text>
        </View>
      </View>
      <View style={{ marginTop: 24 }}><Btn label="Tambah Tugas" icon="plus" onPress={() => router.push('/task/form')} /></View>
      <View style={{ marginTop: 20, gap: 4 }}>
        {NAV.map((n) => <Item key={n.href} {...n} active={isActive(n.href, path)} />)}
      </View>
      <View style={{ flex: 1 }} />
      <Text style={[T.tiny, { color: c.muted, marginBottom: 8, fontWeight: '600' }]}>TEMA</Text>
      <ThemeSwitch />
    </View>
  );
}
