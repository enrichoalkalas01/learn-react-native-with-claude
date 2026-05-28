import '../global.css';

import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { SidebarProvider } from '@/context/sidebar-context';
import { ThemePreferenceProvider, useThemePreference } from '@/context/theme-context';
import { ToastProvider } from '@/context/toast-context';
import { ConfettiProvider } from '@/context/confetti-context';
import { AuthProvider } from '@/context/auth-context';
import { Sidebar } from '@/components/sidebar';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavigationStack() {
  const { effectiveScheme } = useThemePreference();

  return (
    <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SidebarProvider>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="auth"
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
            <Stack.Screen
              name="settings"
              options={{ title: 'Settings', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="profile"
              options={{ title: 'Profile', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="playground"
              options={{ title: 'Playground', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="posts/[id]"
              options={{ title: 'Detail Post', headerBackTitle: 'Posts' }}
            />
            <Stack.Screen
              name="apps/todo"
              options={{ title: 'Todo List', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/habits"
              options={{ title: 'Habit Tracker', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/calculator"
              options={{ title: 'Tip Calculator', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/quiz"
              options={{ title: 'Quiz', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/pomodoro"
              options={{ title: 'Pomodoro', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/expenses"
              options={{ title: 'Expenses', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/charts"
              options={{ title: 'Galeri Chart', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/charts-advanced"
              options={{ title: 'Chart Lanjutan', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/animations"
              options={{ title: 'Galeri Animasi', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/notifications"
              options={{ title: 'Push Notifications', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/family-tree"
              options={{ title: 'Silsilah Keluarga', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/family-tree-v2"
              options={{ title: 'Silsilah v2', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/family-tree-flow"
              options={{ title: 'Silsilah Flow', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/shop/index"
              options={{ title: 'Mini Shop', headerBackTitle: 'Apps' }}
            />
            <Stack.Screen
              name="apps/shop/[id]"
              options={{ title: 'Detail Produk', headerBackTitle: 'Shop' }}
            />
          </Stack>

          <Sidebar />
        </View>
      </SidebarProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    AsyncStorage.getItem('@app/onboarding-done').then((v) => {
      const done = v === 'true';
      const onOnboardingScreen = segments[0] === 'onboarding';
      if (!done && !onOnboardingScreen) {
        router.replace('/onboarding');
      }
      setChecked(true);
    });
    // hanya jalan sekali saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemePreferenceProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfettiProvider>
              <OnboardingGate>
                <NavigationStack />
              </OnboardingGate>
            </ConfettiProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemePreferenceProvider>
    </GestureHandlerRootView>
  );
}
