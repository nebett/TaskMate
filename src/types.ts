export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'Belum Mulai' | 'Sedang Dikerjakan' | 'Selesai';

export interface Task {
  id: string;
  title: string;
  course: string;
  deadline: string | null; // ISO string, null = tanpa deadline
  priority: Priority;
  status: Status;
  progress: number; // 0..100
  notes: string;
  createdAt: string;
  notifId?: string;
}
export type NewTask = Pick<Task, 'title' | 'course' | 'deadline' | 'priority' | 'status' | 'notes'>;
