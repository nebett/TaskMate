import React, { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Empty, Fab, H1, Screen } from '../../components/ui';
import TaskCard from '../../components/TaskCard';
import { useTasks } from '../../store/TaskContext';
import { Status } from '../../types';

const FILTERS: { label: string; v: Status | 'ALL' }[] = [
  { label: 'Semua', v: 'ALL' }, { label: 'Belum Mulai', v: 'Belum Mulai' },
  { label: 'Dikerjakan', v: 'Sedang Dikerjakan' }, { label: 'Selesai', v: 'Selesai' },
];
const SORTS = [
  { label: 'Deadline terdekat', v: 'deadline' }, { label: 'Prioritas', v: 'priority' }, { label: 'Terbaru', v: 'newest' },
] as const;
const RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default function Tasks() {
  const { tasks } = useTasks();
  const router = useRouter();
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');
  const [sort, setSort] = useState<'deadline' | 'priority' | 'newest'>('deadline');

  const data = tasks.filter((t) => filter === 'ALL' || t.status === filter).sort((a, b) =>
    sort === 'deadline' ? +new Date(a.deadline) - +new Date(b.deadline)
      : sort === 'priority' ? RANK[a.priority] - RANK[b.priority] || +new Date(a.deadline) - +new Date(b.deadline)
        : +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll={false}>
        <H1>Tugas Saya</H1>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 16 }}>
          {FILTERS.map((f) => <Chip key={f.v} label={f.label} active={filter === f.v} onPress={() => setFilter(f.v)} />)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 10, marginBottom: 14 }}>
          {SORTS.map((x) => <Chip key={x.v} label={`↕ ${x.label}`} active={sort === x.v} onPress={() => setSort(x.v)} />)}
        </ScrollView>
        <FlatList
          data={data}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TaskCard task={item} />}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Empty icon="clipboard-outline" title="Belum ada tugas"
            text={filter === 'ALL' ? 'Tekan tombol + untuk menambahkan tugas pertamamu.' : 'Tidak ada tugas dengan status ini.'} />}
        />
      </Screen>
      <Fab onPress={() => router.push('/task/form')} />
    </View>
  );
}
