import { useEffect, useRef, useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';
import { formatTime } from '@/lib/format';

export { formatTime };

export type PomodoroMode = 'focus' | 'break';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  focus: FOCUS_SECONDS,
  break: BREAK_SECONDS,
};

export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useStoredState<number>(
    '@app/pomodoro-sessions',
    0
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Auto switch mode + tambah session count kalau focus selesai
          if (mode === 'focus') {
            setCompletedSessions((c) => c + 1);
            setMode('break');
            setIsRunning(false);
            return BREAK_SECONDS;
          } else {
            setMode('focus');
            setIsRunning(false);
            return FOCUS_SECONDS;
          }
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, setCompletedSessions]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(POMODORO_DURATIONS[mode]);
  };
  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(POMODORO_DURATIONS[newMode]);
  };
  const resetSessions = () => setCompletedSessions(0);

  const total = POMODORO_DURATIONS[mode];
  const progress = ((total - secondsLeft) / total) * 100;

  return {
    mode,
    secondsLeft,
    isRunning,
    completedSessions,
    progress,
    formattedTime: formatTime(secondsLeft),
    start,
    pause,
    reset,
    switchMode,
    resetSessions,
  };
}
