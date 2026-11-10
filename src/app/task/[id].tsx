import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Btn, Card, Chip, ConfirmDialog, Empty, Icon, Page, PriorityBadge, ProgressBar, SectionTitle, StatusBadge, deadlineColor } from '../../components/ui';
import { useLayout } from '../../hooks/useLayout';
import { useTasks } from '../../store/TaskContext';
import { T, useTheme } from '../../theme';
import { deadlineInfo, fmtDateTime } from '../../utils/date';

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const { isTablet } = useLayout();
  const { tasks, setProgress, markDone, deleteTask } = useTasks();
  const [confirm, setConfirm] = useState(false);
  const t = tasks.find((x) => x.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/tasks'));

  if (!t) {
    return <Page inset={false} maxWidth={760}><Empty icon="alert-circle" title="Tugas tidak ditemukan" text="Tugas ini mungkin sudah dihapus." action={<Btn label="Kembali ke daftar tugas" onPress={() => router.replace('/tasks')} />} /></Page>;
  }
  const done = t.status === 'Selesai';
  const info = deadlineInfo(t.deadline, done);
  const tone = deadlineColor(info.kind, c);
  const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.border, gap: 12 }}>
      <Text style={[T.body, { color: c.muted }]}>{k}</Text>{children}
    </View>
  );

  return (
    <Page inset={false} maxWidth={760}>
      <Card>
        <Text accessibilityRole="header" style={[T.title, { color: c.text }]}>{t.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Icon name="book-open" size={15} color={c.muted} /><Text style={[T.body, { color: c.muted }]}>{t.course}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 12 }}>
          <PriorityBadge p={t.priority} /><StatusBadge s={t.status} />
        </View>
        <Row k="Deadline"><Text style={[T.body, { color: t.deadline ? c.text : c.muted, fontWeight: '600', flexShrink: 1, textAlign: 'right' }]}>{t.deadline ? fmtDateTime(t.deadline) : 'Belum diatur'}</Text></Row>
        <Row k="Status deadline">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name={info.kind === 'overdue' ? 'alert-circle' : info.kind === 'done' ? 'check-circle' : 'clock'} size={16} color={tone} />
            <Text style={[T.body, { fontWeight: '600', color: tone }]}>{info.text}</Text>
          </View>
        </Row>
      </Card>

      <SectionTitle right={<Text style={{ fontSize: 20, fontWeight: '700', color: c.primaryText }}>{t.progress}%</Text>}>Progress</SectionTitle>
      <Card>
        <ProgressBar value={t.progress} height={10} color={done ? c.success : undefined} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {[0, 25, 50, 75, 100].map((n) => <Chip key={n} label={`${n}%`} selected={t.progress === n} onPress={() => setProgress(t.id, n)} />)}
        </View>
        <Text style={[T.small, { color: c.muted, marginTop: 10 }]}>Progress 100% otomatis mengubah status menjadi Selesai.</Text>
      </Card>

      <SectionTitle>Catatan</SectionTitle>
      <Card><Text style={[T.body, { color: t.notes ? c.text : c.muted }]}>{t.notes || 'Tidak ada catatan.'}</Text></Card>

      <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, marginTop: 28 }}>
        <View style={{ flex: isTablet ? 1 : undefined }}><Btn variant="secondary" icon="edit-2" label="Edit Tugas" onPress={() => router.push({ pathname: '/task/form', params: { id: t.id } })} /></View>
        <View style={{ flex: isTablet ? 1 : undefined }}>
          {done ? <Btn variant="secondary" icon="rotate-ccw" label="Buka Kembali" onPress={() => setProgress(t.id, 75)} />
            : <Btn icon="check-circle" label="Tandai Selesai" onPress={() => markDone(t.id)} />}
        </View>
        <View style={{ flex: isTablet ? 1 : undefined }}><Btn variant="danger" icon="trash-2" label="Hapus Tugas" onPress={() => setConfirm(true)} /></View>
      </View>

      <ConfirmDialog visible={confirm} title="Hapus tugas ini?" message={`Tugas "${t.title}" akan dihapus permanen dan tidak dapat dikembalikan.`}
        confirmLabel="Hapus" danger onCancel={() => setConfirm(false)} onConfirm={async () => { setConfirm(false); if (await deleteTask(t.id)) back(); }} />
    </Page>
  );
}
