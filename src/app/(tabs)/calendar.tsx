import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Empty, IconBtn, Page, PageHeader, SectionTitle, useFocusRing } from '../../components/ui';
import { TaskList } from '../../components/TaskViews';
import { useLayout } from '../../hooks/useLayout';
import { useTasks } from '../../store/TaskContext';
import { T, useTheme } from '../../theme';
import { DAYS, MONTHS, sameDay } from '../../utils/date';

function Day({ d, selected, today, count, pending, onPress }: { d: Date; selected: boolean; today: boolean; count: number; pending: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const f = useFocusRing();
  const label = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}${count ? `, ${count} deadline` : ''}`;
  return (
    <View style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 2 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} {...f.handlers}
        style={(s: any) => [{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
          backgroundColor: selected ? c.primary : s.hovered ? c.surfaceAlt : 'transparent', borderWidth: today && !selected ? 1.5 : 0, borderColor: c.primaryText }, f.ring]}>
        <Text style={{ fontSize: 15, fontWeight: today || selected ? '700' : '500', color: selected ? c.onPrimary : c.text }}>{d.getDate()}</Text>
        <View style={{ position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 3, backgroundColor: count ? (selected ? c.onPrimary : pending ? c.danger : c.success) : 'transparent' }} />
      </Pressable>
    </View>
  );
}

export default function CalendarScreen() {
  const { tasks } = useTasks();
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(today);

  const offset = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const on = (d: Date) => tasks.filter((t) => !!t.deadline && sameDay(new Date(t.deadline), d));
  const list = on(sel);
  const move = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <Page>
      <PageHeader title="Kalender" subtitle="Titik pada tanggal menandakan ada deadline." />
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 28 : 0, alignItems: 'flex-start' }}>
        <Card style={{ flex: isDesktop ? 3 : undefined, width: isDesktop ? undefined : '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <IconBtn icon="chevron-left" label="Bulan sebelumnya" onPress={() => move(-1)} />
            <Text accessibilityRole="header" style={[T.h2, { color: c.text }]}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Text>
            <IconBtn icon="chevron-right" label="Bulan berikutnya" onPress={() => move(1)} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {DAYS.map((d) => <Text key={d} style={[T.tiny, { width: '14.2857%', textAlign: 'center', color: c.muted, fontWeight: '600', marginBottom: 6 }]}>{d}</Text>)}
            {cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={{ width: '14.2857%', height: 48 }} />;
              const ts = on(d);
              return <Day key={i} d={d} selected={sameDay(d, sel)} today={sameDay(d, today)} count={ts.length} pending={ts.some((t) => t.status !== 'Selesai')} onPress={() => setSel(d)} />;
            })}
          </View>
        </Card>
        <View style={{ flex: isDesktop ? 2 : undefined, width: isDesktop ? undefined : '100%' }}>
          <SectionTitle>{sel.getDate()} {MONTHS[sel.getMonth()]} {sel.getFullYear()}</SectionTitle>
          {list.length === 0
            ? <Card><Empty icon="calendar" title="Tidak ada deadline" text="Belum ada tugas dengan deadline pada tanggal ini." /></Card>
            : <TaskList tasks={list} table={false} />}
        </View>
      </View>
    </Page>
  );
}
