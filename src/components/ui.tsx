import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../theme';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { top } = useSafeAreaInsets();
  const base = { flex: 1, backgroundColor: C.bg, paddingTop: top + 8 };
  if (!scroll) return <View style={[base, { paddingHorizontal: 20 }]}>{children}</View>;
  return (
    <ScrollView style={base} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export const H1 = ({ children }: { children: React.ReactNode }) => <Text style={s.h1}>{children}</Text>;
export const SectionTitle = ({ children }: { children: React.ReactNode }) => <Text style={s.section}>{children}</Text>;

export function Badge({ label, color, bg, dot }: { label: string; color: string; bg: string; dot?: boolean }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      {dot && <View style={[s.dot, { backgroundColor: color }]} />}
      <Text style={[s.badgeT, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = C.primary, track = '#E5E7EB' }: { value: number; color?: string; track?: string }) {
  return (
    <View style={[s.track, { backgroundColor: track }]}>
      <View style={[s.fill, { width: `${value}%` as `${number}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: C.primary, borderColor: C.primary }]}>
      <Text style={[s.chipT, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Seg<T extends string>({ options, value, onChange, colors }: {
  options: { v: T; label: string }[]; value: T; onChange: (v: T) => void; colors?: Record<string, string>;
}) {
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const on = o.v === value;
        return (
          <Pressable key={o.v} onPress={() => onChange(o.v)} style={[s.segI, on && { backgroundColor: colors?.[o.v] ?? C.primary }]}>
            <Text style={[s.segT, on && { color: '#fff' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.fab, pressed && { transform: [{ scale: 0.94 }] }]}>
      <Ionicons name="add" size={30} color="#fff" />
    </Pressable>
  );
}

export function Empty({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}><Ionicons name={icon} size={32} color={C.primary} /></View>
      <Text style={s.emptyT}>{title}</Text>
      <Text style={s.emptyS}>{text}</Text>
    </View>
  );
}

export const card = { backgroundColor: C.card, borderRadius: 20, padding: 16, ...shadow };

const s = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '800', color: C.text },
  section: { fontSize: 17, fontWeight: '700', color: C.text, marginTop: 24, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeT: { fontSize: 12, fontWeight: '700' },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, marginRight: 8 },
  chipT: { fontSize: 13, fontWeight: '600', color: C.sub },
  seg: { flexDirection: 'row', backgroundColor: '#E9EAF3', borderRadius: 14, padding: 4 },
  segI: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 11 },
  segT: { fontSize: 13, fontWeight: '700', color: C.sub },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', ...shadow, shadowColor: C.primary, shadowOpacity: 0.4, elevation: 8 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyT: { fontSize: 16, fontWeight: '700', color: C.text },
  emptyS: { fontSize: 13, color: C.sub, textAlign: 'center', marginTop: 4 },
});
