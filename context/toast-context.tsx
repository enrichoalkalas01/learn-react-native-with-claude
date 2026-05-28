import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { haptic } from '@/lib/haptic';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; icon: string; iconColor: string }
> = {
  success: { bg: 'bg-green-600', icon: '✓', iconColor: 'text-white' },
  error: { bg: 'bg-red-600', icon: '✕', iconColor: 'text-white' },
  info: { bg: 'bg-blue-600', icon: 'ℹ', iconColor: 'text-white' },
  warning: { bg: 'bg-amber-500', icon: '!', iconColor: 'text-white' },
};

const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, variant }]);

    if (variant === 'success') haptic.success();
    else if (variant === 'error') haptic.error();
    else if (variant === 'warning') haptic.warning();
    else haptic.light();

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const success = useCallback((m: string) => show(m, 'success'), [show]);
  const error = useCallback((m: string) => show(m, 'error'), [show]);
  const info = useCallback((m: string) => show(m, 'info'), [show]);
  const warning = useCallback((m: string) => show(m, 'warning'), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning }}>
      {children}
      {/* Toast container — overlay di atas semua konten */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-12 items-center px-4 z-50">
        {toasts.map((t) => {
          const style = VARIANT_STYLES[t.variant];
          return (
            <Animated.View
              key={t.id}
              entering={FadeInDown.duration(200)}
              exiting={FadeOutDown.duration(200)}
              className="mb-2 w-full max-w-md">
              <Pressable
                onPress={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className={`${style.bg} rounded-xl px-4 py-3 flex-row items-center gap-3 shadow-lg`}>
                <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
                  <Text className={`text-sm font-bold ${style.iconColor}`}>
                    {style.icon}
                  </Text>
                </View>
                <Text className="text-white font-medium flex-1" numberOfLines={2}>
                  {t.message}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
