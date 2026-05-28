import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSidebar } from '@/context/sidebar-context';

const SIDEBAR_WIDTH = 296;
const ANIMATION_DURATION = 280;

type MenuItem = { label: string; href: string; icon: string };

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Home', href: '/', icon: '🏠' },
      { label: 'Explore', href: '/explore', icon: '🧭' },
      { label: 'Posts', href: '/posts', icon: '📝' },
    ],
  },
  {
    title: 'Mini Apps',
    items: [
      { label: 'Semua Apps', href: '/apps', icon: '🧩' },
      { label: 'Todo List', href: '/apps/todo', icon: '✅' },
      { label: 'Habit Tracker', href: '/apps/habits', icon: '🔥' },
      { label: 'Tip Calculator', href: '/apps/calculator', icon: '🧮' },
      { label: 'Quiz', href: '/apps/quiz', icon: '❓' },
      { label: 'Pomodoro', href: '/apps/pomodoro', icon: '⏱️' },
      { label: 'Expenses', href: '/apps/expenses', icon: '💸' },
      { label: 'Galeri Chart', href: '/apps/charts', icon: '📊' },
      { label: 'Chart Lanjutan', href: '/apps/charts-advanced', icon: '🎯' },
      { label: 'Galeri Animasi', href: '/apps/animations', icon: '✨' },
      { label: 'Push Notifications', href: '/apps/notifications', icon: '🔔' },
      { label: 'Mini Shop', href: '/apps/shop', icon: '🛍️' },
      { label: 'Silsilah Keluarga', href: '/apps/family-tree', icon: '🌳' },
      { label: 'Silsilah v2 (Couple)', href: '/apps/family-tree-v2', icon: '💑' },
      { label: 'Silsilah Flow', href: '/apps/family-tree-flow', icon: '🌐' },
    ],
  },
  {
    title: 'Akun',
    items: [
      { label: 'Profile', href: '/profile', icon: '👤' },
      { label: 'Login', href: '/auth/login', icon: '🔑' },
      { label: 'Daftar', href: '/auth/register', icon: '✨' },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'Playground', href: '/playground', icon: '🧪' },
      { label: 'Settings', href: '/settings', icon: '⚙️' },
    ],
  },
];

// Cek apakah path tertentu cocok dengan current pathname.
// "/" cuma cocok kalau pathname = "/" persis (bukan prefix dari semua).
function isRouteActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/') return pathname === '/';
  return pathname === itemHref || pathname.startsWith(itemHref + '/');
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const [backdropActive, setBackdropActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBackdropActive(true);
      translateX.value = withTiming(0, { duration: ANIMATION_DURATION });
    } else {
      translateX.value = withTiming(
        -SIDEBAR_WIDTH,
        { duration: ANIMATION_DURATION },
        (finished) => {
          if (finished) runOnJS(setBackdropActive)(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SIDEBAR_WIDTH, 0], [0, 0.5]),
  }));

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const next = Math.min(0, e.translationX);
      if (next < 0) translateX.value = next;
    })
    .onEnd((e) => {
      const shouldClose = e.translationX < -SIDEBAR_WIDTH / 3 || e.velocityX < -500;
      if (shouldClose) {
        translateX.value = withTiming(
          -SIDEBAR_WIDTH,
          { duration: ANIMATION_DURATION },
          (finished) => {
            if (finished) {
              runOnJS(setBackdropActive)(false);
              runOnJS(close)();
            }
          }
        );
      } else {
        translateX.value = withTiming(0, { duration: ANIMATION_DURATION });
      }
    });

  const handleNavigate = (href: string) => {
    // Kalau user pilih route yang sedang aktif, tutup saja tanpa push (hindari history kotor)
    if (isRouteActive(href, pathname)) {
      close();
      return;
    }
    close();
    setTimeout(() => router.push(href as never), 100);
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={backdropActive ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
      </Animated.View>

      {/* Panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.panel, sidebarAnimatedStyle]}
          className="bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
          {/* Header */}
          <View
            style={{ paddingTop: insets.top + 16 }}
            className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
                <Text className="text-xl">📱</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold text-gray-900 dark:text-white"
                  numberOfLines={1}>
                  Learn React Native
                </Text>
                <Text
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                  numberOfLines={1}>
                  Sandbox project
                </Text>
              </View>
            </View>
            <Pressable
              onPress={close}
              className="w-9 h-9 items-center justify-center rounded-lg active:bg-gray-100 dark:active:bg-gray-800">
              <Text className="text-lg text-gray-500 dark:text-gray-400">✕</Text>
            </Pressable>
          </View>

          {/* Menu — scrollable */}
          <ScrollView
            className="flex-1"
            contentContainerClassName="py-3"
            showsVerticalScrollIndicator={false}>
            {MENU_SECTIONS.map((section, sectionIdx) => (
              <View key={section.title} className={sectionIdx > 0 ? 'mt-4' : ''}>
                {/* Section label */}
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-5 mb-1">
                  {section.title}
                </Text>

                {section.items.map((item) => {
                  const active = isRouteActive(item.href, pathname);
                  return (
                    <Pressable
                      key={item.href}
                      onPress={() => handleNavigate(item.href)}
                      className={`mx-3 my-0.5 rounded-xl px-3 py-2.5 flex-row items-center gap-3 ${
                        active
                          ? 'bg-primary/10 dark:bg-primary/20'
                          : 'active:bg-gray-50 dark:active:bg-gray-800'
                      }`}>
                      <View
                        className={`w-9 h-9 rounded-lg items-center justify-center ${
                          active ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <Text className="text-base">{item.icon}</Text>
                      </View>
                      <Text
                        className={`flex-1 text-[15px] ${
                          active
                            ? 'font-semibold text-primary'
                            : 'font-medium text-gray-800 dark:text-gray-200'
                        }`}>
                        {item.label}
                      </Text>
                      {active && <View className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View
            style={{ paddingBottom: insets.bottom + 16 }}
            className="px-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex-row items-center justify-between">
            <Text className="text-[11px] text-gray-400 dark:text-gray-500">
              v1.0.0 · Expo SDK 54
            </Text>
            <Text className="text-[11px] text-gray-400 dark:text-gray-500">
              ← swipe untuk tutup
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    zIndex: 10,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
});
