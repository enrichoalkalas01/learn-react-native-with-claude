import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { haptic } from '@/lib/haptic';

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();
  const toast = useToast();

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">Memuat...</Text>
      </View>
    );
  }

  // Belum login — tampilkan call-to-action
  if (!user) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
        <View className="p-5 items-center mt-12 gap-5">
          <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
            <Text className="text-5xl">👤</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Belum Login
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 max-w-xs">
              Login atau daftar untuk akses fitur personalisasi
            </Text>
          </View>

          <View className="w-full gap-3 mt-4">
            <Pressable
              onPress={() => router.push('/auth/login')}
              className="bg-primary rounded-xl py-4 items-center active:opacity-70">
              <Text className="text-white font-bold text-base">Login</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/auth/register')}
              className="bg-white dark:bg-gray-800 rounded-xl py-4 items-center border border-gray-200 dark:border-gray-700 active:opacity-70">
              <Text className="text-gray-900 dark:text-white font-bold text-base">
                Daftar Akun Baru
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Sudah login
  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin mau logout?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          haptic.light();
          toast.info('Sampai jumpa lagi 👋');
          router.replace('/profile');
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-5 gap-5">
        {/* Avatar + nama */}
        <View className="items-center pt-4">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
            <Text className="text-5xl">{user.avatar}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mt-3">
            {user.name}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{user.email}</Text>
        </View>

        {/* Info section */}
        <View>
          <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 px-1">
            Akun
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <Pressable
              onPress={() => toast.info('Fitur edit profil belum diimplementasi')}
              className="px-4 py-3 flex-row items-center gap-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
              <Text className="text-xl">✏️</Text>
              <Text className="flex-1 text-base text-gray-900 dark:text-white">
                Edit Profil
              </Text>
              <Text className="text-gray-300 text-xl">›</Text>
            </Pressable>
            <Pressable
              onPress={() => toast.info('Notification settings belum dibuat')}
              className="px-4 py-3 flex-row items-center gap-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
              <Text className="text-xl">🔔</Text>
              <Text className="flex-1 text-base text-gray-900 dark:text-white">
                Notifikasi
              </Text>
              <Text className="text-gray-300 text-xl">›</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/settings')}
              className="px-4 py-3 flex-row items-center gap-3 active:bg-gray-50 dark:active:bg-gray-700">
              <Text className="text-xl">⚙️</Text>
              <Text className="flex-1 text-base text-gray-900 dark:text-white">
                Settings
              </Text>
              <Text className="text-gray-300 text-xl">›</Text>
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="bg-white dark:bg-gray-800 rounded-xl py-3.5 items-center border border-red-200 dark:border-red-900/40 active:bg-red-50 dark:active:bg-red-900/20">
          <Text className="text-red-500 font-bold">Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
