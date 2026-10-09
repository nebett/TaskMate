import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Empty, H1, Screen, SectionTitle, card } from '../../components/ui';
import TaskCard from '../../components/TaskCard';
import { useTasks } from '../../store/TaskContext';
import { C } from '../../theme';
import { DAYS, MONTHS, sameDay } from '../../utils/date';

export default function CalendarScreen() {
  const { tasks } = useTasks();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(today);

  const offset = (month.getDay() + 6) % 7; // minggu dimulai Senin
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  const on = (d: Date) => tasks.filter((t) => sameDay(new Date(t.deadline), d));
  const list = on(sel);
  const move = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <Screen>
      <H1>Kalender</H1>
      <View style={[card, { marginTop: 16 }]}>
        <View style={s.head}>
          <Pressable onPress={() => move(-1)} hitSlop={12}><Ionicons name="chevron-back" size={24} color={C.primary} /></Pressable>
          <Text style={s.month}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Text>
          <Pressable onPress={() => move(1)} hitSlop={12}><Ionicons name="chevron-forward" size={24} color={C.primary} /></Pressable>
        </View>
        <View style={s.wrap}>
          {DAYS.map((d) => <Text key={d} style={s.dow}>{d}</Text>)}
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={s.cell} />;
            const ts = on(d);
            const selected = sameDay(d, sel);
            return (
              <Pressable key={i} style={s.cell} onPress={() => setSel(d)}>
                <View style={[s.day, sameDay(d, today) && s.today, selected && s.selected]}>
                  <Text style={[s.dayT, selected && { color: '#fff' }]}>{d.getDate()}</Text>
                </View>
                <View style={[s.dot, { backgroundColor: ts.length ? (ts.every((t) => t.status === 'Selesai') ? C.ok : C.danger) : 'transparent' }]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <SectionTitle>{sel.getDate()} {MONTHS[sel.getMonth()]}</SectionTitle>
      {list.length === 0
        ? <Empty icon="calendar-clear-outline" title="Tidak ada deadline" text="Belum ada tugas pada tanggal ini." />
        : list.map((t) => <TaskCard key={t.id} task={t} />)}
    </Screen>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  month: { fontSize: 17, fontWeight: '700', color: C.text },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  dow: { width: '14.2857%', textAlign: 'center', fontSize: 12, color: C.sub, fontWeight: '600', marginBottom: 6 },
  cell: { width: '14.2857%', alignItems: 'center', paddingVertical: 3 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: C.primary },
  selected: { backgroundColor: C.primary },
  dayT: { fontSize: 14, color: C.text, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
});
