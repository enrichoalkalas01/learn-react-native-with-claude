import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { haptic } from '@/lib/haptic';

export default function LoginScreen() {
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      toast.warning('Email & password wajib diisi');
      haptic.warning();
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Login gagal');
      return;
    }
    toast.success('Login berhasil');
    haptic.success();
    router.replace('/profile');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        contentContainerClassName="p-5 gap-5"
        keyboardShouldPersistTaps="handled">
        <View className="items-center mt-6 mb-2">
          <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-3">
            <Text className="text-4xl">🔐</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Selamat Datang Kembali
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Login untuk lanjut belajar React Native
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 gap-4 border border-gray-100 dark:border-gray-700">
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="kamu@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            />
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pr-2">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoComplete="password"
                className="flex-1 px-4 py-3 text-gray-900 dark:text-white"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                className="px-3 py-2 active:opacity-70">
                <Text className="text-sm">{showPassword ? '🙈' : '👁'}</Text>
              </Pressable>
            </View>
          </View>

          <Link href="/auth/forgot" asChild>
            <Pressable className="self-end active:opacity-70">
              <Text className="text-sm text-primary font-medium">Lupa password?</Text>
            </Pressable>
          </Link>

          <Pressable
            onPress={submit}
            disabled={loading}
            className={`rounded-xl py-3.5 items-center ${
              loading ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary active:opacity-70'
            }`}>
            <Text className="text-white font-bold">
              {loading ? 'Memproses...' : 'Login'}
            </Text>
          </Pressable>
        </View>

        {/* Social login (mock) */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <Text className="text-xs text-gray-500">atau</Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => toast.info('Google Sign-In (mock)')}
            className="flex-1 bg-white dark:bg-gray-800 rounded-xl py-3 items-center border border-gray-200 dark:border-gray-700 active:opacity-70">
            <Text className="text-base">G Google</Text>
          </Pressable>
          <Pressable
            onPress={() => toast.info('Apple Sign-In (mock)')}
            className="flex-1 bg-black rounded-xl py-3 items-center active:opacity-70">
            <Text className="text-white text-base"> Apple</Text>
          </Pressable>
        </View>

        {/* Daftar */}
        <View className="flex-row justify-center gap-1 mt-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Belum punya akun?
          </Text>
          <Link href="/auth/register" asChild>
            <Pressable className="active:opacity-70">
              <Text className="text-sm font-bold text-primary">Daftar</Text>
            </Pressable>
          </Link>
        </View>

        <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
          <Text className="text-xs text-amber-700 dark:text-amber-300">
            💡 Demo mode — masukkan email valid apa saja, password apa saja. Tidak ada
            server di belakang.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
