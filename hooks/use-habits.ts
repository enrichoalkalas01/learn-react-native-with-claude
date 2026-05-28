import { useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';
import { calcStreak } from '@/lib/format';

export { calcStreak };

export type Habit = {
  id: string;
  name: string;
  days: boolean[];
};

const SEED: Habit[] = [
  {
    id: '1',
    name: 'Olahraga 30 menit',
    days: [true, true, false, true, false, false, false],
  },
  { id: '2', name: 'Baca buku', days: [true, false, true, true, true, false, false] },
  {
    id: '3',
    name: 'Minum 8 gelas air',
    days: [true, true, true, true, true, true, false],
  },
];

export function useHabits() {
  const [habits, setHabits] = useStoredState<Habit[]>('@app/habits', SEED);
  const [input, setInput] = useState('');

  const totalCompleted = habits.reduce(
    (sum, h) => sum + h.days.filter(Boolean).length,
    0
  );
  const totalPossible = habits.length * 7;
  const percent = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

  const addHabit = () => {
    const name = input.trim();
    if (!name) return;
    setHabits((prev) => [
      {
        id: String(Date.now()),
        name,
        days: [false, false, false, false, false, false, false],
      },
      ...prev,
    ]);
    setInput('');
  };

  const toggleDay = (habitId: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, days: h.days.map((d, i) => (i === dayIndex ? !d : d)) }
          : h
      )
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return {
    habits,
    input,
    totalCompleted,
    totalPossible,
    percent,
    setInput,
    addHabit,
    toggleDay,
    deleteHabit,
  };
}
