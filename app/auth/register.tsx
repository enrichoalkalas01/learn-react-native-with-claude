import { useMemo, useState } from 'react';
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

function getPasswordStrength(pw: string): {
  label: string;
  percent: number;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: 'Lemah', percent: 25, color: 'bg-red-500' };
  if (score === 2) return { label: 'Sedang', percent: 50, color: 'bg-amber-500' };
  if (score === 3) return { label: 'Baik', percent: 75, color: 'bg-blue-500' };
  return { label: 'Kuat', percent: 100, color: 'bg-green-500' };
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordMatch = password.length > 0 && password === confirm;

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      toast.warning('Semua field wajib diisi');
      haptic.warning();
      return;
    }
    if (!passwordMatch) {
      toast.error('Konfirmasi password tidak cocok');
      haptic.error();
      return;
    }
    if (!agree) {
      toast.warning('Setujui Syarat & Ketentuan dulu');
      haptic.warning();
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Pendaftaran gagal');
      return;
    }
    toast.success(`Selamat datang, ${name.trim()}!`);
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
        <View className="items-center mt-4 mb-2">
          <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-3">
            <Text className="text-4xl">✨</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Buat Akun Baru
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Beberapa detik saja, gratis.
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 gap-4 border border-gray-100 dark:border-gray-700">
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Nama lengkap
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Budi Santoso"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            />
          </View>

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
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            />
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            />
            {password.length > 0 && (
              <View className="mt-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-gray-500">Kekuatan</Text>
                  <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {strength.label}
                  </Text>
                </View>
                <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </View>
              </View>
            )}
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Konfirmasi password
            </Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Ulangi password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              className={`bg-gray-50 dark:bg-gray-900 border rounded-xl px-4 py-3 text-gray-900 dark:text-white ${
                confirm.length === 0
                  ? 'border-gray-200 dark:border-gray-700'
                  : passwordMatch
                    ? 'border-green-500'
                    : 'border-red-500'
              }`}
            />
            {confirm.length > 0 && !passwordMatch && (
              <Text className="text-xs text-red-500 mt-1">Password tidak cocok</Text>
            )}
          </View>

          {/* T&C */}
          <Pressable
            onPress={() => setAgree((v) => !v)}
            className="flex-row items-start gap-2 active:opacity-70">
            <View
              className={`w-5 h-5 rounded-md border-2 items-center justify-center mt-0.5 ${
                agree
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
              {agree && <Text className="text-white text-[10px] font-bold">✓</Text>}
            </View>
            <Text className="text-xs text-gray-600 dark:text-gray-400 flex-1 leading-4">
              Saya setuju dengan{' '}
              <Text className="text-primary font-medium">Syarat & Ketentuan</Text> dan{' '}
              <Text className="text-primary font-medium">Kebijakan Privasi</Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={submit}
            disabled={loading}
            className={`rounded-xl py-3.5 items-center ${
              loading ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary active:opacity-70'
            }`}>
            <Text className="text-white font-bold">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?
          </Text>
          <Link href="/auth/login" asChild>
            <Pressable className="active:opacity-70">
              <Text className="text-sm font-bold text-primary">Login</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
