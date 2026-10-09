import { Priority, Status } from './types';

export const C = {
  primary: '#4F46E5',
  primarySoft: '#EEF0FF',
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#111827',
  sub: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  ok: '#10B981',
};

export const USER = { name: 'Rakha', semester: 5 };

export const COURSES = [
  'Technopreneurship',
  'Pemrosesan Gambar',
  'Organisasi & Arsitektur Komputer',
  'Interaksi Manusia dan Komputer',
  'Jaringan Komputer',
  'Basis Data',
];

export const PRIORITY: Record<Priority, { label: string; color: string; bg: string }> = {
  HIGH: { label: 'High', color: '#DC2626', bg: '#FEE2E2' },
  MEDIUM: { label: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  LOW: { label: 'Low', color: '#059669', bg: '#D1FAE5' },
};

export const STATUS: Record<Status, { color: string; bg: string }> = {
  'Belum Mulai': { color: '#6B7280', bg: '#F3F4F6' },
  'Sedang Dikerjakan': { color: '#2563EB', bg: '#DBEAFE' },
  Selesai: { color: '#059669', bg: '#D1FAE5' },
};

export const shadow = {
  shadowColor: '#1F2937',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
