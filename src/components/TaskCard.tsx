import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Task } from '../types';
import { C, PRIORITY, STATUS, shadow } from '../theme';
import { countdown, daysLeft, fmtDate } from '../utils/date';
import { Badge, ProgressBar } from './ui';

export default function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const p = PRIORITY[task.priority];
  const st = STATUS[task.status];
  const left = daysLeft(task.deadline);
  const urgent = task.status !== 'Selesai' && left <= 1;
  return (
    <Pressable onPress={() => router.push(`/task/${task.id}`)} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
      <View style={s.row}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[s.title, task.status === 'Selesai' && s.done]} numberOfLines={1}>{task.title}</Text>
          <Text style={s.course} numberOfLines={1}>{task.course}</Text>
        </View>
        <Badge label={task.status === 'Sedang Dikerjakan' ? 'Dikerjakan' : task.status} color={st.color} bg={st.bg} />
      </View>
      <View style={[s.row, { marginTop: 12 }]}>
        <Text style={s.meta}>📅 {fmtDate(task.deadline)}</Text>
        <Text style={[s.meta, urgent && { color: C.danger, fontWeight: '700' }]}>{countdown(left)}</Text>
      </View>
      <View style={[s.row, { marginTop: 10 }]}>
        <Badge label={p.label} color={p.color} bg={p.bg} dot />
        <Text style={s.meta}>Progress {task.progress}%</Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <ProgressBar value={task.progress} color={task.status === 'Selesai' ? C.ok : C.primary} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  done: { textDecorationLine: 'line-through', color: C.sub },
  course: { fontSize: 13, color: C.sub, marginTop: 2 },
  meta: { fontSize: 13, color: C.sub },
});
