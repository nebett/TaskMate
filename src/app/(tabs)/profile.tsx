import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Btn, Card, ConfirmDialog, Icon, IconName, Page, PageHeader, SectionTitle, ThemeSwitch } from '../../components/ui';
import { useLayout } from '../../hooks/useLayout';
import { useTasks } from '../../store/TaskContext';
import { R, T, USER, useTheme } from '../../theme';
import { daysLeft } from '../../utils/date';

const FREE = ['Pengelolaan daftar tugas', 'Kategori mata kuliah', 'Pengaturan deadline', 'Pengaturan prioritas', 'Pengingat dasar di dalam aplikasi', 'Pemantauan status tugas'];
const PREMIUM: { icon: IconName; label: string; desc: string }[] = [
  { icon: 'bar-chart-2', label: 'Statistik produktivitas', desc: 'Ringkasan kebiasaan dan penyelesaian tugas.' },
  { icon: 'calendar', label: 'Integrasi Google Calendar', desc: 'Satu arah: dari TaskMate ke Google Calendar.' },
  { icon: 'bell', label: 'Pengingat lanjutan', desc: 'Pengaturan waktu pengingat yang lebih fleksibel.' },
  { icon: 'droplet', label: 'Pilihan tema tambahan', desc: 'Variasi warna tampilan di luar Terang dan Gelap.' },
];

export default function Profile() {
  const { tasks, resetDemo } = useTasks();
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  const [confirm, setConfirm] = useState(false);
  const done = tasks.filter((t) => t.status === 'Selesai').length;
  const week = tasks.filter((t) => t.status !== 'Selesai' && !!t.deadline && daysLeft(t.deadline) >= 0 && daysLeft(t.deadline) <= 7).length;
  const stats = [{ v: done, l: 'Tugas Selesai' }, { v: tasks.length - done, l: 'Tugas Aktif' }, { v: week, l: 'Deadline Minggu Ini' }];

  const leftCol = (
    <View style={{ flex: isDesktop ? 1 : undefined }}>
      <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 30, fontWeight: '700', color: c.onPrimary }}>{USER.name[0]}</Text>
        </View>
        <Text style={[T.title, { color: c.text, marginTop: 12 }]}>{USER.name}</Text>
        <Text style={[T.body, { color: c.muted }]}>Mahasiswa · Semester {USER.semester}</Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        {stats.map((x) => (
          <Card key={x.l} style={{ flex: 1, alignItems: 'center' }} pad={12}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: c.primaryText }}>{x.v}</Text>
            <Text style={[T.tiny, { color: c.muted, textAlign: 'center' }]}>{x.l}</Text>
          </Card>
        ))}
      </View>
      <SectionTitle>Tampilan</SectionTitle>
      <Card><ThemeSwitch /></Card>
      <SectionTitle>Tentang TaskMate</SectionTitle>
      <Card style={{ backgroundColor: c.primarySoft, borderColor: c.primarySoft }}>
        <Text style={[T.h2, { color: c.primaryText }]}>One Place for All Your College Tasks</Text>
        <Text style={[T.small, { color: c.text, marginTop: 6 }]}>
          Aplikasi pengelolaan tugas akademik untuk mahasiswa D3, D4, dan S1. Kelola tugas dari berbagai mata kuliah dalam satu tempat, atur deadline dan prioritas, lalu pantau progresnya.
        </Text>
      </Card>
      <View style={{ marginTop: 20 }}><Btn variant="secondary" icon="rotate-ccw" label="Pulihkan data contoh" onPress={() => setConfirm(true)} /></View>
    </View>
  );

  const rightCol = (
    <View style={{ flex: isDesktop ? 1 : undefined }}>
      <SectionTitle>Fitur Tersedia</SectionTitle>
      <Card style={{ gap: 12 }}>
        {FREE.map((f) => (
          <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="check-circle" size={18} color={c.success} />
            <Text style={[T.body, { color: c.text, flex: 1 }]}>{f}</Text>
          </View>
        ))}
      </Card>
      <SectionTitle>Rencana Premium</SectionTitle>
      <Text style={[T.small, { color: c.muted, marginBottom: 12 }]}>Fitur berikut masih dalam rencana pengembangan dan belum dapat digunakan.</Text>
      <Card pad={0}>
        {PREMIUM.map((p, i) => (
          <View key={p.label} accessibilityState={{ disabled: true }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
            <View style={{ width: 38, height: 38, borderRadius: R.md, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={p.icon} size={18} color={c.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[T.body, { color: c.text, fontWeight: '600' }]}>{p.label}</Text>
              <Text style={[T.small, { color: c.muted }]}>{p.desc}</Text>
            </View>
            <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: c.surfaceAlt }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.muted }}>Segera hadir</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );

  return (
    <Page>
      <PageHeader title="Profil" />
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 28 : 0 }}>{leftCol}{rightCol}</View>
      <ConfirmDialog visible={confirm} title="Pulihkan data contoh?" message="Semua tugas saat ini akan diganti dengan empat tugas contoh awal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Pulihkan" danger onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); resetDemo(); }} />
    </Page>
  );
}
