import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { calcStreak } from '@/lib/format';

type Stats = {
  todoCount: number;
  todoTotal: number;
  habitPercent: number;
  habitBestStreak: number;
  pomodoroSessions: number;
  balance: number;
  loaded: boolean;
};

const INITIAL: Stats = {
  todoCount: 0,
  todoTotal: 0,
  habitPercent: 0,
  habitBestStreak: 0,
  pomodoroSessions: 0,
  balance: 0,
  loaded: false,
};

// Baca semua data dari AsyncStorage dan derive statistik untuk dashboard.
// Auto-refresh setiap user kembali ke screen pemanggil (via useFocusEffect).
export function useDashboardStats() {
  const [stats, setStats] = useState<Stats>(INITIAL);

  const refresh = useCallback(async () => {
    try {
      const [todosRaw, habitsRaw, sessionsRaw, txnsRaw] = await Promise.all([
        AsyncStorage.getItem('@app/todos'),
        AsyncStorage.getItem('@app/habits'),
        AsyncStorage.getItem('@app/pomodoro-sessions'),
        AsyncStorage.getItem('@app/transactions'),
      ]);

      const todos: { done: boolean }[] = todosRaw ? JSON.parse(todosRaw) : [];
      const habits: { days: boolean[] }[] = habitsRaw ? JSON.parse(habitsRaw) : [];
      const sessions: number = sessionsRaw ? JSON.parse(sessionsRaw) : 0;
      const txns: { type: 'income' | 'expense'; amount: number }[] = txnsRaw
        ? JSON.parse(txnsRaw)
        : [];

      const todoCount = todos.filter((t) => !t.done).length;
      const todoTotal = todos.length;

      const habitDone = habits.reduce((sum, h) => sum + h.days.filter(Boolean).length, 0);
      const habitTotal = habits.length * 7;
      const habitPercent = habitTotal > 0 ? (habitDone / habitTotal) * 100 : 0;
      const habitBestStreak = habits.reduce(
        (max, h) => Math.max(max, calcStreak(h.days)),
        0
      );

      const balance = txns.reduce(
        (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
        0
      );

      setStats({
        todoCount,
        todoTotal,
        habitPercent,
        habitBestStreak,
        pomodoroSessions: sessions,
        balance,
        loaded: true,
      });
    } catch {
      setStats((s) => ({ ...s, loaded: true }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { ...stats, refresh };
}
