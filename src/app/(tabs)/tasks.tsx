import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Btn, Chip, ChipRow, Empty, Fab, IconBtn, Page, PageHeader, SectionTitle } from '../../components/ui';
import { TaskGrid, TaskList } from '../../components/TaskViews';
import { useLayout } from '../../hooks/useLayout';
import { usePersistedState } from '../../hooks/usePersistedState';
import { useTasks } from '../../store/TaskContext';
import { T, useTheme } from '../../theme';
import { Status } from '../../types';
import { cmpDeadline } from '../../utils/date';

type StatusFilter = Status | 'ALL';
type Sort = 'deadline' | 'priority' | 'newest';
const FILTERS: { label: string; v: StatusFilter }[] = [
  { label: 'Semua', v: 'ALL' }, { label: 'Belum Mulai', v: 'Belum Mulai' }, { label: 'Dikerjakan', v: 'Sedang Dikerjakan' }, { label: 'Selesai', v: 'Selesai' },
];
const SORTS: { label: string; v: Sort }[] = [{ label: 'Deadline terdekat', v: 'deadline' }, { label: 'Prioritas', v: 'priority' }, { label: 'Terbaru', v: 'newest' }];
const RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default function Tasks() {
  const { tasks } = useTasks();
  const router = useRouter();
  const { c } = useTheme();
  const { isDesktop, gridCols } = useLayout();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [course, setCourse] = useState<string>('ALL');
  const [sort, setSort] = useState<Sort>('deadline');
  const [view, setView] = usePersistedState<'grid' | 'list'>('taskmate.view', 'list');
  const [group, setGroup] = usePersistedState<boolean>('taskmate.group', false);

  const courses = useMemo(() => [...new Set(tasks.map((t) => t.course))].sort(), [tasks]);
  const data = useMemo(() => tasks
    .filter((t) => (filter === 'ALL' || t.status === filter) && (course === 'ALL' || t.course === course))
    .sort((a, b) => sort === 'deadline' ? cmpDeadline(a, b)
      : sort === 'priority' ? RANK[a.priority] - RANK[b.priority] || cmpDeadline(a, b)
        : +new Date(b.createdAt) - +new Date(a.createdAt)), [tasks, filter, course, sort]);

  const groups = group
    ? [...new Set(data.map((t) => t.course))].sort().map((name) => ({ name, items: data.filter((t) => t.course === name) }))
    : [{ name: '', items: data }];

  const render = (items: typeof data) => view === 'grid' ? <TaskGrid tasks={items} cols={gridCols} /> : <TaskList tasks={items} table={isDesktop} />;
  const toggles = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <IconBtn icon="grid" label="Tampilan grid" active={view === 'grid'} onPress={() => setView('grid')} />
      <IconBtn icon="list" label="Tampilan daftar" active={view === 'list'} onPress={() => setView('list')} />
      {isDesktop && <View style={{ marginLeft: 8 }}><Btn label="Tambah Tugas" icon="plus" onPress={() => router.push('/task/form')} /></View>}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Page>
        <PageHeader title="Tugas Saya" subtitle={`${data.length} dari ${tasks.length} tugas ditampilkan`} action={toggles} />
        <View style={{ gap: 10 }}>
          <ChipRow>
            {FILTERS.map((f) => <Chip key={f.v} label={f.label} selected={filter === f.v} onPress={() => setFilter(f.v)} />)}
          </ChipRow>
          <ChipRow>
            <Chip icon="layers" label="Kelompokkan per mata kuliah" selected={group} onPress={() => setGroup(!group)} />
            <Chip label="Semua mata kuliah" selected={course === 'ALL'} onPress={() => setCourse('ALL')} />
            {courses.map((name) => <Chip key={name} label={name} selected={course === name} onPress={() => setCourse(name)} />)}
          </ChipRow>
          <ChipRow>
            {SORTS.map((s) => <Chip key={s.v} icon="arrow-down" label={s.label} selected={sort === s.v} onPress={() => setSort(s.v)} />)}
          </ChipRow>
        </View>
        <View style={{ marginTop: 16 }}>
          {data.length === 0 ? (
            <Empty icon="inbox" title={tasks.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas yang cocok'}
              text={tasks.length === 0 ? 'Tambahkan tugas pertamamu untuk mulai mengatur deadline.' : 'Ubah filter status atau mata kuliah untuk melihat tugas lain.'}
              action={tasks.length === 0 ? <Btn label="Tambah Tugas" icon="plus" onPress={() => router.push('/task/form')} /> : <Btn variant="secondary" label="Reset filter" onPress={() => { setFilter('ALL'); setCourse('ALL'); }} />} />
          ) : groups.map((g) => (
            <View key={g.name || 'all'}>
              {g.name ? <SectionTitle right={<Text style={[T.small, { color: c.muted }]}>{g.items.length} tugas</Text>}>{g.name}</SectionTitle> : null}
              {render(g.items)}
            </View>
          ))}
        </View>
      </Page>
      {!isDesktop && <Fab onPress={() => router.push('/task/form')} />}
    </View>
  );
}
