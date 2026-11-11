import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { DeadlineField } from '../../components/DeadlinePicker';
import { Btn, Chip, ChipRow, Field, Page, Seg, TextField } from '../../components/ui';
import { useTasks } from '../../store/TaskContext';
import { COURSES, T, useTheme } from '../../theme';
import { Priority, Status } from '../../types';
import { presetDate } from '../../utils/date';

export default function TaskFormScreen() {
  const { loading } = useTasks();
  // Tunggu data dimuat agar form edit terisi benar saat halaman di-refresh.
  return loading ? null : <TaskForm />;
}

function TaskForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, addTask, updateTask } = useTasks();
  const { c } = useTheme();
  const router = useRouter();
  const editing = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [course, setCourse] = useState(editing?.course ?? '');
  const [deadline, setDeadline] = useState<Date | null>(editing ? (editing.deadline ? new Date(editing.deadline) : null) : presetDate(1));
  const [priority, setPriority] = useState<Priority>(editing?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<Status>(editing?.status ?? 'Belum Mulai');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [errors, setErrors] = useState<{ title?: string; course?: string }>({});
  const [saving, setSaving] = useState(false);

  const courses = [...new Set([...COURSES, ...tasks.map((t) => t.course)])];
  const back = () => (router.canGoBack() ? router.back() : router.replace('/tasks'));

  const save = async () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Nama tugas belum diisi. Ketik nama tugas, misalnya "Laporan Praktikum".';
    if (!course.trim()) e.course = 'Mata kuliah belum diisi. Ketik nama mata kuliah atau pilih salah satu dari daftar di bawah.';
    setErrors(e);
    if (e.title || e.course) return;
    setSaving(true);
    const data = { title: title.trim(), course: course.trim(), deadline: deadline ? deadline.toISOString() : null, priority, status, notes: notes.trim() };
    const ok = editing ? await updateTask(editing.id, data) : await addTask(data);
    setSaving(false);
    if (ok) back();
  };

  return (
    <Page inset={false} maxWidth={640}>
      <Stack.Screen options={{ title: editing ? 'Edit Tugas' : 'Tambah Tugas' }} />
      <TextField label="Nama Tugas" value={title} onChangeText={(v) => { setTitle(v); if (errors.title) setErrors({ ...errors, title: undefined }); }}
        placeholder="Contoh: Laporan Praktikum" error={errors.title} returnKeyType="next" />

      <TextField label="Mata Kuliah" value={course} onChangeText={(v) => { setCourse(v); if (errors.course) setErrors({ ...errors, course: undefined }); }}
        placeholder="Ketik atau pilih di bawah" error={errors.course} />
      <View style={{ marginTop: 10 }}>
        <ChipRow>{courses.map((name) => <Chip key={name} label={name} selected={course === name} onPress={() => { setCourse(name); setErrors({ ...errors, course: undefined }); }} />)}</ChipRow>
      </View>

      <DeadlineField value={deadline} onChange={setDeadline} />

      <Field label="Prioritas">
        <Seg<Priority> label="Prioritas" value={priority} onChange={setPriority}
          options={[{ v: 'LOW', label: 'Rendah' }, { v: 'MEDIUM', label: 'Sedang' }, { v: 'HIGH', label: 'Tinggi' }]} />
      </Field>
      <Field label="Status">
        <Seg<Status> label="Status" value={status} onChange={setStatus}
          options={[{ v: 'Belum Mulai', label: 'Belum Mulai' }, { v: 'Sedang Dikerjakan', label: 'Dikerjakan' }, { v: 'Selesai', label: 'Selesai' }]} />
      </Field>

      <TextField label="Catatan" value={notes} onChangeText={setNotes} multiline placeholder="Opsional" hint="Tambahkan detail seperti format pengumpulan atau tautan materi." />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
        <View style={{ flex: 1 }}><Btn variant="secondary" label="Batal" onPress={back} disabled={saving} /></View>
        <View style={{ flex: 2 }}><Btn label={saving ? 'Menyimpan...' : 'Simpan Tugas'} icon="check" onPress={save} loading={saving} /></View>
      </View>
      <Text style={[T.small, { color: c.muted, marginTop: 12 }]}>Data disimpan di perangkat ini.</Text>
    </Page>
  );
}
