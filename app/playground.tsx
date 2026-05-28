import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';

import { haptic } from '@/lib/haptic';
import { sound } from '@/lib/sound';
import {
  cancelAllNotifications,
  getScheduledCount,
  IS_EXPO_GO,
  scheduleDailyReminder,
  scheduleIn,
} from '@/lib/notifications';
import { useToast } from '@/context/toast-context';
import { useConfetti } from '@/context/confetti-context';

type ButtonProps = {
  label: string;
  onPress: () => void;
  emoji?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
};

const VARIANT_BG: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-gray-700 dark:bg-gray-600',
};

function TestButton({ label, onPress, emoji, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 ${VARIANT_BG[variant]} rounded-xl py-3 px-3 active:opacity-70 flex-row items-center justify-center gap-1.5`}>
      {emoji && <Text className="text-base">{emoji}</Text>}
      <Text className="text-white font-semibold text-xs">{label}</Text>
    </Pressable>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
      {desc && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">
          {desc}
        </Text>
      )}
      {!desc && <View className="h-3" />}
      <View className="gap-2">{children}</View>
    </View>
  );
}

export default function PlaygroundScreen() {
  const toast = useToast();
  const confetti = useConfetti();

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const refreshNotifCount = async () => {
    const count = await getScheduledCount();
    setScheduledCount(count);
  };

  const testNotifIn5s = async () => {
    if (IS_EXPO_GO) {
      toast.warning('Notifications tidak jalan di Expo Go. Pakai dev build.');
      return;
    }
    const id = await scheduleIn(
      5,
      'Halo dari Playground 👋',
      'Notifikasi ini di-schedule 5 detik lalu.'
    );
    if (id) {
      toast.success('Notifikasi dijadwalkan dalam 5 detik');
    } else {
      toast.error('Permission notifikasi ditolak');
    }
    refreshNotifCount();
  };

  const testNotifDaily = async () => {
    if (IS_EXPO_GO) {
      toast.warning('Notifications tidak jalan di Expo Go. Pakai dev build.');
      return;
    }
    const id = await scheduleDailyReminder(
      9,
      0,
      'Reminder Belajar 📚',
      'Saatnya buka project React Native!'
    );
    if (id) {
      toast.success('Daily reminder jam 09:00 set');
    } else {
      toast.error('Permission notifikasi ditolak');
    }
    refreshNotifCount();
  };

  const testCancelAll = async () => {
    await cancelAllNotifications();
    toast.info('Semua notifikasi dibatalkan');
    refreshNotifCount();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerClassName="p-4 gap-4 pb-12">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 Playground
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Test setiap fitur native yang terpasang di project ini.
          </Text>
        </View>

        {/* Toast */}
        <Section title="💬 Toast" desc="Feedback non-blocking dengan auto-dismiss 2.5s.">
          <View className="flex-row gap-2">
            <TestButton
              label="Success"
              variant="success"
              onPress={() => toast.success('Berhasil disimpan')}
            />
            <TestButton
              label="Error"
              variant="danger"
              onPress={() => toast.error('Terjadi kesalahan')}
            />
          </View>
          <View className="flex-row gap-2">
            <TestButton
              label="Warning"
              variant="warning"
              onPress={() => toast.warning('Hati-hati')}
            />
            <TestButton
              label="Info"
              variant="primary"
              onPress={() => toast.info('Sekedar informasi')}
            />
          </View>
        </Section>

        {/* Haptic */}
        <Section
          title="📳 Haptic Feedback"
          desc="Getaran ringan di iOS/Android (no-op di web).">
          <View className="flex-row gap-2">
            <TestButton label="Light" onPress={() => haptic.light()} />
            <TestButton label="Medium" onPress={() => haptic.medium()} />
            <TestButton label="Heavy" onPress={() => haptic.heavy()} />
          </View>
          <View className="flex-row gap-2">
            <TestButton
              label="Selection"
              variant="neutral"
              onPress={() => haptic.selection()}
            />
            <TestButton
              label="Success"
              variant="success"
              onPress={() => haptic.success()}
            />
            <TestButton label="Error" variant="danger" onPress={() => haptic.error()} />
          </View>
        </Section>

        {/* Sound */}
        <Section title="🔊 Audio" desc="Putar sound effect (butuh internet).">
          <View className="flex-row gap-2">
            <TestButton
              emoji="🖱️"
              label="Click"
              onPress={() => {
                haptic.light();
                sound.click();
              }}
            />
            <TestButton
              emoji="🎉"
              label="Success"
              variant="success"
              onPress={() => {
                haptic.success();
                sound.success();
              }}
            />
          </View>
        </Section>

        {/* Notifications */}
        <Section
          title="🔔 Notifications"
          desc={
            IS_EXPO_GO
              ? '⚠️ Tidak jalan di Expo Go (sejak SDK 53). Pakai dev build.'
              : scheduledCount === null
                ? 'Schedule notif lokal — minta permission saat pertama kali.'
                : `${scheduledCount} notifikasi terjadwal`
          }>
          <TestButton emoji="⏰" label="Schedule 5 detik" onPress={testNotifIn5s} />
          <TestButton
            emoji="📅"
            label="Daily reminder 09:00"
            variant="success"
            onPress={testNotifDaily}
          />
          <TestButton
            emoji="🚫"
            label="Cancel semua"
            variant="danger"
            onPress={testCancelAll}
          />
          <TestButton
            label="Cek jumlah terjadwal"
            variant="neutral"
            onPress={refreshNotifCount}
          />
        </Section>

        {/* Confetti */}
        <Section title="🎉 Confetti" desc="Animasi confetti dari atas layar.">
          <TestButton
            emoji="🎊"
            label="Trigger Confetti"
            variant="success"
            onPress={() => confetti.fire()}
          />
        </Section>

        {/* Bottom Sheet */}
        <Section title="📊 Bottom Sheet" desc="Modal sheet dari bawah, drag-able.">
          <TestButton
            emoji="⬆️"
            label="Open Bottom Sheet"
            onPress={() => {
              haptic.selection();
              sheetRef.current?.snapToIndex(0);
            }}
          />
        </Section>

        {/* Auth */}
        <Section title="🔐 Auth Flow" desc="Mock auth — tanpa server.">
          <View className="flex-row gap-2">
            <TestButton
              emoji="🔑"
              label="Login"
              onPress={() => router.push('/auth/login')}
            />
            <TestButton
              emoji="✨"
              label="Daftar"
              variant="success"
              onPress={() => router.push('/auth/register')}
            />
          </View>
          <View className="flex-row gap-2">
            <TestButton
              emoji="❓"
              label="Lupa Password"
              variant="warning"
              onPress={() => router.push('/auth/forgot')}
            />
            <TestButton
              emoji="👤"
              label="Profile"
              variant="neutral"
              onPress={() => router.push('/profile')}
            />
          </View>
        </Section>

        {/* Shop Detail */}
        <Section title="🛍️ Shop Detail" desc="Buka detail produk (Stack drill-down).">
          <View className="flex-row gap-2">
            <TestButton
              emoji="👕"
              label="Detail Kaos"
              onPress={() => router.push('/apps/shop/1' as never)}
            />
            <TestButton
              emoji="🎧"
              label="Detail Headphone"
              variant="neutral"
              onPress={() => router.push('/apps/shop/6' as never)}
            />
          </View>
        </Section>

        {/* Combo */}
        <Section title="🎨 Combo Test" desc="Trigger banyak fitur sekaligus.">
          <TestButton
            emoji="🚀"
            label="Big Win!"
            variant="success"
            onPress={() => {
              haptic.success();
              sound.success();
              confetti.fire();
              toast.success('Combo berhasil! 🎉');
            }}
          />
        </Section>
      </ScrollView>

      {/* Demo bottom sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        handleIndicatorStyle={{ backgroundColor: '#9ca3af' }}>
        <BottomSheetView className="flex-1 bg-white dark:bg-gray-900 rounded-t-3xl p-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Demo Bottom Sheet
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sheet ini di-render via @gorhom/bottom-sheet
          </Text>

          <View className="gap-3 mt-4">
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Drag-able
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                Drag handle atas atau swipe down untuk tutup
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Backdrop
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                Tap area gelap di atas sheet juga akan tutup
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Snap points
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                Bisa multi-snap (45%, 88%) untuk drag step
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => sheetRef.current?.close()}
            className="bg-primary rounded-xl py-3 items-center mt-4 active:opacity-70">
            <Text className="text-white font-bold">Tutup Sheet</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
