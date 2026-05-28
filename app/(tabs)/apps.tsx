import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

const APPS = [
  {
    href: '/apps/todo',
    icon: '✅',
    title: 'Todo List',
    desc: 'Tambah, centang, hapus, & filter task. State pakai useState + AsyncStorage.',
    color: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    href: '/apps/habits',
    icon: '🔥',
    title: 'Habit Tracker',
    desc: 'Catat kebiasaan harian + checklist 7 hari + streak counter.',
    color: 'bg-orange-100 dark:bg-orange-900/40',
  },
  {
    href: '/apps/calculator',
    icon: '🧮',
    title: 'Tip Calculator',
    desc: 'Hitung tip restoran + split per orang secara real-time.',
    color: 'bg-green-100 dark:bg-green-900/40',
  },
  {
    href: '/apps/quiz',
    icon: '❓',
    title: 'Quiz React Native',
    desc: '7 pertanyaan multiple choice + score + restart.',
    color: 'bg-purple-100 dark:bg-purple-900/40',
  },
  {
    href: '/apps/pomodoro',
    icon: '⏱️',
    title: 'Pomodoro Timer',
    desc: '25 menit fokus + 5 menit istirahat. Pakai setInterval & useRef.',
    color: 'bg-rose-100 dark:bg-rose-900/40',
  },
  {
    href: '/apps/expenses',
    icon: '💸',
    title: 'Expense Tracker',
    desc: 'Catat pemasukan & pengeluaran + saldo + kategori.',
    color: 'bg-teal-100 dark:bg-teal-900/40',
  },
  {
    href: '/apps/charts',
    icon: '📊',
    title: 'Galeri Chart',
    desc: 'Demo berbagai chart: line, area, bar, stacked, pie, donut, pyramid.',
    color: 'bg-cyan-100 dark:bg-cyan-900/40',
  },
  {
    href: '/apps/charts-advanced',
    icon: '🎯',
    title: 'Chart Lanjutan',
    desc: 'Chart interaktif: editable data, real-time, radar, heatmap, rings.',
    color: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
  },
  {
    href: '/apps/animations',
    icon: '✨',
    title: 'Galeri Animasi',
    desc: '13 demo: fade, spring, rotate, flip, shake, pulse, drag, swipe.',
    color: 'bg-violet-100 dark:bg-violet-900/40',
  },
  {
    href: '/apps/notifications',
    icon: '🔔',
    title: 'Push Notifications',
    desc: 'Kirim notif ke HP: instant, scheduled, daily reminder.',
    color: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    href: '/apps/shop',
    icon: '🛍️',
    title: 'Mini Shop',
    desc: 'E-commerce sample: katalog, search, cart, checkout.',
    color: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  {
    href: '/apps/family-tree',
    icon: '🌳',
    title: 'Silsilah Keluarga',
    desc: 'Pohon keluarga dengan CRUD: tambah, edit, hapus anggota lintas generasi.',
    color: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  {
    href: '/apps/family-tree-v2',
    icon: '💑',
    title: 'Silsilah v2 (Couple Group)',
    desc: 'Pohon keluarga rapi: suami-istri otomatis di-group jadi satu card.',
    color: 'bg-rose-100 dark:bg-rose-900/40',
  },
  {
    href: '/apps/family-tree-flow',
    icon: '🌐',
    title: 'Silsilah Flow (React Flow style)',
    desc: 'Canvas pohon dengan pan + pinch zoom + SVG connection lines.',
    color: 'bg-sky-100 dark:bg-sky-900/40',
  },
  {
    href: '/playground',
    icon: '🧪',
    title: 'Playground',
    desc: 'Test fitur native: notif, haptic, sound, toast, confetti, sheet.',
    color: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
] as const;

export default function AppsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-3">
        <View className="mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Mini Apps
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {APPS.length} aplikasi sederhana tanpa backend
          </Text>
        </View>

        {APPS.map((app) => (
          <Pressable
            key={app.href}
            android_ripple={{ color: '#00000010' }}
            onPress={() => router.push(app.href as never)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-4">
            <View
              className={`w-14 h-14 rounded-2xl items-center justify-center ${app.color}`}>
              <Text className="text-2xl">{app.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                {app.title}
              </Text>
              <Text
                className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
                numberOfLines={2}>
                {app.desc}
              </Text>
            </View>
            <Text className="text-gray-300 dark:text-gray-600 text-xl">›</Text>
          </Pressable>
        ))}

        {/* Settings link */}
        <Pressable
          android_ripple={{ color: '#00000010' }}
          onPress={() => router.push('/settings' as never)}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-4 mt-2">
          <View className="w-14 h-14 rounded-2xl items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Text className="text-2xl">⚙️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Settings
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Theme & data management
            </Text>
          </View>
          <Text className="text-gray-300 dark:text-gray-600 text-xl">›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
