import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

type NotificationsModule = typeof import('expo-notifications');
let cached: NotificationsModule | null | undefined;

/**
 * Memuat expo-notifications hanya jika didukung.
 * - Expo Go (Android, SDK 53+): modul ditolak saat di-import -> dilewati.
 * - Web: tidak ada local notification -> dilewati.
 * - Development build / APK: aktif.
 * Jika null, aplikasi tetap jalan dengan reminder di dalam aplikasi.
 */
export function getNotifications(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (Platform.OS === 'web' || inExpoGo) return (cached = null);
  try {
    const mod = require('expo-notifications') as NotificationsModule;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    cached = mod;
  } catch {
    cached = null;
  }
  return cached;
}
