import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Empty, Fab, H1, ProgressBar, Screen, SectionTitle, card } from '../../components/ui';
import TaskCard from '../../components/TaskCard';
import { useTasks } from '../../store/TaskContext';
import { C, USER } from '../../theme';
import { daysLeft } from '../../utils/date';

export default function Home() {
  const { tasks, loading } = useTasks();
  const router = useRouter();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={C.primary} /></View>;

  const n = (st: string) => tasks.filter((t) => t.status === st).length;
  const stats = [
    { label: 'Total Tugas', v: tasks.length, icon: 'layers', color: C.primary },
    { label: 'Belum Selesai', v: tasks.length - n('Selesai'), icon: 'time', color: '#D97706' },
    { label: 'Sedang Dikerjakan', v: n('Sedang Dikerjakan'), icon: 'flash', color: '#2563EB' },
    { label: 'Selesai', v: n('Selesai'), icon: 'checkmark-circle', color: C.ok },
  ] as const;

  const upcoming = tasks.filter((t) => t.status !== 'Selesai')
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline)).slice(0, 3);

  const week = tasks.filter((t) => { const d = daysLeft(t.deadline); return d >= -7 && d <= 7; });
  const pct = week.length ? Math.round(week.reduce((a, t) => a + t.progress, 0) / week.length) : 0;
  const doneWeek = week.filter((t) => t.status === 'Selesai').length;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <H1>Halo, {USER.name} 👋</H1>
        <Text style={s.sub}>Yuk, selesaikan tugasmu hari ini.</Text>

        <View style={s.grid}>
          {stats.map((x) => (
            <View key={x.label} style={s.stat}>
              <Ionicons name={x.icon} size={22} color={x.color} />
              <Text style={s.statV}>{x.v}</Text>
              <Text style={s.statL}>{x.label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle>Deadline Terdekat</SectionTitle>
        {upcoming.length === 0
          ? <Empty icon="happy-outline" title="Tidak ada tugas aktif" text="Tekan tombol + untuk menambahkan tugas baru." />
          : upcoming.map((t) => <TaskCard key={t.id} task={t} />)}

        <SectionTitle>Progress Minggu Ini</SectionTitle>
        <View style={s.hero}>
          <Text style={s.heroPct}>{pct}%</Text>
          <Text style={s.heroSub}>{doneWeek} dari {week.length} tugas selesai</Text>
          <View style={{ marginTop: 14 }}><ProgressBar value={pct} color="#fff" track="rgba(255,255,255,0.3)" /></View>
        </View>
      </Screen>
      <Fab onPress={() => router.push('/task/form')} />
    </View>
  );
}

const s = StyleSheet.create({
  sub: { fontSize: 15, color: C.sub, marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stat: { ...card, width: '48%', marginBottom: 12, padding: 14 },
  statV: { fontSize: 28, fontWeight: '800', color: C.text, marginTop: 6 },
  statL: { fontSize: 12, color: C.sub, marginTop: 2 },
  hero: { backgroundColor: C.primary, borderRadius: 24, padding: 20 },
  heroPct: { fontSize: 44, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
});
