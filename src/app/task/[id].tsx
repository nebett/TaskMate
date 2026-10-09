import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Chip, Empty, ProgressBar, card } from '../../components/ui';
import { useTasks } from '../../store/TaskContext';
import { C, PRIORITY, STATUS } from '../../theme';
import { countdown, daysLeft, fmtDate } from '../../utils/date';

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, setProgress, markDone, deleteTask } = useTasks();
  const t = tasks.find((x) => x.id === id);

  if (!t) return <Empty icon="alert-circle-outline" title="Tugas tidak ditemukan" text="Tugas ini mungkin sudah dihapus." />;

  const p = PRIORITY[t.priority];
  const st = STATUS[t.status];
  const left = daysLeft(t.deadline);
  const done = t.status === 'Selesai';

  const remove = () => Alert.alert('Hapus tugas?', `"${t.title}" akan dihapus permanen.`, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Hapus', style: 'destructive', onPress: () => { deleteTask(t.id); router.back(); } },
  ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={card}>
        <Text style={s.title}>{t.title}</Text>
        <Text style={s.course}>{t.course}</Text>
        <View style={s.badges}>
          <Badge label={p.label} color={p.color} bg={p.bg} dot />
          <View style={{ width: 8 }} />
          <Badge label={t.status} color={st.color} bg={st.bg} />
        </View>
        <View style={s.info}><Text style={s.k}>Deadline</Text><Text style={s.v}>{fmtDate(t.deadline)}</Text></View>
        <View style={s.info}>
          <Text style={s.k}>Countdown</Text>
          <Text style={[s.v, !done && left <= 1 && { color: C.danger }]}>{done ? 'Selesai ✅' : countdown(left)}</Text>
        </View>
      </View>

      <View style={[card, { marginTop: 14 }]}>
        <View style={s.rowBetween}><Text style={s.h}>Progress</Text><Text style={s.pct}>{t.progress}%</Text></View>
        <View style={{ marginVertical: 12 }}><ProgressBar value={t.progress} color={done ? C.ok : C.primary} /></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[0, 25, 50, 75, 100].map((n) => <Chip key={n} label={`${n}%`} active={t.progress === n} onPress={() => setProgress(t.id, n)} />)}
        </View>
      </View>

      <View style={[card, { marginTop: 14 }]}>
        <Text style={s.h}>Catatan</Text>
        <Text style={s.notes}>{t.notes || 'Tidak ada catatan.'}</Text>
      </View>

      <Pressable style={[s.btn, { backgroundColor: C.primary }]} onPress={() => router.push({ pathname: '/task/form', params: { id: t.id } })}>
        <Ionicons name="create-outline" size={20} color="#fff" /><Text style={s.btnT}>Edit Tugas</Text>
      </Pressable>
      {done ? (
        <Pressable style={[s.btn, s.outline]} onPress={() => setProgress(t.id, 75)}>
          <Ionicons name="refresh" size={20} color={C.primary} /><Text style={[s.btnT, { color: C.primary }]}>Buka Kembali</Text>
        </Pressable>
      ) : (
        <Pressable style={[s.btn, { backgroundColor: C.ok }]} onPress={() => markDone(t.id)}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={s.btnT}>Tandai Selesai</Text>
        </Pressable>
      )}
      <Pressable style={[s.btn, s.outline, { borderColor: '#FCA5A5' }]} onPress={remove}>
        <Ionicons name="trash-outline" size={20} color={C.danger} /><Text style={[s.btnT, { color: C.danger }]}>Hapus Tugas</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: C.text },
  course: { fontSize: 14, color: C.sub, marginTop: 4 },
  badges: { flexDirection: 'row', marginTop: 14, marginBottom: 6 },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  k: { color: C.sub, fontSize: 14 },
  v: { color: C.text, fontSize: 14, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h: { fontSize: 16, fontWeight: '700', color: C.text },
  pct: { fontSize: 20, fontWeight: '800', color: C.primary },
  notes: { marginTop: 8, color: C.sub, lineHeight: 21 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 15, marginTop: 12 },
  btnT: { color: '#fff', fontSize: 15, fontWeight: '800', marginLeft: 8 },
  outline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.primary },
});
