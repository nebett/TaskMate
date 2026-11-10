export const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
export const DAYS = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

export const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
export const daysLeft = (iso: string) => daysBetween(new Date(), new Date(iso));
export const fmtDate = (iso: string | Date) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const countdown = (n: number) =>
  n < 0 ? `Terlambat ${-n} hari` : n === 0 ? 'Hari ini' : n === 1 ? 'Besok' : `${n} hari lagi`;
export const addDays = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n); d.setHours(23, 59, 0, 0); return d;
};
export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
export const fmtShort = (iso: string | Date) => {
  const d = new Date(iso);
  return `${d.getDate()} ${SHORT[d.getMonth()]} ${d.getFullYear()}`;
};
export const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fmtDM = (iso: string | Date) => {
  const d = new Date(iso);
  return `${d.getDate()} ${SHORT[d.getMonth()]}`;
};

/* ---------- Deadline helpers ----------
 * Deadline disimpan sebagai string ISO (satu titik waktu absolut), dibuat dari komponen
 * tanggal LOKAL pengguna (bukan dari "YYYY-MM-DD" yang dibaca sebagai UTC). Semua tampilan
 * dan perbandingan hari memakai komponen lokal, jadi tidak terjadi geser satu hari.
 */
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const fmtTime = (d: string | Date) => { const x = new Date(d); return `${pad2(x.getHours())}:${pad2(x.getMinutes())}`; };
export const fmtDateTime = (d: string | Date) => `${fmtDate(d)}, ${fmtTime(d)}`;
export const withTime = (day: Date, h: number, m: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
/** Hari ini + n hari pada jam h:m (default 23:59). */
export const presetDate = (n: number, h = 23, m = 59) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n, h, m, 0, 0); };

export type DeadlineKind = 'none' | 'done' | 'overdue' | 'today' | 'upcoming';
export interface DeadlineInfo { kind: DeadlineKind; days: number; text: string }

export function deadlineInfo(iso: string | null, done: boolean, now: Date = new Date()): DeadlineInfo {
  if (!iso) return { kind: 'none', days: Number.POSITIVE_INFINITY, text: 'Tanpa deadline' };
  const d = new Date(iso);
  const days = daysBetween(now, d);
  if (done) return { kind: 'done', days, text: 'Selesai' };
  const diff = now.getTime() - d.getTime();
  if (diff > 0) {
    const mins = Math.floor(diff / 60000);
    const text = diff >= 86400000 ? `Terlambat ${Math.floor(diff / 86400000)} hari`
      : mins >= 60 ? `Terlambat ${Math.floor(mins / 60)} jam` : `Terlambat ${Math.max(1, mins)} menit`;
    return { kind: 'overdue', days, text };
  }
  if (days === 0) return { kind: 'today', days, text: `Hari ini, ${fmtTime(d)}` };
  if (days === 1) return { kind: 'upcoming', days, text: `Besok, ${fmtTime(d)}` };
  return { kind: 'upcoming', days, text: `${days} hari lagi` };
}

/** Urutan deadline terdekat; tugas tanpa deadline selalu di akhir. */
export function cmpDeadline(a: { deadline: string | null }, b: { deadline: string | null }) {
  const x = a.deadline ? +new Date(a.deadline) : Infinity;
  const y = b.deadline ? +new Date(b.deadline) : Infinity;
  return x === y ? 0 : x < y ? -1 : 1;
}
