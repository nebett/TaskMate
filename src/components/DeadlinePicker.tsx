import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Btn, Chip, ChipRow, ErrorText, Field, Icon, IconBtn, IconName, deadlineColor, useFocusRing, useInputStyle } from './ui';
import { R, T, useTheme } from '../theme';
import { DAYS, MONTHS, deadlineInfo, fmtDate, fmtTime, pad2, presetDate, sameDay, withTime } from '../utils/date';

const PRESETS = [{ label: 'Hari Ini', n: 0 }, { label: 'Besok', n: 1 }, { label: '3 Hari Lagi', n: 3 }, { label: '1 Minggu Lagi', n: 7 }];
const QUICK_TIMES: [string, number, number][] = [['08:00', 8, 0], ['12:00', 12, 0], ['17:00', 17, 0], ['23:59', 23, 59]];

/** Kalender bulanan: pilih tanggal, dan ketuk "bulan tahun" untuk memilih bulan serta tahun. */
function CalendarGrid({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const { c } = useTheme();
  const [view, setView] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [mode, setMode] = useState<'days' | 'months'>('days');
  const today = new Date();
  const offset = (view.getDay() + 6) % 7;
  const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];
  const moveMonth = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  const moveYear = (n: number) => setView(new Date(Math.min(2100, Math.max(1990, view.getFullYear() + n)), view.getMonth(), 1));
  const f = useFocusRing();
  const size = useWindowDimensions().height < 720 ? 36 : 42; // kalender lebih ringkas di layar pendek

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconBtn icon="chevron-left" label={mode === 'days' ? 'Bulan sebelumnya' : 'Tahun sebelumnya'} onPress={() => (mode === 'days' ? moveMonth(-1) : moveYear(-1))} />
        {mode === 'days' ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`${MONTHS[view.getMonth()]} ${view.getFullYear()}. Ketuk untuk memilih bulan dan tahun.`}
            onPress={() => setMode('months')} {...f.handlers}
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: R.md }, f.ring]}>
            <Text style={[T.h2, { color: c.text }]}>{MONTHS[view.getMonth()]} {view.getFullYear()}</Text>
            <Icon name="chevron-down" size={16} color={c.muted} />
          </Pressable>
        ) : <Text accessibilityRole="header" style={[T.h2, { color: c.text }]}>{view.getFullYear()}</Text>}
        <IconBtn icon="chevron-right" label={mode === 'days' ? 'Bulan berikutnya' : 'Tahun berikutnya'} onPress={() => (mode === 'days' ? moveMonth(1) : moveYear(1))} />
      </View>

      {mode === 'months' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {MONTHS.map((m, i) => {
            const on = i === view.getMonth();
            return (
              <View key={m} style={{ width: '33.333%', padding: 4 }}>
                <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => { setView(new Date(view.getFullYear(), i, 1)); setMode('days'); }}
                  style={(s: any) => ({ minHeight: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : s.hovered ? c.surfaceAlt : c.surface, borderWidth: 1, borderColor: on ? c.primary : c.border })}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: on ? c.onPrimary : c.text }}>{m}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {DAYS.map((d) => <Text key={d} style={[T.tiny, { width: '14.2857%', textAlign: 'center', color: c.muted, fontWeight: '600', marginBottom: 4 }]}>{d}</Text>)}
          {cells.map((d, i) => d ? (
            <DayCell key={i} size={size} d={d} selected={sameDay(d, selected)} today={sameDay(d, today)} onPress={() => onSelect(d)} />
          ) : <View key={`e${i}`} style={{ width: '14.2857%', height: size + 2 }} />)}
        </View>
      )}
    </View>
  );
}

function DayCell({ d, selected, today, size, onPress }: { d: Date; selected: boolean; today: boolean; size: number; onPress: () => void }) {
  const { c } = useTheme();
  const f = useFocusRing();
  return (
    <View style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 1 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`} accessibilityState={{ selected }}
        onPress={onPress} {...f.handlers}
        style={(s: any) => [{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? c.primary : s.hovered ? c.surfaceAlt : 'transparent',
          borderWidth: today && !selected ? 1.5 : 0, borderColor: c.primaryText }, f.ring]}>
        <Text style={{ fontSize: 15, fontWeight: selected || today ? '700' : '500', color: selected ? c.onPrimary : c.text }}>{d.getDate()}</Text>
      </Pressable>
    </View>
  );
}

function TimeBox({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const inp = useInputStyle();
  return (
    <TextInput accessibilityLabel={label} value={value} keyboardType="number-pad" inputMode="numeric" maxLength={2} selectTextOnFocus
      onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 2))} onBlur={() => { inp.onBlur(); if (value) onChange(pad2(parseInt(value, 10))); }} onFocus={inp.onFocus}
      placeholderTextColor={inp.placeholderTextColor} style={[inp.style, { width: 72, textAlign: 'center', fontSize: 20, fontWeight: '600', paddingHorizontal: 0 }]} />
  );
}

function DeadlineModal({ visible, value, onApply, onClear, onClose }: {
  visible: boolean; value: Date | null; onApply: (d: Date) => void; onClear: () => void; onClose: () => void;
}) {
  const { c } = useTheme();
  const [day, setDay] = useState(new Date());
  const [hh, setHh] = useState('23');
  const [mm, setMm] = useState('59');
  const [err, setErr] = useState('');
  const [session, setSession] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setDay(value ?? new Date()); setHh(pad2(value ? value.getHours() : 23)); setMm(pad2(value ? value.getMinutes() : 59)); setErr(''); setSession((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const apply = () => {
    const h = parseInt(hh, 10), m = parseInt(mm, 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) { setErr('Jam harus antara 00 dan 23, menit antara 00 dan 59. Perbaiki waktu lalu coba lagi.'); return; }
    onApply(withTime(day, h, m));
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 400, maxHeight: '96%', backgroundColor: c.surface, borderRadius: R.lg, borderWidth: 1, borderColor: c.border }}>
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={[T.h2, { color: c.text, marginBottom: 8 }]}>Pilih Tanggal Deadline</Text>
            <CalendarGrid key={session} selected={day} onSelect={(d) => { setDay(d); setErr(''); }} />

            <Text style={[T.small, { color: c.text, fontWeight: '600', marginTop: 16, marginBottom: 8 }]}>Waktu</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TimeBox label="Jam (00 sampai 23)" value={hh} onChange={(v) => { setHh(v); setErr(''); }} />
              <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>:</Text>
              <TimeBox label="Menit (00 sampai 59)" value={mm} onChange={(v) => { setMm(v); setErr(''); }} />
            </View>
            <View style={{ marginTop: 10 }}>
              <ChipRow>{QUICK_TIMES.map(([l, h, m]) => <Chip key={l} label={l} selected={parseInt(hh, 10) === h && parseInt(mm, 10) === m} onPress={() => { setHh(pad2(h)); setMm(pad2(m)); setErr(''); }} />)}</ChipRow>
            </View>
            {err ? <ErrorText>{err}</ErrorText> : null}
            <Text style={[T.small, { color: c.muted, marginTop: 14 }]}>Dipilih: {fmtDate(day)}, {pad2(parseInt(hh, 10) || 0)}:{pad2(parseInt(mm, 10) || 0)}</Text>
          </ScrollView>
          <View style={{ padding: 16, paddingTop: 4, gap: 10, borderTopWidth: 1, borderTopColor: c.border }}>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}><Btn variant="secondary" label="Batal" onPress={onClose} /></View>
              <View style={{ flex: 1 }}><Btn label="Terapkan" icon="check" onPress={apply} /></View>
            </View>
            {value ? <Btn small variant="danger" icon="trash-2" label="Kosongkan Deadline" onPress={onClear} /> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Box({ icon, text, label, onPress, flex }: { icon: IconName; text: string; label: string; onPress: () => void; flex: number }) {
  const { c } = useTheme();
  const f = useFocusRing();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${text}. Ketuk untuk mengubah.`} onPress={onPress} {...f.handlers}
      style={(s: any) => [{ flex, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: R.md, borderWidth: 1, borderColor: c.border,
        backgroundColor: s.hovered ? c.surfaceAlt : c.surface }, f.ring]}>
      <Icon name={icon} size={18} color={c.primaryText} />
      <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 15, fontWeight: '500', color: c.text }}>{text}</Text>
    </Pressable>
  );
}

/** Pilihan deadline: opsi cepat + tanggal kustom + jam + kosongkan. Nilai null = tanpa deadline. */
export function DeadlineField({ value, onChange }: { value: Date | null; onChange: (d: Date | null) => void }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const info = value ? deadlineInfo(value.toISOString(), false) : null;
  const matches = PRESETS.map((p) => !!value && sameDay(value, presetDate(p.n)));
  const custom = !!value && !matches.some(Boolean);

  return (
    <Field label="Deadline">
      <ChipRow>
        {PRESETS.map((p, i) => (
          <Chip key={p.label} label={p.label} selected={matches[i]}
            onPress={() => onChange(presetDate(p.n, value ? value.getHours() : 23, value ? value.getMinutes() : 59))} />
        ))}
        <Chip label="Pilih Tanggal" icon="calendar" selected={custom} onPress={() => setOpen(true)} />
      </ChipRow>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <Box flex={3} icon="calendar" label="Tanggal deadline" text={value ? fmtDate(value) : 'Belum diatur'} onPress={() => setOpen(true)} />
        <Box flex={2} icon="clock" label="Waktu deadline" text={value ? fmtTime(value) : '--:--'} onPress={() => setOpen(true)} />
        {value ? <IconBtn icon="x" label="Hapus deadline" onPress={() => onChange(null)} /> : null}
      </View>

      <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Icon name={info?.kind === 'overdue' ? 'alert-circle' : 'info'} size={14} color={info ? deadlineColor(info.kind, c) : c.muted} />
        <Text style={[T.small, { flex: 1, color: info ? deadlineColor(info.kind, c) : c.muted }]}>
          {info ? `Status deadline: ${info.text}${info.kind === 'overdue' ? '. Tanggal dan jam ini sudah lewat.' : ''}` : 'Tugas ini belum punya deadline. Pilih salah satu opsi di atas untuk menambahkannya.'}
        </Text>
      </View>

      <DeadlineModal visible={open} value={value} onClose={() => setOpen(false)}
        onApply={(d) => { onChange(d); setOpen(false); }} onClear={() => { onChange(null); setOpen(false); }} />
    </Field>
  );
}
