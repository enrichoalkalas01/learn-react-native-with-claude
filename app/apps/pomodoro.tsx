import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { usePomodoro } from '@/hooks/use-pomodoro';
import { haptic } from '@/lib/haptic';
import { sound } from '@/lib/sound';
import { cancelAllNotifications, scheduleIn } from '@/lib/notifications';
import { useToast } from '@/context/toast-context';

export default function PomodoroScreen() {
  const p = usePomodoro();
  const toast = useToast();
  const isFocus = p.mode === 'focus';

  // Detect saat timer baru saja selesai (secondsLeft reset ke durasi baru &
  // isRunning auto false). Pakai ref untuk track previous mode supaya hanya
  // trigger sekali per transisi.
  const prevModeRef = useRef(p.mode);
  useEffect(() => {
    if (prevModeRef.current !== p.mode) {
      // Mode baru saja switch — artinya timer selesai
      sound.success();
      haptic.success();
      toast.success(
        p.mode === 'break'
          ? 'Sesi fokus selesai! Istirahat 5 menit.'
          : 'Istirahat selesai. Lanjut fokus!'
      );
      prevModeRef.current = p.mode;
    }
  }, [p.mode, toast]);

  const handleStart = async () => {
    haptic.medium();
    p.start();
    // Schedule notif sebagai backup, kalau user keluar app sebelum timer selesai
    await cancelAllNotifications();
    await scheduleIn(
      p.secondsLeft,
      isFocus ? '⏱️ Fokus selesai!' : '☕ Istirahat selesai!',
      isFocus ? 'Saatnya istirahat 5 menit.' : 'Lanjut sesi fokus berikutnya.'
    );
  };

  const handlePause = async () => {
    haptic.light();
    p.pause();
    await cancelAllNotifications();
  };

  const handleReset = async () => {
    haptic.warning();
    p.reset();
    await cancelAllNotifications();
  };

  const handleSwitchMode = (mode: 'focus' | 'break') => {
    haptic.selection();
    p.switchMode(mode);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-5">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Pomodoro Timer
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            25 menit fokus, 5 menit istirahat
          </Text>
        </View>

        {/* Mode tabs */}
        <View className="flex-row bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => handleSwitchMode('focus')}
            className={`flex-1 py-2 rounded-lg ${isFocus ? 'bg-primary' : ''}`}>
            <Text
              className={`text-center text-sm font-medium ${
                isFocus ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}>
              Fokus
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleSwitchMode('break')}
            className={`flex-1 py-2 rounded-lg ${!isFocus ? 'bg-primary' : ''}`}>
            <Text
              className={`text-center text-sm font-medium ${
                !isFocus ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}>
              Istirahat
            </Text>
          </Pressable>
        </View>

        {/* Timer display */}
        <View
          className={`rounded-3xl p-8 items-center ${
            isFocus ? 'bg-primary' : 'bg-green-500'
          }`}>
          <Text className="text-white/80 text-sm font-medium uppercase tracking-wide">
            {isFocus ? 'Fokus' : 'Istirahat'}
          </Text>
          <Text className="text-white text-7xl font-bold mt-2 tabular-nums">
            {p.formattedTime}
          </Text>

          {/* Progress bar */}
          <View className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mt-6">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${p.progress}%` }}
            />
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row gap-3">
          {!p.isRunning ? (
            <Pressable
              onPress={handleStart}
              className="flex-1 bg-primary rounded-xl py-4 items-center active:opacity-70">
              <Text className="text-white font-bold text-base">▶ Mulai</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePause}
              className="flex-1 bg-amber-500 rounded-xl py-4 items-center active:opacity-70">
              <Text className="text-white font-bold text-base">⏸ Pause</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleReset}
            className="px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-4 items-center active:opacity-70">
            <Text className="text-gray-700 dark:text-gray-200 font-bold text-base">
              Reset
            </Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sesi fokus selesai
              </Text>
              <Text className="text-3xl font-bold text-primary mt-1">
                {p.completedSessions}
              </Text>
            </View>
            {p.completedSessions > 0 && (
              <Pressable
                onPress={p.resetSessions}
                className="px-4 py-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Reset hitungan
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Info kecil */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
            💡 Tips
          </Text>
          <Text className="text-xs text-blue-700 dark:text-blue-300 leading-5">
            Setelah 4 sesi fokus berturut-turut, ambil istirahat lebih panjang (15-30
            menit). Hitungan sesi disimpan walau aplikasi ditutup.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
