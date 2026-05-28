import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Deteksi Expo Go — sejak Expo SDK 53+, push notifications dihapus dari Expo Go.
// Kalau di Expo Go, semua call jadi no-op agar app tidak crash.
// Pakai development build untuk test full notification feature.
export const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazy-load expo-notifications hanya jika BUKAN di Expo Go.
// Kalau di Expo Go, modul tidak di-import sama sekali (cegah error native).
type NotifModule = typeof import('expo-notifications');
let NotifsCache: NotifModule | null = null;

function getNotifs(): NotifModule | null {
  if (IS_EXPO_GO) return null;
  if (NotifsCache) return NotifsCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    NotifsCache = require('expo-notifications') as NotifModule;
    // Set handler sekali — saat module pertama kali di-load di runtime non-Expo Go.
    NotifsCache.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return NotifsCache;
  } catch {
    return null;
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifs = getNotifs();
  if (!Notifs) return false;
  const { status } = await Notifs.getPermissionsAsync();
  if (status === 'granted') return true;
  const result = await Notifs.requestPermissionsAsync();
  return result.status === 'granted';
}

export async function scheduleIn(seconds: number, title: string, body: string) {
  const Notifs = getNotifs();
  if (!Notifs) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  if (Platform.OS === 'android') {
    await Notifs.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifs.AndroidImportance.DEFAULT,
    });
  }

  return Notifs.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifs.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string
) {
  const Notifs = getNotifs();
  if (!Notifs) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  return Notifs.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifs.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllNotifications() {
  const Notifs = getNotifs();
  if (!Notifs) return;
  await Notifs.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledCount(): Promise<number> {
  const Notifs = getNotifs();
  if (!Notifs) return 0;
  const list = await Notifs.getAllScheduledNotificationsAsync();
  return list.length;
}

export type ScheduledItem = {
  id: string;
  title: string;
  body: string;
  triggerSummary: string;
};

function summarizeTrigger(trigger: unknown): string {
  if (!trigger || typeof trigger !== 'object') return 'unknown';
  const t = trigger as {
    type?: string;
    seconds?: number;
    hour?: number;
    minute?: number;
  };
  if (t.type === 'timeInterval' && typeof t.seconds === 'number') {
    return `in ${t.seconds}s`;
  }
  if (t.type === 'daily' && typeof t.hour === 'number') {
    const hh = String(t.hour).padStart(2, '0');
    const mm = String(t.minute ?? 0).padStart(2, '0');
    return `setiap ${hh}:${mm}`;
  }
  return t.type ?? 'scheduled';
}

export async function listScheduled(): Promise<ScheduledItem[]> {
  const Notifs = getNotifs();
  if (!Notifs) return [];
  const list = await Notifs.getAllScheduledNotificationsAsync();
  return list.map((n) => ({
    id: n.identifier,
    title: n.content.title ?? '(no title)',
    body: n.content.body ?? '',
    triggerSummary: summarizeTrigger(n.trigger),
  }));
}

export async function cancelById(identifier: string) {
  const Notifs = getNotifs();
  if (!Notifs) return;
  await Notifs.cancelScheduledNotificationAsync(identifier);
}

export async function sendImmediate(title: string, body: string) {
  const Notifs = getNotifs();
  if (!Notifs) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  if (Platform.OS === 'android') {
    await Notifs.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifs.AndroidImportance.DEFAULT,
    });
  }

  return Notifs.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
