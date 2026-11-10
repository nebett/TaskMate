import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Empty, Icon, Page, PageHeader, SectionTitle, useFocusRing } from '../../components/ui';
import { useLayout } from '../../hooks/useLayout';
import { useTasks } from '../../store/TaskContext';
import { R, T, useTheme } from '../../theme';
import { Task } from '../../types';
import { chunk } from '../../utils/chunk';
import { DeadlineInfo, cmpDeadline, deadlineInfo, fmtShort, fmtTime } from '../../utils/date';

const head = (i: DeadlineInfo) => (i.kind === 'overdue' ? 'Deadline terlewat' : i.kind === 'today' ? 'Deadline hari ini' : i.days === 1 ? 'Deadline besok' : `Deadline ${i.days} hari lagi`);
const msg = (t: Task, i: DeadlineInfo) => {
  const at = t.deadline ? `${fmtShort(t.deadline)} pukul ${fmtTime(t.deadline)}` : '';
  return i.kind === 'overdue' ? `${i.text}. Segera selesaikan tugas ini.` : i.kind === 'today' ? `Deadline hari ini pukul ${t.deadline ? fmtTime(t.deadline) : ''}.` : i.days === 1 ? `Deadline besok pukul ${t.deadline ? fmtTime(t.deadline) : ''}.` : `Deadline ${at}.`;
};

function Item({ t, info }: { t: Task; info: DeadlineInfo }) {
  const { c } = useTheme();
  const router = useRouter();
  const f = useFocusRing();
  const hot = info.kind === 'overdue' || info.kind === 'today' || info.days <= 1;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${head(info)}: ${t.title}, ${t.course}`} onPress={() => router.push(`/task/${t.id}`)} {...f.handlers}
      style={(s: any) => [{ flex: 1, flexDirection: 'row', gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: c.border, backgroundColor: s.hovered ? c.surfaceAlt : c.surface }, f.ring]}>
      <View style={{ width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: hot ? c.dangerSoft : c.primarySoft }}>
        <Icon name={hot ? 'alert-triangle' : 'bell'} size={19} color={hot ? c.danger : c.primaryText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[T.small, { fontWeight: '700', color: hot ? c.danger : c.primaryText }]}>{head(info)}</Text>
        <Text numberOfLines={1} style={[T.body, { fontWeight: '600', color: c.text }]}>{t.title}</Text>
        <Text numberOfLines={1} style={[T.small, { color: c.muted }]}>{t.course}</Text>
        <Text style={[T.small, { color: c.text, marginTop: 4 }]}>{msg(t, info)}</Text>
      </View>
    </Pressable>
  );
}

export default function Reminders() {
  const { tasks } = useTasks();
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  const active = tasks.filter((t) => t.status !== 'Selesai' && !!t.deadline).sort(cmpDeadline).map((t) => ({ t, info: deadlineInfo(t.deadline, false) }));
  const groups = [
    { title: 'Terlambat', items: active.filter((x) => x.info.kind === 'overdue') },
    { title: 'Hari Ini', items: active.filter((x) => x.info.kind === 'today') },
    { title: 'Besok', items: active.filter((x) => x.info.kind === 'upcoming' && x.info.days === 1) },
    { title: 'Minggu Ini', items: active.filter((x) => x.info.kind === 'upcoming' && x.info.days >= 2 && x.info.days <= 7) },
  ].filter((g) => g.items.length > 0);
  const cols = isDesktop ? 2 : 1;

  return (
    <Page>
      <PageHeader title="Reminder" subtitle="Tugas yang deadline-nya perlu kamu perhatikan." />
      {groups.length === 0 && <Card><Empty icon="bell" title="Tidak ada pengingat" text="Semua tugas aman. Tambahkan tugas dengan deadline untuk mendapat pengingat." /></Card>}
      {groups.map((g) => (
        <View key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <View style={{ gap: 12 }}>
            {chunk(g.items, cols).map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                {row.map(({ t, info }) => <Item key={t.id} t={t} info={info} />)}
                {Array.from({ length: cols - row.length }).map((_, k) => <View key={`e${k}`} style={{ flex: 1 }} />)}
              </View>
            ))}
          </View>
        </View>
      ))}
      <Text style={[T.small, { color: c.muted, marginTop: 28 }]}>Pengingat ditampilkan di dalam aplikasi. Notifikasi sistem hanya aktif pada build aplikasi di Android, bukan di Expo Go atau browser.</Text>
    </Page>
  );
}
