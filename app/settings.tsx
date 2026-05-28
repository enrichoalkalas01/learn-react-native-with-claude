import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useThemePreference, type ThemeMode } from '@/context/theme-context';
import { clearAllAppData } from '@/hooks/use-stored-state';

const MODE_OPTIONS: { key: ThemeMode; label: string; icon: string; desc: string }[] = [
  { key: 'system', label: 'Otomatis', icon: '⚙️', desc: 'Ikut sistem operasi' },
  { key: 'light', label: 'Terang', icon: '☀️', desc: 'Selalu light mode' },
  { key: 'dark', label: 'Gelap', icon: '🌙', desc: 'Selalu dark mode' },
];

export default function SettingsScreen() {
  const { mode, setMode } = useThemePreference();
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Reset Semua Data',
      'Semua data Todo, Habit, Expense, Pomodoro, dan preferensi akan dihapus. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            await clearAllAppData();
            setResetting(false);
            Alert.alert(
              'Selesai',
              'Data sudah dihapus. Restart aplikasi untuk efek penuh.'
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-5">
        {/* Theme section */}
        <View>
          <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 px-1">
            Tampilan
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {MODE_OPTIONS.map((opt, idx) => {
              const isActive = mode === opt.key;
              const isLast = idx === MODE_OPTIONS.length - 1;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setMode(opt.key)}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    !isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  } active:bg-gray-50 dark:active:bg-gray-700`}>
                  <Text className="text-2xl">{opt.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {opt.label}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {opt.desc}
                    </Text>
                  </View>
                  {isActive && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Data section */}
        <View>
          <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 px-1">
            Data
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <Pressable
              onPress={handleReset}
              disabled={resetting}
              className="px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700">
              <Text className="text-base font-semibold text-red-500">
                {resetting ? 'Menghapus...' : 'Reset semua data'}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Hapus Todo, Habit, Expense, Pomodoro session, dan preferensi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* About */}
        <View>
          <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 px-1">
            Tentang
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              Learn React Native
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sandbox project untuk belajar React Native + NativeWind. Semua data disimpan
              lokal di device, tidak ada server.
            </Text>
            <View className="flex-row gap-4 mt-3">
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                Versi 1.0.0
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                Expo SDK 54
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
