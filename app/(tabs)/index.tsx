import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { formatIDR } from '@/lib/format';

const TIPS = [
  'Pakai functional updater `setX((prev) => ...)` di async callback agar tidak baca state stale.',
  'NativeWind tidak bisa interpolasi class string — pakai inline `style` untuk nilai dinamis.',
  '`useMemo` cuma berguna kalau perhitungan benar-benar berat. Jangan dipakai sembarangan.',
  'Selalu cleanup `setInterval`/`setTimeout` di return useEffect supaya tidak memory leak.',
  'Custom hook nama wajib diawali `use` agar React linter bisa cek aturan hooks.',
  'AsyncStorage hanya simpan string — wajib `JSON.stringify` saat tulis, `JSON.parse` saat baca.',
  '`router.replace()` tidak bisa di-back — cocok untuk login/onboarding flow.',
];

const FEATURED = [
  {
    href: '/apps/todo',
    icon: '✅',
    title: 'Todo List',
    desc: 'CRUD task + filter + persistensi',
    color: 'bg-blue-500',
  },
  {
    href: '/apps/pomodoro',
    icon: '⏱️',
    title: 'Pomodoro Timer',
    desc: 'Belajar setInterval & cleanup',
    color: 'bg-rose-500',
  },
  {
    href: '/apps/shop',
    icon: '🛍️',
    title: 'Mini Shop',
    desc: 'E-commerce sederhana + cart',
    color: 'bg-purple-500',
  },
] as const;

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getDateLabel(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getDailyTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TIPS[dayOfYear % TIPS.length];
}

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  href: string;
  accent: string;
};

function StatCard({ icon, label, value, href, accent }: StatCardProps) {
  return (
    <Pressable
      onPress={() => router.push(href as never)}
      className="flex-1 min-w-[45%] bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 active:opacity-70">
      <View className={`w-10 h-10 rounded-xl items-center justify-center ${accent}`}>
        <Text className="text-xl">{icon}</Text>
      </View>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-3">{label}</Text>
      <Text
        className="text-xl font-bold text-gray-900 dark:text-white mt-0.5"
        numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const stats = useDashboardStats();
  const greeting = getTimeGreeting();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-5">
        {/* Greeting hero */}
        <View>
          <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {getDateLabel()}
          </Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {greeting} 👋
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
            Mau belajar React Native apa hari ini?
          </Text>
        </View>

        {/* Stats grid 2x2 */}
        <View className="flex-row flex-wrap gap-3">
          <StatCard
            icon="✅"
            label="Task aktif"
            value={`${stats.todoCount}/${stats.todoTotal}`}
            href="/apps/todo"
            accent="bg-blue-100 dark:bg-blue-900/40"
          />
          <StatCard
            icon="🔥"
            label="Habit minggu ini"
            value={`${Math.round(stats.habitPercent)}%`}
            href="/apps/habits"
            accent="bg-orange-100 dark:bg-orange-900/40"
          />
          <StatCard
            icon="⏱️"
            label="Sesi fokus selesai"
            value={stats.pomodoroSessions}
            href="/apps/pomodoro"
            accent="bg-rose-100 dark:bg-rose-900/40"
          />
          <StatCard
            icon="💸"
            label="Saldo"
            value={formatIDR(stats.balance)}
            href="/apps/expenses"
            accent="bg-green-100 dark:bg-green-900/40"
          />
        </View>

        {/* Featured apps */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Coba Sekarang
            </Text>
            <Pressable onPress={() => router.push('/apps' as never)}>
              <Text className="text-sm font-medium text-primary">Lihat semua →</Text>
            </Pressable>
          </View>
          <View className="gap-2">
            {FEATURED.map((app) => (
              <Pressable
                key={app.href}
                onPress={() => router.push(app.href as never)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3 active:opacity-70">
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center ${app.color}`}>
                  <Text className="text-2xl">{app.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    {app.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {app.desc}
                  </Text>
                </View>
                <Text className="text-gray-300 dark:text-gray-600 text-xl">›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Daily tip */}
        <View className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-base">💡</Text>
            <Text className="text-sm font-bold text-amber-700 dark:text-amber-300">
              Tips Hari Ini
            </Text>
          </View>
          <Text className="text-sm text-amber-800 dark:text-amber-200 leading-5">
            {getDailyTip()}
          </Text>
        </View>

        {/* Lanjutkan belajar */}
        <View>
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Lanjutkan Belajar
          </Text>
          <View className="gap-2">
            <Pressable
              onPress={() => router.push('/posts' as never)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3 active:opacity-70">
              <Text className="text-2xl">📝</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Artikel Belajar
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  5 artikel tutorial React Native
                </Text>
              </View>
              <Text className="text-gray-300 dark:text-gray-600 text-xl">›</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/explore' as never)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3 active:opacity-70">
              <Text className="text-2xl">🧭</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Explore Components
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Komponen-komponen yang ada di template
                </Text>
              </View>
              <Text className="text-gray-300 dark:text-gray-600 text-xl">›</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center pt-4 pb-2">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            Learn React Native v1.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
