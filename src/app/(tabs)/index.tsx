import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Btn, Card, Empty, Fab, Icon, IconName, Page, PageHeader, ProgressBar, SectionTitle } from '../../components/ui';
import { TaskList } from '../../components/TaskViews';
import { useLayout } from '../../hooks/useLayout';
import { useTasks } from '../../store/TaskContext';
import { R, T, USER, useTheme } from '../../theme';
import { cmpDeadline, daysLeft } from '../../utils/date';

function Stat({ icon, label, value, tint, bg }: { icon: IconName; label: string; value: number; tint: string; bg: string }) {
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  return (
    <Card style={{ flexGrow: 1, flexBasis: isDesktop ? '22%' : '46%' }} pad={14}>
      <View style={{ width: 36, height: 36, borderRadius: R.sm, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <Text style={{ fontSize: 28, fontWeight: '700', color: c.text, marginTop: 10 }}>{value}</Text>
      <Text style={[T.small, { color: c.muted }]}>{label}</Text>
    </Card>
  );
}

export default function Home() {
  const { tasks } = useTasks();
  const router = useRouter();
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  const n = (s: string) => tasks.filter((t) => t.status === s).length;

  const upcoming = tasks.filter((t) => t.status !== 'Selesai' && !!t.deadline).sort(cmpDeadline).slice(0, 4);
  const week = tasks.filter((t) => { if (!t.deadline) return false; const d = daysLeft(t.deadline); return d >= -7 && d <= 7; });
  const pct = week.length ? Math.round(week.reduce((a, t) => a + t.progress, 0) / week.length) : 0;
  const doneWeek = week.filter((t) => t.status === 'Selesai').length;

  const courses = Object.entries(tasks.reduce<Record<string, { done: number; total: number }>>((m, t) => {
    const x = (m[t.course] ??= { done: 0, total: 0 }); x.total++; if (t.status === 'Selesai') x.done++; return m;
  }, {})).sort((a, b) => b[1].total - a[1].total);

  const left = (
    <View style={{ flex: isDesktop ? 3 : undefined }}>
      <SectionTitle right={<Btn small variant="ghost" label="Lihat semua" onPress={() => router.navigate('/tasks')} />}>Deadline Terdekat</SectionTitle>
      {upcoming.length === 0
        ? <Card><Empty icon="check-circle" title="Tidak ada tugas aktif" text="Semua tugas sudah selesai, atau belum ada tugas yang ditambahkan." action={<Btn label="Tambah Tugas" icon="plus" onPress={() => router.push('/task/form')} />} /></Card>
        : <TaskList tasks={upcoming} table={false} />}
    </View>
  );
  const right = (
    <View style={{ flex: isDesktop ? 2 : undefined }}>
      <SectionTitle>Progress Minggu Ini</SectionTitle>
      <Card>
        <Text style={{ fontSize: 40, fontWeight: '700', color: c.text }}>{pct}%</Text>
        <Text style={[T.small, { color: c.muted, marginBottom: 12 }]}>{doneWeek} dari {week.length} tugas minggu ini selesai</Text>
        <ProgressBar value={pct} height={10} />
      </Card>
      <SectionTitle>Per Mata Kuliah</SectionTitle>
      <Card style={{ gap: 14 }}>
        {courses.length === 0 ? <Text style={[T.small, { color: c.muted }]}>Belum ada mata kuliah.</Text> : courses.slice(0, 5).map(([name, v]) => (
          <View key={name}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <Text numberOfLines={1} style={[T.small, { color: c.text, fontWeight: '600', flex: 1 }]}>{name}</Text>
              <Text style={[T.small, { color: c.muted }]}>{v.done}/{v.total} selesai</Text>
            </View>
            <ProgressBar value={Math.round((v.done / v.total) * 100)} height={6} />
          </View>
        ))}
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Page>
        {!isDesktop && <Text style={[T.tiny, { color: c.primaryText, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4 }]}>ONE PLACE FOR ALL YOUR COLLEGE TASKS</Text>}
        <PageHeader title={`Halo, ${USER.name}`} subtitle="Ringkasan tugas kuliahmu hari ini."
          action={isDesktop ? <Btn label="Tambah Tugas" icon="plus" onPress={() => router.push('/task/form')} /> : undefined} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Stat icon="layers" label="Total Tugas" value={tasks.length} tint={c.primaryText} bg={c.primarySoft} />
          <Stat icon="circle" label="Belum Selesai" value={tasks.length - n('Selesai')} tint={c.priority.MEDIUM.fg} bg={c.priority.MEDIUM.bg} />
          <Stat icon="clock" label="Sedang Dikerjakan" value={n('Sedang Dikerjakan')} tint={c.status['Sedang Dikerjakan'].fg} bg={c.status['Sedang Dikerjakan'].bg} />
          <Stat icon="check-circle" label="Selesai" value={n('Selesai')} tint={c.success} bg={c.successSoft} />
        </View>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 28 : 0 }}>{left}{right}</View>
      </Page>
      {!isDesktop && <Fab onPress={() => router.push('/task/form')} />}
    </View>
  );
}
