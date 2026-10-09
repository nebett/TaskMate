import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewTask, Priority, Task } from '../types';
import { addDays, daysBetween } from '../utils/date';
import { getNotifications } from '../utils/notify';

const KEY = 'taskmate.tasks.v1';

/** Jadwalkan local notification: H-1 jam 08:00. Jika sudah lewat & soon=true -> muncul 5 detik lagi (untuk demo). */
async function schedule(t: Task, soon: boolean): Promise<string | undefined> {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return;
    if (t.status === 'Selesai') return;
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
      content: { title: 'TaskMate Reminder 🔔', body: `${t.title} ${t.course} deadline ${txt}.` },
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
  addTask: (d: NewTask) => void;
  updateTask: (id: string, p: Partial<NewTask>) => void;
  setProgress: (id: string, p: number) => void;
  markDone: (id: string) => void;
  deleteTask: (id: string) => void;
  resetDemo: () => void;
}
const Ctx = createContext<Store>(null as unknown as Store);
export const useTasks = () => useContext(Ctx);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<Task[]>([]);
  const commit = (next: Task[]) => { ref.current = next; setTasks(next); };

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        commit(raw ? JSON.parse(raw) : seed());
      } catch { commit(seed()); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem(KEY, JSON.stringify(tasks)).catch(() => {});
  }, [tasks, loading]);

  const resched = async (id: string, oldNotif: string | undefined, soon: boolean) => {
    await cancel(oldNotif);
    const t = ref.current.find((x) => x.id === id);
    if (!t) return;
    const notifId = await schedule(t, soon);
    commit(ref.current.map((x) => (x.id === id ? { ...x, notifId } : x)));
  };

  const addTask: Store['addTask'] = (d) => {
    const progress = d.status === 'Selesai' ? 100 : d.status === 'Sedang Dikerjakan' ? 25 : 0;
    const t: Task = { ...d, id: Date.now().toString(), createdAt: new Date().toISOString(), progress };
    commit([t, ...ref.current]);
    resched(t.id, undefined, true);
  };

  const updateTask: Store['updateTask'] = (id, patch) => {
    const old = ref.current.find((t) => t.id === id);
    if (!old) return;
    const m: Task = { ...old, ...patch };
    if (patch.status) {
      m.progress = patch.status === 'Selesai' ? 100 : patch.status === 'Belum Mulai' ? 0
        : old.progress >= 100 ? 50 : old.progress || 25;
    }
    commit(ref.current.map((t) => (t.id === id ? m : t)));
    resched(id, old.notifId, !!patch.deadline && patch.deadline !== old.deadline);
  };

  const setProgress: Store['setProgress'] = (id, p) => {
    const old = ref.current.find((t) => t.id === id);
    if (!old) return;
    const status = p >= 100 ? 'Selesai' : p <= 0 ? 'Belum Mulai' : 'Sedang Dikerjakan';
    commit(ref.current.map((t) => (t.id === id ? { ...t, progress: p, status } : t)));
    if ((old.status === 'Selesai') !== (status === 'Selesai')) resched(id, old.notifId, false);
  };

  const store: Store = {
    tasks, loading, addTask, updateTask, setProgress,
    markDone: (id) => setProgress(id, 100),
    deleteTask: (id) => {
      const old = ref.current.find((t) => t.id === id);
      cancel(old?.notifId);
      commit(ref.current.filter((t) => t.id !== id));
    },
    resetDemo: () => {
      getNotifications()?.cancelAllScheduledNotificationsAsync().catch(() => {});
      commit(seed());
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
