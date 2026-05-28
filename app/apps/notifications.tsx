import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useToast } from '@/context/toast-context';
import { haptic } from '@/lib/haptic';
import {
  IS_EXPO_GO,
  type ScheduledItem,
  cancelAllNotifications,
  cancelById,
  ensureNotificationPermission,
  listScheduled,
  scheduleDailyReminder,
  scheduleIn,
  sendImmediate,
} from '@/lib/notifications';

// ============================================================================
// HELPERS
// ============================================================================

type SectionProps = {
  emoji: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({ emoji, title, description, children }: SectionProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
          <Text className="text-lg">{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {title}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

type ChipProps = {
  label: string;
  onPress: () => void;
  active?: boolean;
};

function Chip({ label, onPress, active }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-lg border ${
        active
          ? 'bg-primary border-primary'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
      }`}>
      <Text
        className={`text-xs font-medium ${
          active ? 'text-white' : 'text-gray-700 dark:text-gray-300'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function NotificationsScreen() {
  const toast = useToast();

  // Permission state
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>(
    'unknown'
  );

  // Custom notification form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [delaySec, setDelaySec] = useState(5);

  // Daily reminder form
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [reminderTitle, setReminderTitle] = useState('Belajar React Native');
  const [reminderBody, setReminderBody] = useState('Yuk lanjutin project!');

  // Scheduled list
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([]);

  const refresh = useCallback(async () => {
    if (IS_EXPO_GO) return;
    const list = await listScheduled();
    setScheduled(list);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  const requestPermission = async () => {
    haptic.medium();
    const granted = await ensureNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      toast.success('Permission diberikan');
    } else {
      toast.error('Permission ditolak. Cek Settings.');
    }
  };

  const quickSend = async (seconds: number) => {
    haptic.light();
    if (IS_EXPO_GO) {
      toast.warning('Push notif tidak jalan di Expo Go. Pakai dev build.');
      return;
    }
    if (seconds === 0) {
      const id = await sendImmediate(
        '🚀 Notif Cepat',
        'Notif ini muncul langsung tanpa delay.'
      );
      if (id) toast.success('Notif sent!');
    } else {
      const id = await scheduleIn(
        seconds,
        '⏰ Reminder',
        `Notif terjadwal ${seconds} detik lalu.`
      );
      if (id) toast.success(`Scheduled — muncul dalam ${seconds}s`);
    }
    await refresh();
  };

  const sendCustom = async () => {
    haptic.medium();
    if (!title.trim()) {
      toast.warning('Title wajib diisi');
      return;
    }
    if (IS_EXPO_GO) {
      toast.warning('Push notif tidak jalan di Expo Go. Pakai dev build.');
      return;
    }
    const id =
      delaySec === 0
        ? await sendImmediate(title.trim(), body.trim() || ' ')
        : await scheduleIn(delaySec, title.trim(), body.trim() || ' ');
    if (id) {
      toast.success(
        delaySec === 0 ? 'Notif sent!' : `Scheduled — muncul dalam ${delaySec}s`
      );
      setTitle('');
      setBody('');
      await refresh();
    } else {
      toast.error('Gagal kirim — cek permission');
    }
  };

  const saveDailyReminder = async () => {
    haptic.medium();
    if (IS_EXPO_GO) {
      toast.warning('Push notif tidak jalan di Expo Go. Pakai dev build.');
      return;
    }
    const id = await scheduleDailyReminder(
      reminderHour,
      reminderMinute,
      reminderTitle.trim() || 'Daily Reminder',
      reminderBody.trim() || ' '
    );
    if (id) {
      const hh = String(reminderHour).padStart(2, '0');
      const mm = String(reminderMinute).padStart(2, '0');
      toast.success(`Reminder set tiap ${hh}:${mm}`);
      await refresh();
    } else {
      toast.error('Gagal — cek permission');
    }
  };

  const cancelOne = async (id: string) => {
    haptic.light();
    await cancelById(id);
    toast.info('Notif dibatalkan');
    await refresh();
  };

  const cancelAll = async () => {
    haptic.warning();
    await cancelAllNotifications();
    setScheduled([]);
    toast.info('Semua notif terjadwal dibatalkan');
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-950"
        keyboardShouldPersistTaps="handled">
        <View className="p-4 gap-4">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Push Notifications
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              Kirim notifikasi ke handphone — langsung, terjadwal, atau daily reminder.
            </Text>
          </View>

          {/* Expo Go warning */}
          {IS_EXPO_GO ? (
            <View className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/40">
              <Text className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
                ⚠️ Kamu di Expo Go
              </Text>
              <Text className="text-xs text-amber-800 dark:text-amber-300 leading-5">
                Sejak Expo SDK 53+, push notifications tidak jalan di Expo Go. Untuk test
                full feature: pakai <Text className="font-semibold">EAS Build</Text> atau{' '}
                <Text className="font-semibold">expo run:ios / run:android</Text> untuk
                dev build. Tombol di halaman ini akan tetap berfungsi tapi notif tidak
                muncul.
              </Text>
            </View>
          ) : null}

          {/* Permission */}
          <Section
            emoji="🔐"
            title="Permission"
            description="Minta izin ke OS sebelum kirim notifikasi.">
            <View className="flex-row items-center gap-3">
              <View
                className={`px-3 py-1.5 rounded-full ${
                  permission === 'granted'
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : permission === 'denied'
                      ? 'bg-red-100 dark:bg-red-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    permission === 'granted'
                      ? 'text-green-700 dark:text-green-300'
                      : permission === 'denied'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-gray-600 dark:text-gray-300'
                  }`}>
                  {permission === 'granted'
                    ? '✓ Granted'
                    : permission === 'denied'
                      ? '✕ Denied'
                      : '? Unknown'}
                </Text>
              </View>
              <Pressable
                onPress={requestPermission}
                className="bg-primary px-4 py-2 rounded-lg active:opacity-70">
                <Text className="text-white text-xs font-bold">Request Permission</Text>
              </Pressable>
            </View>
          </Section>

          {/* Quick send */}
          <Section
            emoji="⚡"
            title="Kirim Cepat"
            description="Test cepat dengan delay preset. Tutup app untuk lihat notif muncul.">
            <View className="flex-row flex-wrap gap-2">
              <Chip label="Sekarang" onPress={() => quickSend(0)} />
              <Chip label="5 detik" onPress={() => quickSend(5)} />
              <Chip label="15 detik" onPress={() => quickSend(15)} />
              <Chip label="30 detik" onPress={() => quickSend(30)} />
              <Chip label="1 menit" onPress={() => quickSend(60)} />
              <Chip label="5 menit" onPress={() => quickSend(300)} />
            </View>
          </Section>

          {/* Custom notification */}
          <Section
            emoji="✏️"
            title="Notif Custom"
            description="Tulis title + body sendiri, pilih delay.">
            <View className="gap-3">
              <View>
                <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Title
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Judul notifikasi..."
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white"
                />
              </View>

              <View>
                <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Body
                </Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Isi pesan..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white"
                />
              </View>

              <View>
                <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Delay
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[0, 5, 15, 30, 60, 300].map((sec) => (
                    <Chip
                      key={sec}
                      label={
                        sec === 0 ? 'Sekarang' : sec < 60 ? `${sec}s` : `${sec / 60}m`
                      }
                      onPress={() => setDelaySec(sec)}
                      active={delaySec === sec}
                    />
                  ))}
                </View>
              </View>

              <Pressable
                onPress={sendCustom}
                className="bg-primary rounded-lg py-3 items-center active:opacity-70">
                <Text className="text-white font-bold">📤 Kirim Notif</Text>
              </Pressable>
            </View>
          </Section>

          {/* Daily reminder */}
          <Section
            emoji="🔔"
            title="Daily Reminder"
            description="Notif berulang setiap hari di jam yang sama.">
            <View className="gap-3">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Jam
                  </Text>
                  <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Pressable
                      onPress={() => setReminderHour((h) => Math.max(0, h - 1))}
                      className="px-3 py-2.5">
                      <Text className="text-base text-gray-600 dark:text-gray-300">
                        −
                      </Text>
                    </Pressable>
                    <Text className="flex-1 text-center font-bold text-gray-900 dark:text-white">
                      {String(reminderHour).padStart(2, '0')}
                    </Text>
                    <Pressable
                      onPress={() => setReminderHour((h) => Math.min(23, h + 1))}
                      className="px-3 py-2.5">
                      <Text className="text-base text-gray-600 dark:text-gray-300">
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Menit
                  </Text>
                  <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Pressable
                      onPress={() => setReminderMinute((m) => Math.max(0, m - 5))}
                      className="px-3 py-2.5">
                      <Text className="text-base text-gray-600 dark:text-gray-300">
                        −
                      </Text>
                    </Pressable>
                    <Text className="flex-1 text-center font-bold text-gray-900 dark:text-white">
                      {String(reminderMinute).padStart(2, '0')}
                    </Text>
                    <Pressable
                      onPress={() => setReminderMinute((m) => Math.min(55, m + 5))}
                      className="px-3 py-2.5">
                      <Text className="text-base text-gray-600 dark:text-gray-300">
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <TextInput
                value={reminderTitle}
                onChangeText={setReminderTitle}
                placeholder="Title reminder"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white"
              />
              <TextInput
                value={reminderBody}
                onChangeText={setReminderBody}
                placeholder="Body reminder"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white"
              />

              <Pressable
                onPress={saveDailyReminder}
                className="bg-primary rounded-lg py-3 items-center active:opacity-70">
                <Text className="text-white font-bold">🔔 Set Daily Reminder</Text>
              </Pressable>
            </View>
          </Section>

          {/* Scheduled list */}
          <Section
            emoji="📋"
            title={`Notif Terjadwal (${scheduled.length})`}
            description="Semua notif yang akan muncul. Tap × untuk batal.">
            <View className="gap-2">
              {scheduled.length === 0 ? (
                <View className="items-center py-6">
                  <Text className="text-3xl mb-2">📭</Text>
                  <Text className="text-sm text-gray-400">Belum ada notif terjadwal</Text>
                </View>
              ) : (
                scheduled.map((n) => (
                  <Animated.View
                    key={n.id}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    layout={LinearTransition.duration(200)}
                    className="flex-row items-start gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-900 dark:text-white">
                        {n.title}
                      </Text>
                      {n.body ? (
                        <Text
                          className="text-xs text-gray-600 dark:text-gray-400 mt-0.5"
                          numberOfLines={2}>
                          {n.body}
                        </Text>
                      ) : null}
                      <Text className="text-[10px] text-primary font-medium mt-1">
                        {n.triggerSummary}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => cancelOne(n.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 items-center justify-center">
                      <Text className="text-red-600 dark:text-red-400 text-base">×</Text>
                    </Pressable>
                  </Animated.View>
                ))
              )}

              <View className="flex-row gap-2 mt-1">
                <Pressable
                  onPress={refresh}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg py-2.5 items-center active:opacity-70">
                  <Text className="text-gray-700 dark:text-gray-200 text-xs font-bold">
                    🔄 Refresh
                  </Text>
                </Pressable>
                {scheduled.length > 0 ? (
                  <Pressable
                    onPress={cancelAll}
                    className="flex-1 bg-red-500 rounded-lg py-2.5 items-center active:opacity-70">
                    <Text className="text-white text-xs font-bold">
                      🗑️ Batalkan Semua
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Section>

          {/* Info */}
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40">
            <Text className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
              💡 Tips Testing
            </Text>
            <Text className="text-xs text-blue-800 dark:text-blue-300 leading-5">
              Notif foreground (app sedang terbuka) muncul sebagai banner di atas. Notif
              background (app di-minimize) muncul di tray seperti notif biasa. Untuk test
              paling realistis:{' '}
              <Text className="font-semibold">tutup app, lalu tunggu notif muncul</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
