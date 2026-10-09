import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Empty, H1, Screen, SectionTitle, card } from '../../components/ui';
import { useTasks } from '../../store/TaskContext';
import { C } from '../../theme';
import { daysLeft } from '../../utils/date';

export default function Reminders() {
  const { tasks } = useTasks();
  const router = useRouter();
  const active = tasks.filter((t) => t.status !== 'Selesai')
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
    .map((t) => ({ t, d: daysLeft(t.deadline) }));

  const groups = [
    { title: 'TERLAMBAT', items: active.filter((x) => x.d < 0) },
    { title: 'TODAY', items: active.filter((x) => x.d === 0) },
    { title: 'TOMORROW', items: active.filter((x) => x.d === 1) },
    { title: 'THIS WEEK', items: active.filter((x) => x.d >= 2 && x.d <= 7) },
  ].filter((g) => g.items.length > 0);

  const head = (d: number) => d < 0 ? 'Deadline Terlewat' : d === 0 ? 'Deadline Hari Ini' : d === 1 ? 'Deadline Besok' : `Deadline ${d} Hari Lagi`;
  const msg = (d: number) => d < 0 ? `Terlambat ${-d} hari.` : d === 0 ? 'Deadline hari ini.' : d === 1 ? 'Deadline besok.' : `Deadline ${d} hari lagi.`;

  return (
    <Screen>
      <H1>Reminder</H1>
      {groups.length === 0 && <Empty icon="notifications-off-outline" title="Tidak ada reminder" text="Semua tugas aman. Tambahkan tugas dengan deadline untuk mendapat pengingat." />}
      {groups.map((g) => (
        <View key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          {g.items.map(({ t, d }) => {
            const hot = d <= 1;
            return (
              <Pressable key={t.id} onPress={() => router.push(`/task/${t.id}`)} style={[card, s.item]}>
                <View style={[s.icon, { backgroundColor: hot ? '#FEE2E2' : C.primarySoft }]}>
                  <Ionicons name={hot ? 'warning' : 'notifications'} size={20} color={hot ? C.danger : C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.head, hot && { color: C.danger }]}>{head(d)}</Text>
                  <Text style={s.title}>{t.title}</Text>
                  <Text style={s.sub}>{t.course}</Text>
                  <Text style={s.msg}>"{msg(d)}"</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', marginBottom: 12 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  head: { fontSize: 12, fontWeight: '700', color: C.primary },
  title: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 2 },
  sub: { fontSize: 13, color: C.sub },
  msg: { fontSize: 13, color: C.text, marginTop: 6, fontStyle: 'italic' },
});
