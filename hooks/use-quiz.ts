import { useState } from 'react';

export type Question = {
  q: string;
  options: string[];
  correct: number;
  explain: string;
};

export type QuizStatus = 'idle' | 'answered' | 'finished';

export const QUESTIONS: Question[] = [
  {
    q: 'Komponen mana yang setara dengan <div> di web?',
    options: ['Text', 'View', 'Container', 'Box'],
    correct: 1,
    explain: 'View adalah container utama di React Native, mirip <div> di HTML.',
  },
  {
    q: 'Semua teks di React Native HARUS dibungkus dengan komponen apa?',
    options: ['<p>', 'TextView', 'Text', 'Label'],
    correct: 2,
    explain: 'Berbeda dengan web, di React Native semua string wajib di dalam <Text>.',
  },
  {
    q: 'Untuk navigasi programatik dengan Expo Router, kita pakai apa?',
    options: ['useNavigation()', 'router.push()', 'history.push()', 'navigate()'],
    correct: 1,
    explain:
      'Expo Router menyediakan object router dengan method push, replace, back, dst.',
  },
  {
    q: 'File konvensi untuk dynamic route di Expo Router adalah?',
    options: ['posts/$id.tsx', 'posts/{id}.tsx', 'posts/[id].tsx', 'posts/:id.tsx'],
    correct: 2,
    explain: 'Expo Router memakai bracket notation: [id].tsx untuk parameter dinamis.',
  },
  {
    q: 'Hook untuk mendeteksi dark/light mode dari OS adalah?',
    options: ['useTheme()', 'useColorScheme()', 'useDarkMode()', 'usePlatform()'],
    correct: 1,
    explain: 'useColorScheme() return "light" | "dark" sesuai setting OS.',
  },
  {
    q: 'NativeWind mengubah className menjadi apa di runtime?',
    options: ['CSS file', 'Inline style', 'StyleSheet React Native', 'Web view'],
    correct: 2,
    explain: 'NativeWind compile Tailwind classes ke StyleSheet RN saat build/runtime.',
  },
  {
    q: 'Reanimated menjalankan animasi di thread mana?',
    options: ['JS thread', 'UI thread (native)', 'Worker thread', 'Background thread'],
    correct: 1,
    explain: 'Reanimated jalan di UI thread (native) supaya tetap 60fps meski JS sibuk.',
  },
];

export function useQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');

  const total = QUESTIONS.length;
  const current = QUESTIONS[index];
  const percent = Math.round(((index + 1) / total) * 100);
  const finalPercent = Math.round((score / total) * 100);

  const pickAnswer = (optionIdx: number) => {
    if (status !== 'idle') return;
    setSelected(optionIdx);
    setStatus('answered');
    if (optionIdx === current.correct) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setStatus('idle');
    } else {
      setStatus('finished');
    }
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setStatus('idle');
  };

  return {
    index,
    score,
    selected,
    status,
    total,
    current,
    percent,
    finalPercent,
    pickAnswer,
    next,
    restart,
  };
}
