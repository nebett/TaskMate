import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, PriorityBadge, ProgressBar, StatusBadge, deadlineColor, statusIcon, useFocusRing } from './ui';
import { R, T, useTheme } from '../theme';
import { Task } from '../types';
import { chunk } from '../utils/chunk';
import { deadlineInfo, fmtDM, fmtShort, fmtTime, fmtDateTime } from '../utils/date';

function useCard(task: Task) {
  const { c } = useTheme();
  const router = useRouter();
  const f = useFocusRing();
  const done = task.status === 'Selesai';
  const info = deadlineInfo(task.deadline, done);
  const tone = deadlineColor(info.kind, c);
  const hot = info.kind === 'overdue' || info.kind === 'today';
  const label = `${task.title}, ${task.course}, ${task.deadline ? `deadline ${fmtDateTime(task.deadline)}, ` : ''}${info.text}, status ${task.status}, progress ${task.progress} persen`;
  const props = { accessibilityRole: 'button' as const, accessibilityLabel: label, onPress: () => router.push(`/task/${task.id}`), ...f.handlers };
  return { c, f, info, tone, hot, done, props };
}

/** Grid View: kartu bertumpuk vertikal, beberapa kolom. */
export function TaskTile({ task }: { task: Task }) {
  const { c, f, info, tone, hot, done, props } = useCard(task);
  return (
    <Pressable {...props} style={(s: any) => [{ flex: 1, backgroundColor: s.hovered ? c.surfaceAlt : c.surface, borderRadius: R.lg, borderWidth: 1, borderColor: c.border, padding: 14, gap: 8 }, f.ring]}>
      <Text numberOfLines={2} style={[T.h2, { fontSize: 15, lineHeight: 20, color: done ? c.muted : c.text, textDecorationLine: done ? 'line-through' : 'none', minHeight: 40 }]}>{task.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="book-open" size={13} color={c.muted} />
        <Text numberOfLines={1} style={[T.small, { color: c.muted, flex: 1 }]}>{task.course}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="calendar" size={13} color={tone} />
        <Text numberOfLines={2} style={[T.small, { color: tone, fontWeight: hot ? '700' : '400', flex: 1 }]}>{task.deadline ? `${fmtDM(task.deadline)} · ` : ''}{info.text}</Text>
      </View>
      <View style={{ gap: 6, marginTop: 2 }}>
        <PriorityBadge p={task.priority} />
        <StatusBadge s={task.status} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
        <View style={{ flex: 1 }}><ProgressBar value={task.progress} color={done ? c.success : undefined} /></View>
        <Text style={[T.tiny, { color: c.muted, fontWeight: '600', minWidth: 32, textAlign: 'right' }]}>{task.progress}%</Text>
      </View>
    </Pressable>
  );
}

/** List View (mobile): satu baris ringkas per tugas. */
export function TaskRow({ task }: { task: Task }) {
  const { c, f, info, tone, hot, done, props } = useCard(task);
  return (
    <Pressable {...props} style={(s: any) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, paddingHorizontal: 14,
      backgroundColor: s.hovered ? c.surfaceAlt : c.surface, borderRadius: R.md, borderWidth: 1, borderColor: c.border }, f.ring]}>
      <Icon name={statusIcon(task.status)} size={22} color={c.status[task.status].fg} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[T.body, { fontWeight: '600', color: done ? c.muted : c.text, textDecorationLine: done ? 'line-through' : 'none' }]}>{task.title}</Text>
        <Text numberOfLines={1} style={[T.small, { color: hot ? tone : c.muted, fontWeight: hot ? '600' : '400' }]}>
          {task.course} · {info.text}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <PriorityBadge p={task.priority} short />
        <Text style={[T.tiny, { color: c.muted, fontWeight: '600' }]}>{task.progress}%</Text>
      </View>
    </Pressable>
  );
}

const COLS = { title: 2.4, course: 2, deadline: 1.5, priority: 1.1, status: 1.6, progress: 1.5 };

/** List View (desktop): baris tabel dengan kolom. */
export function TaskTableHeader() {
  const { c } = useTheme();
  const h = { fontSize: 12, fontWeight: '700' as const, color: c.muted, letterSpacing: 0.4 };
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.surfaceAlt, borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg }}>
      <Text style={[h, { flex: COLS.title }]}>TUGAS</Text><Text style={[h, { flex: COLS.course }]}>MATA KULIAH</Text>
      <Text style={[h, { flex: COLS.deadline }]}>DEADLINE</Text><Text style={[h, { flex: COLS.priority }]}>PRIORITAS</Text>
      <Text style={[h, { flex: COLS.status }]}>STATUS</Text><Text style={[h, { flex: COLS.progress }]}>PROGRESS</Text>
    </View>
  );
}

export function TaskTableRow({ task, last }: { task: Task; last?: boolean }) {
  const { c, f, info, tone, hot, done, props } = useCard(task);
  return (
    <Pressable {...props} style={(s: any) => [{ flexDirection: 'row', alignItems: 'center', minHeight: 60, paddingHorizontal: 16, paddingVertical: 10,
      backgroundColor: s.hovered ? c.surfaceAlt : 'transparent', borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }, f.ring]}>
      <Text numberOfLines={2} style={[T.body, { flex: COLS.title, fontWeight: '600', paddingRight: 12, color: done ? c.muted : c.text, textDecorationLine: done ? 'line-through' : 'none' }]}>{task.title}</Text>
      <Text numberOfLines={2} style={[T.small, { flex: COLS.course, color: c.muted, paddingRight: 12 }]}>{task.course}</Text>
      <View style={{ flex: COLS.deadline, paddingRight: 12 }}>
        <Text style={[T.small, { color: task.deadline ? c.text : c.muted }]}>{task.deadline ? `${fmtShort(task.deadline)}, ${fmtTime(task.deadline)}` : 'Tanpa deadline'}</Text>
        {task.deadline ? <Text style={[T.tiny, { color: tone, fontWeight: hot ? '700' : '400' }]}>{info.text}</Text> : null}
      </View>
      <View style={{ flex: COLS.priority, paddingRight: 12 }}><PriorityBadge p={task.priority} short /></View>
      <View style={{ flex: COLS.status, paddingRight: 12 }}><StatusBadge s={task.status} short /></View>
      <View style={{ flex: COLS.progress, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}><ProgressBar value={task.progress} color={done ? c.success : undefined} /></View>
        <Text style={[T.tiny, { color: c.muted, fontWeight: '600', width: 34, textAlign: 'right' }]}>{task.progress}%</Text>
      </View>
    </Pressable>
  );
}

export function TaskGrid({ tasks, cols }: { tasks: Task[]; cols: number }) {
  return (
    <View style={{ gap: 12 }}>
      {chunk(tasks, cols).map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          {row.map((t) => <View key={t.id} style={{ flex: 1 }}><TaskTile task={t} /></View>)}
          {Array.from({ length: cols - row.length }).map((_, k) => <View key={`e${k}`} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

export function TaskList({ tasks, table }: { tasks: Task[]; table: boolean }) {
  const { c } = useTheme();
  if (table) {
    return (
      <View style={{ backgroundColor: c.surface, borderRadius: R.lg, borderWidth: 1, borderColor: c.border }}>
        <TaskTableHeader />
        {tasks.map((t, i) => <TaskTableRow key={t.id} task={t} last={i === tasks.length - 1} />)}
      </View>
    );
  }
  return <View style={{ gap: 8 }}>{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</View>;
}
