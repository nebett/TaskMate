import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, H1, Screen, SectionTitle, card } from '../../components/ui';
import { useTasks } from '../../store/TaskContext';
import { C, USER } from '../../theme';
import { daysLeft } from '../../utils/date';

const SOON = [
  { icon: 'school', label: 'Integrasi LMS Kampus' },
  { icon: 'logo-google', label: 'Google Classroom' },
  { icon: 'calendar', label: 'Google Calendar' },
  { icon: 'sparkles', label: 'Smart Reminder' },
  { icon: 'stats-chart', label: 'Statistik Produktivitas' },
] as const;

export default function Profile() {
  const { tasks, resetDemo } = useTasks();
  const done = tasks.filter((t) => t.status === 'Selesai').length;
  const active = tasks.length - done;
  const week = tasks.filter((t) => t.status !== 'Selesai' && daysLeft(t.deadline) >= 0 && daysLeft(t.deadline) <= 7).length;

  const reset = () => Alert.alert('Reset data demo?', 'Semua tugas akan diganti dengan data contoh awal.', [
    { text: 'Batal', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: resetDemo },
  ]);

  return (
    <Screen>
      <H1>Profil</H1>
      <View style={[card, s.top]}>
        <View style={s.avatar}><Text style={s.avatarT}>{USER.name[0]}</Text></View>
        <Text style={s.name}>{USER.name}</Text>
        <Text style={s.sub}>Mahasiswa • Semester {USER.semester}</Text>
      </View>

      <View style={s.row}>
        {[{ v: done, l: 'Tugas Selesai' }, { v: active, l: 'Tugas Aktif' }, { v: week, l: 'Deadline Minggu Ini' }].map((x) => (
          <View key={x.l} style={[card, s.stat]}>
            <Text style={s.statV}>{x.v}</Text>
            <Text style={s.statL}>{x.l}</Text>
          </View>
        ))}
      </View>

      <View style={[card, { marginTop: 16, backgroundColor: C.primarySoft }]}>
        <Text style={s.brand}>TaskMate — Teman Ngatur Tugas Kuliah.</Text>
        <Text style={s.sub}>Kelola tugas kuliah dalam satu tempat, ingat deadline, tentukan prioritas, dan selesaikan tugas tepat waktu.</Text>
      </View>

      <SectionTitle>SEGERA HADIR 🚀</SectionTitle>
      <View style={card}>
        {SOON.map((x, i) => (
          <View key={x.label} style={[s.soon, i > 0 && { borderTopWidth: 1, borderTopColor: C.border }]}>
            <Ionicons name={x.icon} size={20} color={C.sub} />
            <Text style={s.soonT}>{x.label}</Text>
            <Badge label="Coming Soon" color={C.sub} bg="#F3F4F6" />
          </View>
        ))}
      </View>

      <Pressable onPress={reset} style={s.reset}>
        <Ionicons name="refresh" size={18} color={C.sub} />
        <Text style={s.resetT}>Reset data demo</Text>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  top: { alignItems: 'center', marginTop: 16, paddingVertical: 24 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarT: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 12 },
  sub: { fontSize: 13, color: C.sub, marginTop: 4, lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  stat: { width: '31.5%', alignItems: 'center', padding: 12 },
  statV: { fontSize: 26, fontWeight: '800', color: C.primary },
  statL: { fontSize: 11, color: C.sub, textAlign: 'center', marginTop: 2 },
  brand: { fontSize: 15, fontWeight: '800', color: C.primary, marginBottom: 4 },
  soon: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, opacity: 0.75 },
  soonT: { flex: 1, marginLeft: 12, fontSize: 14, color: C.text, fontWeight: '600' },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, padding: 12 },
  resetT: { marginLeft: 6, color: C.sub, fontWeight: '600' },
});
