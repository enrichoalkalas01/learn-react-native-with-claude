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

import { useToast } from '@/context/toast-context';
import { haptic } from '@/lib/haptic';

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.includes('@')) {
      toast.error('Email tidak valid');
      haptic.error();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success(`Kode dikirim ke ${email}`);
    haptic.success();
    setStep('otp');
  };

  const setOtpDigit = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.warning('Masukkan 6 digit kode');
      haptic.warning();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setStep('success');
    haptic.success();
  };

  if (step === 'success') {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center p-6">
        <View className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center mb-4">
          <Text className="text-5xl">✅</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Berhasil Reset
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Password kamu sudah di-reset. Silakan login dengan password baru.
        </Text>
        <Pressable
          onPress={() => router.replace('/auth/login')}
          className="bg-primary px-8 py-3 rounded-full active:opacity-70">
          <Text className="text-white font-bold">Kembali ke Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        contentContainerClassName="p-5 gap-5"
        keyboardShouldPersistTaps="handled">
        <View className="items-center mt-6 mb-2">
          <View className="w-20 h-20 rounded-3xl bg-amber-500 items-center justify-center mb-3">
            <Text className="text-4xl">{step === 'email' ? '📧' : '🔢'}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 'email' ? 'Lupa Password?' : 'Verifikasi Kode'}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            {step === 'email'
              ? 'Masukkan email, kami kirim kode reset'
              : `Kami kirim 6 digit ke ${email}`}
          </Text>
        </View>

        {step === 'email' ? (
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
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>

            <Pressable
              onPress={sendCode}
              disabled={loading}
              className={`rounded-xl py-3.5 items-center ${
                loading ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary active:opacity-70'
              }`}>
              <Text className="text-white font-bold">
                {loading ? 'Mengirim...' : 'Kirim Kode'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 gap-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between gap-2">
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  value={digit}
                  onChangeText={(v) => setOtpDigit(idx, v)}
                  keyboardType="numeric"
                  maxLength={1}
                  className="w-12 h-14 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-xl font-bold text-gray-900 dark:text-white"
                />
              ))}
            </View>

            <Pressable
              onPress={verifyOtp}
              disabled={loading}
              className={`rounded-xl py-3.5 items-center ${
                loading ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary active:opacity-70'
              }`}>
              <Text className="text-white font-bold">
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setStep('email')}
              className="items-center py-1 active:opacity-70">
              <Text className="text-sm text-primary font-medium">← Ganti email</Text>
            </Pressable>
          </View>
        )}

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Ingat password?
          </Text>
          <Link href="/auth/login" asChild>
            <Pressable className="active:opacity-70">
              <Text className="text-sm font-bold text-primary">Login</Text>
            </Pressable>
          </Link>
        </View>

        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
          <Text className="text-xs text-blue-700 dark:text-blue-300">
            💡 Demo mode — kode OTP apapun (6 digit) akan diterima.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
