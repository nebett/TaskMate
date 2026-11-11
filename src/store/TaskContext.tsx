import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewTask, Priority, Task } from '../types';
import { addDays, daysBetween } from '../utils/date';
import { getNotifications } from '../utils/notify';
import { useToast } from '../components/Toast';

const KEY = 'taskmate.tasks.v1';

/** Jadwalkan local notification: H-1 jam 08:00. Jika sudah lewat & soon=true -> muncul 5 detik lagi (untuk demo). */
async function schedule(t: Task, soon: boolean): Promise<string | undefined> {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return;
    if (t.status === 'Selesai' || !t.deadline) return;
    const dl = new Date(t.deadline);
    const now = Date.now();
    if (dl.getTime() < now) return;
    const eve = new Date(dl); eve.setDate(eve.getDate() - 1); eve.setHours(8, 0, 0, 0);
    let when: Date;
    if (eve.getTime() > now + 5000) when = eve;
    else if (soon) when = new Date(now + 5000);
    else return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Reminder Tugas',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return;

    const n = daysBetween(when, dl);
    const txt = n <= 0 ? 'hari ini' : n === 1 ? 'besok' : `${n} hari lagi`;
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'TaskMate Reminder', body: `${t.title} ${t.course} deadline ${txt}.` },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'default' },
    });
  } catch {
    return undefined; // notifikasi gagal -> aplikasi tetap jalan (reminder in-app tetap ada)
  }
}
const cancel = (id?: string) => {
  const N = getNotifications();
  return id && N ? N.cancelScheduledNotificationAsync(id).catch(() => {}) : Promise.resolve();
};

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['Belum Mulai', 'Sedang Dikerjakan', 'Selesai'];
const isoOrNull = (v: unknown) => (typeof v === 'string' && !isNaN(+new Date(v)) ? v : null);

/** Bersihkan data dari penyimpanan: buang entri rusak, lengkapi field yang hilang. */
function sanitize(raw: unknown): { tasks: Task[]; dropped: number } | null {
  if (!Array.isArray(raw)) return null;
  const tasks: Task[] = [];
  const ids = new Set<string>();
  for (const x of raw as any[]) {
    if (!x || typeof x !== 'object' || typeof x.title !== 'string' || !x.title.trim()) continue;
    let id = typeof x.id === 'string' && x.id ? x.id : `r${Math.random().toString(36).slice(2, 10)}`;
    if (ids.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
    ids.add(id);
    const status = STATUSES.includes(x.status) ? x.status : 'Belum Mulai';
    const p = Number(x.progress);
    const progress = status === 'Selesai' ? 100 : Math.min(100, Math.max(0, isNaN(p) ? 0 : Math.round(p)));
    tasks.push({
      id, title: x.title, course: typeof x.course === 'string' ? x.course : '', deadline: isoOrNull(x.deadline),
      priority: PRIORITIES.includes(x.priority) ? x.priority : 'MEDIUM', status, progress,
      notes: typeof x.notes === 'string' ? x.notes : '', createdAt: isoOrNull(x.createdAt) ?? new Date().toISOString(),
      notifId: typeof x.notifId === 'string' ? x.notifId : undefined,
    });
  }
  return { tasks, dropped: raw.length - tasks.length };
}

const mk = (i: number, title: string, course: string, days: number, priority: Priority, progress: number): Task => ({
  id: `seed${i}`, title, course, deadline: addDays(days).toISOString(), priority,
  status: progress === 0 ? 'Belum Mulai' : 'Sedang Dikerjakan', progress, notes: '', createdAt: new Date().toISOString(),
});
const seed = (): Task[] => [
  mk(1, 'Laporan UTS', 'Pemrosesan Gambar', 1, 'HIGH', 50),
  mk(2, 'Assignment 1', 'Technopreneurship', 2, 'HIGH', 25),
  mk(3, 'Latihan Sistem Bilangan', 'Organisasi & Arsitektur Komputer', 4, 'MEDIUM', 0),
  mk(4, 'Analisis Interface', 'Interaksi Manusia dan Komputer', 6, 'LOW', 75),
];

interface Store {
  tasks: Task[];
  loading: boolean;
  addTask: (d: NewTask) => Promise<boolean>;
  updateTask: (id: string, p: Partial<NewTask>) => Promise<boolean>;
  setProgress: (id: string, p: number) => Promise<boolean>;
  markDone: (id: string) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  resetDemo: () => Promise<boolean>;
}
const Ctx = createContext<Store>(null as unknown as Store);
export const useTasks = () => useContext(Ctx);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<Task[]>([]);

  /** Simpan ke penyimpanan lokal; beri tahu pengguna jika gagal. */
  const commit = async (next: Task[]): Promise<boolean> => {
    ref.current = next;
    setTasks(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      return true;
    } catch {
      toast.show('Data tidak dapat disimpan di perangkat ini. Periksa ruang penyimpanan atau izin browser, lalu coba lagi.', 'error');
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      let raw: string | null = null;
      try {
        raw = await AsyncStorage.getItem(KEY);
        let data: Task[];
        if (raw == null) {
          data = seed();
          await AsyncStorage.setItem(KEY, JSON.stringify(data));
        } else {
          const clean = sanitize(JSON.parse(raw));
          if (!clean) throw new Error('format');
          data = clean.tasks;
          if (clean.dropped > 0) toast.show(`${clean.dropped} data tugas yang rusak dilewati.`, 'info');
        }
        ref.current = data;
        setTasks(data);
      } catch {
        // Data tidak terbaca: simpan salinan mentahnya agar tidak hilang, lalu tampilkan data contoh.
        if (raw) AsyncStorage.setItem(`${KEY}.backup`, raw).catch(() => {});
        const data = seed();
        ref.current = data;
        setTasks(data);
        toast.show('Data tersimpan tidak dapat dibaca. Menampilkan data contoh; salinan data lama disimpan sebagai cadangan.', 'error');
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resched = async (id: string, oldNotif: string | undefined, soon: boolean) => {
    await cancel(oldNotif);
    const t = ref.current.find((x) => x.id === id);
    if (!t) return;
    const notifId = await schedule(t, soon);
    if (notifId !== t.notifId) await commit(ref.current.map((x) => (x.id === id ? { ...x, notifId } : x)));
  };

  const addTask: Store['addTask'] = async (d) => {
    const progress = d.status === 'Selesai' ? 100 : d.status === 'Sedang Dikerjakan' ? 25 : 0;
    const t: Task = { ...d, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString(), progress };
    const ok = await commit([t, ...ref.current]);
    if (ok) { toast.show(`Tugas "${t.title}" berhasil ditambahkan.`); resched(t.id, undefined, true); }
    return ok;
  };

  const updateTask: Store['updateTask'] = async (id, patch) => {
    const old = ref.current.find((t) => t.id === id);
    if (!old) return false;
    const m: Task = { ...old, ...patch };
    if (patch.status) {
      m.progress = patch.status === 'Selesai' ? 100 : patch.status === 'Belum Mulai' ? 0 : old.progress >= 100 ? 50 : old.progress || 25;
    }
    const ok = await commit(ref.current.map((t) => (t.id === id ? m : t)));
    if (ok) { toast.show(`Perubahan pada "${m.title}" berhasil disimpan.`); resched(id, old.notifId, patch.deadline !== undefined && patch.deadline !== old.deadline); }
    return ok;
  };

  const setProgress: Store['setProgress'] = async (id, p) => {
    const old = ref.current.find((t) => t.id === id);
    if (!old) return false;
    const status = p >= 100 ? 'Selesai' : p <= 0 ? 'Belum Mulai' : 'Sedang Dikerjakan';
    const ok = await commit(ref.current.map((t) => (t.id === id ? { ...t, progress: p, status } : t)));
    if (ok) {
      toast.show(p >= 100 ? `Tugas "${old.title}" ditandai selesai.` : `Progress "${old.title}" diperbarui menjadi ${p}%.`);
      if ((old.status === 'Selesai') !== (status === 'Selesai')) resched(id, old.notifId, false);
    }
    return ok;
  };

  const store: Store = {
    tasks, loading, addTask, updateTask, setProgress,
    markDone: (id) => setProgress(id, 100),
    deleteTask: async (id) => {
      const old = ref.current.find((t) => t.id === id);
      cancel(old?.notifId);
      const ok = await commit(ref.current.filter((t) => t.id !== id));
      if (ok && old) toast.show(`Tugas "${old.title}" telah dihapus.`);
      return ok;
    },
    resetDemo: async () => {
      getNotifications()?.cancelAllScheduledNotificationsAsync().catch(() => {});
      const ok = await commit(seed());
      if (ok) toast.show('Data contoh berhasil dipulihkan.');
      return ok;
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
