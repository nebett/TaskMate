import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_W, useLayout } from '../hooks/useLayout';
import { Palette, PRIORITY_LABEL, R, STATUS_SHORT, T, ThemeMode, useTheme } from '../theme';
import { DeadlineKind } from '../utils/date';
import { Priority, Status } from '../types';

export type IconName = keyof typeof Feather.glyphMap;

export function Icon({ name, size = 18, color }: { name: IconName; size?: number; color?: string }) {
  const { c } = useTheme();
  return <Feather name={name} size={size} color={color ?? c.text} />;
}

/** Indikator fokus keyboard (terlihat di web, juga untuk keyboard eksternal di Android). */
export function useFocusRing() {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const ring = focused
    ? ({ outlineWidth: 2, outlineColor: c.primaryText, outlineOffset: 2, outlineStyle: 'solid' } as ViewStyle)
    : null;
  return { ring, handlers: { onFocus: () => setFocused(true), onBlur: () => setFocused(false) } };
}

export function Card({ children, style, pad = 16 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; pad?: number }) {
  const { c } = useTheme();
  return <View style={[{ backgroundColor: c.surface, borderRadius: R.lg, borderWidth: 1, borderColor: c.border, padding: pad }, style]}>{children}</View>;
}

export function Page({ children, inset = true, maxWidth = MAX_W }: { children: React.ReactNode; inset?: boolean; maxWidth?: number }) {
  const { c } = useTheme();
  const { pad, isDesktop } = useLayout();
  const { top } = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: (inset && !isDesktop ? top : 0) + (isDesktop ? 32 : 16), paddingBottom: 104 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: pad }}>{children}</View>
    </ScrollView>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={[T.title, { color: c.text }]}>{title}</Text>
        {subtitle ? <Text style={[T.body, { color: c.muted, marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
      <Text accessibilityRole="header" style={[T.h2, { color: c.text }]}>{children}</Text>
      {right}
    </View>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export function Btn({ label, onPress, icon, variant = 'primary', loading, disabled, small }: {
  label: string; onPress: () => void; icon?: IconName; variant?: BtnVariant; loading?: boolean; disabled?: boolean; small?: boolean;
}) {
  const { c } = useTheme();
  const f = useFocusRing();
  const v = {
    primary: { bg: c.primary, fg: c.onPrimary, bd: c.primary },
    secondary: { bg: c.surface, fg: c.text, bd: c.border },
    danger: { bg: c.surface, fg: c.danger, bd: c.danger },
    ghost: { bg: 'transparent', fg: c.primaryText, bd: 'transparent' },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      {...f.handlers}
      style={(s: any) => [
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: small ? 40 : 48, paddingHorizontal: small ? 14 : 20,
          borderRadius: R.md, borderWidth: 1, backgroundColor: v.bg, borderColor: v.bd, opacity: disabled ? 0.5 : s.pressed ? 0.85 : 1 },
        s.hovered && variant !== 'primary' && { backgroundColor: c.surfaceAlt },
        s.hovered && variant === 'primary' && { opacity: 0.92 },
        f.ring,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={v.fg} /> : icon ? <Icon name={icon} size={18} color={v.fg} /> : null}
      <Text style={{ color: v.fg, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function IconBtn({ icon, label, onPress, active }: { icon: IconName; label: string; onPress: () => void; active?: boolean }) {
  const { c } = useTheme();
  const f = useFocusRing();
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!active }}
      onPress={onPress} {...f.handlers}
      style={(s: any) => [
        { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? c.primarySoft : 'transparent' },
        s.hovered && !active && { backgroundColor: c.surfaceAlt }, f.ring,
      ]}
    >
      <Icon name={icon} size={20} color={active ? c.primaryText : c.muted} />
    </Pressable>
  );
}

export function Fab({ onPress, label = 'Tambah tugas' }: { onPress: () => void; label?: string }) {
  const { c } = useTheme();
  const f = useFocusRing();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} {...f.handlers}
      style={(s: any) => [{ position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary,
        alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
        transform: [{ scale: s.pressed ? 0.95 : 1 }] }, f.ring]}>
      <Icon name="plus" size={26} color={c.onPrimary} />
    </Pressable>
  );
}

function Pill({ icon, text, fg, bg }: { icon: IconName; text: string; fg: string; bg: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: bg }}>
      <Feather name={icon} size={12} color={fg} />
      <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: fg }}>{text}</Text>
    </View>
  );
}

export function PriorityBadge({ p, short }: { p: Priority; short?: boolean }) {
  const { c } = useTheme();
  const col = c.priority[p];
  const icon: IconName = p === 'HIGH' ? 'arrow-up' : p === 'LOW' ? 'arrow-down' : 'minus';
  return <Pill icon={icon} text={short ? PRIORITY_LABEL[p] : `Prioritas ${PRIORITY_LABEL[p]}`} fg={col.fg} bg={col.bg} />;
}

export const statusIcon = (s: Status): IconName => (s === 'Selesai' ? 'check-circle' : s === 'Sedang Dikerjakan' ? 'clock' : 'circle');

export function StatusBadge({ s, short }: { s: Status; short?: boolean }) {
  const { c } = useTheme();
  const col = c.status[s];
  return <Pill icon={statusIcon(s)} text={short ? STATUS_SHORT[s] : s} fg={col.fg} bg={col.bg} />;
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Progress tugas" accessibilityValue={{ min: 0, max: 100, now: value }}
      style={{ height, borderRadius: height / 2, backgroundColor: c.surfaceAlt, overflow: 'hidden' }}>
      <View style={{ width: `${value}%` as `${number}%`, height, borderRadius: height / 2, backgroundColor: color ?? c.primary }} />
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName }) {
  const { c } = useTheme();
  const f = useFocusRing();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress} {...f.handlers}
      style={(s: any) => [{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1,
        backgroundColor: selected ? c.primary : c.surface, borderColor: selected ? c.primary : c.border },
        s.hovered && !selected && { backgroundColor: c.surfaceAlt }, f.ring]}>
      {icon ? <Icon name={icon} size={15} color={selected ? c.onPrimary : c.muted} /> : null}
      <Text style={{ fontSize: 13, fontWeight: '600', color: selected ? c.onPrimary : c.text }}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>{children}</ScrollView>;
}

export function Seg<TV extends string>({ options, value, onChange, label }: {
  options: { v: TV; label: string; icon?: IconName }[]; value: TV; onChange: (v: TV) => void; label: string;
}) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: R.md, padding: 4, gap: 4 }}>
      {options.map((o) => <SegItem key={o.v} on={o.v === value} label={o.label} icon={o.icon} onPress={() => onChange(o.v)} />)}
    </View>
  );
}
function SegItem({ on, label, icon, onPress }: { on: boolean; label: string; icon?: IconName; onPress: () => void }) {
  const { c } = useTheme();
  const f = useFocusRing();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress} {...f.handlers}
      style={[{ flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: R.sm, backgroundColor: on ? c.primary : 'transparent' }, f.ring]}>
      {icon ? <Icon name={icon} size={16} color={on ? c.onPrimary : c.muted} /> : null}
      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: on ? c.onPrimary : c.muted }}>{label}</Text>
    </Pressable>
  );
}

export function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  return (
    <Seg<ThemeMode> label="Tema tampilan" value={mode} onChange={setMode}
      options={[{ v: 'light', label: 'Terang', icon: 'sun' }, { v: 'dark', label: 'Gelap', icon: 'moon' }, { v: 'system', label: 'Sistem', icon: 'monitor' }]} />
  );
}

export function ErrorText({ children }: { children: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
      <Feather name="alert-circle" size={14} color={c.danger} style={{ marginTop: 2 }} />
      <Text style={[T.small, { color: c.danger, flex: 1 }]}>{children}</Text>
    </View>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={[T.small, { fontWeight: '600', color: c.text, marginBottom: 6 }]}>{label}</Text>
      {children}
      {error ? <ErrorText>{error}</ErrorText> : hint ? <Text style={[T.small, { color: c.muted, marginTop: 6 }]}>{hint}</Text> : null}
    </View>
  );
}

export function useInputStyle(error?: boolean, multiline?: boolean) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  const style = [{
    minHeight: multiline ? 104 : 48, backgroundColor: c.surface, color: c.text, borderRadius: R.md, borderWidth: 1,
    borderColor: error ? c.danger : focus ? c.primaryText : c.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  } as const, focus ? ({ outlineWidth: 2, outlineColor: c.primaryText, outlineStyle: 'solid' } as TextStyle) : null];
  return { style, onFocus: () => setFocus(true), onBlur: () => setFocus(false), placeholderTextColor: c.faint } as const;
}

export function TextField({ label, error, hint, multiline, ...rest }: { label: string; error?: string; hint?: string } & TextInputProps) {
  const inp = useInputStyle(!!error, multiline);
  return (
    <Field label={label} error={error} hint={hint}>
      <TextInput accessibilityLabel={label} multiline={multiline} {...inp} {...rest}
        style={[inp.style, multiline ? { textAlignVertical: 'top' } : null]} />
    </Field>
  );
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon name={icon} size={26} color={c.primaryText} />
      </View>
      <Text style={[T.h2, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[T.body, { color: c.muted, textAlign: 'center', marginTop: 4, maxWidth: 360 }]}>{text}</Text>
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel, danger, onConfirm, onCancel }: {
  visible: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const { c } = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 420, backgroundColor: c.surface, borderRadius: R.lg, borderWidth: 1, borderColor: c.border, padding: 20 }}>
          <Text accessibilityRole="header" style={[T.h2, { color: c.text }]}>{title}</Text>
          <Text style={[T.body, { color: c.muted, marginTop: 8 }]}>{message}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <View style={{ flex: 1 }}><Btn label="Batal" variant="secondary" onPress={onCancel} /></View>
            <View style={{ flex: 1 }}><Btn label={confirmLabel} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} /></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Warna teks deadline: terlambat = merah, hari ini = kuning, lainnya netral. Selalu disertai teks. */
export function deadlineColor(kind: DeadlineKind, c: Palette) {
  return kind === 'overdue' ? c.danger : kind === 'today' ? c.priority.MEDIUM.fg : c.muted;
}
