import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Priority, Status } from './types';

export type ThemeMode = 'system' | 'light' | 'dark';

const light = {
  bg: '#F6F8FB', surface: '#FFFFFF', surfaceAlt: '#EEF2F7', border: '#DCE3EC',
  text: '#0F172A', muted: '#475569', faint: '#64748B',
  primary: '#2563EB', onPrimary: '#FFFFFF', primaryText: '#1D4ED8', primarySoft: '#E8EFFD',
  danger: '#B91C1C', dangerSoft: '#FEE2E2', success: '#15803D', successSoft: '#DCFCE7',
  overlay: 'rgba(15,23,42,0.45)', shadow: '#0F172A',
  priority: {
    HIGH: { fg: '#B91C1C', bg: '#FEE2E2' },
    MEDIUM: { fg: '#92400E', bg: '#FEF3C7' },
    LOW: { fg: '#166534', bg: '#DCFCE7' },
  },
  status: {
    'Belum Mulai': { fg: '#334155', bg: '#E2E8F0' },
    'Sedang Dikerjakan': { fg: '#1D4ED8', bg: '#DBEAFE' },
    Selesai: { fg: '#166534', bg: '#DCFCE7' },
  },
};
export type Palette = typeof light;

const dark: Palette = {
  bg: '#0B1220', surface: '#111A2E', surfaceAlt: '#17233B', border: '#26344F',
  text: '#E6EBF4', muted: '#A7B4CB', faint: '#8794AD',
  primary: '#2563EB', onPrimary: '#FFFFFF', primaryText: '#8BB4FF', primarySoft: '#172A52',
  danger: '#FCA5A5', dangerSoft: '#3B1618', success: '#86EFAC', successSoft: '#0F2E1A',
  overlay: 'rgba(0,0,0,0.6)', shadow: '#000000',
  priority: {
    HIGH: { fg: '#FCA5A5', bg: '#3B1618' },
    MEDIUM: { fg: '#FCD34D', bg: '#3A2A0B' },
    LOW: { fg: '#86EFAC', bg: '#0F2E1A' },
  },
  status: {
    'Belum Mulai': { fg: '#CBD5E1', bg: '#1E293B' },
    'Sedang Dikerjakan': { fg: '#93C5FD', bg: '#172554' },
    Selesai: { fg: '#86EFAC', bg: '#0F2E1A' },
  },
};

export const PRIORITY_LABEL: Record<Priority, string> = { HIGH: 'Tinggi', MEDIUM: 'Sedang', LOW: 'Rendah' };
export const STATUS_SHORT: Record<Status, string> = { 'Belum Mulai': 'Belum Mulai', 'Sedang Dikerjakan': 'Dikerjakan', Selesai: 'Selesai' };

export const T = { // type scale
  title: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h2: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  small: { fontSize: 13, lineHeight: 18 },
  tiny: { fontSize: 12, lineHeight: 16 },
};
export const R = { sm: 8, md: 12, lg: 16 }; // radius
export const USER = { name: 'Rakha', semester: 5 };
export const COURSES = ['Technopreneurship', 'Pemrosesan Gambar', 'Organisasi & Arsitektur Komputer', 'Interaksi Manusia dan Komputer', 'Jaringan Komputer', 'Basis Data'];

interface ThemeCtx { c: Palette; isDark: boolean; mode: ThemeMode; setMode: (m: ThemeMode) => void }
const Ctx = createContext<ThemeCtx>(null as unknown as ThemeCtx);
export const useTheme = () => useContext(Ctx);
const KEY = 'taskmate.theme.v1';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v === 'light' || v === 'dark' || v === 'system') setModeState(v); }).catch(() => {});
  }, []);
  const setMode = useCallback((m: ThemeMode) => { setModeState(m); AsyncStorage.setItem(KEY, m).catch(() => {}); }, []);
  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const value = useMemo(() => ({ c: isDark ? dark : light, isDark, mode, setMode }), [isDark, mode, setMode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const shadowFor = (c: Palette, isDark: boolean) => ({
  shadowColor: c.shadow, shadowOpacity: isDark ? 0.4 : 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: isDark ? 0 : 2,
});
