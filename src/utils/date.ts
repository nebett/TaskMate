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
