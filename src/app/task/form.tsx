import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Seg } from '../../components/ui';
import { useTasks } from '../../store/TaskContext';
import { C, COURSES, PRIORITY } from '../../theme';
import { addDays, fmtDate } from '../../utils/date';
import { Priority, Status } from '../../types';

const QUICK = [['Hari ini', 0], ['Besok', 1], ['3 hari', 3], ['1 minggu', 7]] as const;

export default function TaskForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, addTask, updateTask } = useTasks();
  const router = useRouter();
  const editing = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [course, setCourse] = useState(editing?.course ?? '');
  const [date, setDate] = useState<Date>(editing ? new Date(editing.deadline) : addDays(1));
  const [priority, setPriority] = useState<Priority>(editing?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<Status>(editing?.status ?? 'Belum Mulai');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [showPicker, setShowPicker] = useState(false);

  const save = () => {
    if (!title.trim() || !course.trim()) {
      Alert.alert('Lengkapi data', 'Nama tugas dan mata kuliah wajib diisi.');
      return;
    }
    const d = new Date(date); d.setHours(23, 59, 0, 0);
    const data = { title: title.trim(), course: course.trim(), deadline: d.toISOString(), priority, status, notes: notes.trim() };
    if (editing) updateTask(editing.id, data); else addTask(data);
    if (Platform.OS === 'android') ToastAndroid.show('Tugas disimpan ✅', ToastAndroid.SHORT);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: editing ? 'Edit Tugas' : 'Tambah Tugas' }} />

      <Text style={s.label}>Nama Tugas</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Contoh: Laporan Praktikum" placeholderTextColor="#9CA3AF" />

      <Text style={s.label}>Mata Kuliah</Text>
      <TextInput style={s.input} value={course} onChangeText={setCourse} placeholder="Ketik atau pilih di bawah" placeholderTextColor="#9CA3AF" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, flexGrow: 0 }}>
        {COURSES.map((c) => <Chip key={c} label={c} active={course === c} onPress={() => setCourse(c)} />)}
      </ScrollView>

      <Text style={s.label}>Deadline</Text>
      <Pressable style={[s.input, s.dateRow]} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-outline" size={20} color={C.primary} />
        <Text style={s.dateT}>{fmtDate(date)}</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, flexGrow: 0 }}>
        {QUICK.map(([l, n]) => <Chip key={l} label={l} onPress={() => setDate(addDays(n))} />)}
      </ScrollView>
      {showPicker && (
        <DateTimePicker value={date} mode="date" onChange={(_, d) => { setShowPicker(false); if (d) setDate(d); }} />
      )}

      <Text style={s.label}>Prioritas</Text>
      <Seg<Priority>
        value={priority} onChange={setPriority}
        options={(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((v) => ({ v, label: v }))}
        colors={{ LOW: PRIORITY.LOW.color, MEDIUM: PRIORITY.MEDIUM.color, HIGH: PRIORITY.HIGH.color }}
      />

      <Text style={s.label}>Status</Text>
      <Seg<Status>
        value={status} onChange={setStatus}
        options={[{ v: 'Belum Mulai', label: 'Belum Mulai' }, { v: 'Sedang Dikerjakan', label: 'Dikerjakan' }, { v: 'Selesai', label: 'Selesai' }]}
      />

      <Text style={s.label}>Catatan</Text>
      <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes}
        placeholder="Opsional" placeholderTextColor="#9CA3AF" multiline />

      <Pressable style={({ pressed }) => [s.btn, pressed && { opacity: 0.9 }]} onPress={save}>
        <Text style={s.btnT}>Simpan Tugas</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: C.text },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateT: { marginLeft: 10, fontSize: 15, color: C.text, fontWeight: '600' },
  btn: { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  btnT: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
