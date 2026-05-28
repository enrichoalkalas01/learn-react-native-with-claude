import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useQuiz } from '@/hooks/use-quiz';
import { haptic } from '@/lib/haptic';
import { useConfetti } from '@/context/confetti-context';

export default function QuizScreen() {
  const q = useQuiz();
  const confetti = useConfetti();

  // Haptic saat user pilih jawaban
  const lastSelected = useRef<number | null>(null);
  useEffect(() => {
    if (q.selected !== null && q.selected !== lastSelected.current) {
      lastSelected.current = q.selected;
      if (q.selected === q.current.correct) {
        haptic.success();
      } else {
        haptic.error();
      }
    }
    if (q.selected === null) lastSelected.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.selected, q.current.correct]);

  // Confetti saat selesai dengan score sempurna
  const firedRef = useRef(false);
  useEffect(() => {
    if (q.status === 'finished' && q.finalPercent === 100 && !firedRef.current) {
      firedRef.current = true;
      confetti.fire();
    }
    if (q.status !== 'finished') firedRef.current = false;
  }, [q.status, q.finalPercent, confetti]);

  if (q.status === 'finished') {
    const emoji = q.finalPercent >= 80 ? '🏆' : q.finalPercent >= 50 ? '🎉' : '📚';
    const message =
      q.finalPercent >= 80
        ? 'Mantap! Penguasaan kamu sudah baik.'
        : q.finalPercent >= 50
          ? 'Lumayan! Ada beberapa konsep yang masih bisa diperdalam.'
          : 'Jangan menyerah, baca lagi materinya ya.';

    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center p-6">
        <Text className="text-7xl mb-4">{emoji}</Text>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Selesai!
        </Text>
        <Text className="text-5xl font-bold text-primary mb-1">
          {q.score}/{q.total}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-1">
          ({q.finalPercent}% benar)
        </Text>
        <Text className="text-gray-600 dark:text-gray-300 text-center mt-4 mb-8">
          {message}
        </Text>

        <Pressable
          onPress={q.restart}
          className="bg-primary px-8 py-3 rounded-full active:opacity-70">
          <Text className="text-white font-bold text-base">Ulang Quiz</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-4">
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Soal {q.index + 1} dari {q.total}
            </Text>
            <Text className="text-sm font-semibold text-primary">Score: {q.score}</Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${q.percent}%` }}
            />
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <Text className="text-base font-bold text-gray-900 dark:text-white leading-6">
            {q.current.q}
          </Text>
        </View>

        <View className="gap-2">
          {q.current.options.map((opt, i) => {
            const isSelected = q.selected === i;
            const isCorrect = i === q.current.correct;
            const isAnswered = q.status === 'answered';

            let optionClass =
              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
            let textClass = 'text-gray-900 dark:text-white';

            if (isAnswered) {
              if (isCorrect) {
                optionClass = 'bg-green-50 dark:bg-green-900/30 border-green-500';
                textClass = 'text-green-700 dark:text-green-300 font-semibold';
              } else if (isSelected) {
                optionClass = 'bg-red-50 dark:bg-red-900/30 border-red-500';
                textClass = 'text-red-700 dark:text-red-300';
              } else {
                optionClass =
                  'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50';
              }
            }

            return (
              <Pressable
                key={i}
                onPress={() => q.pickAnswer(i)}
                disabled={isAnswered}
                className={`rounded-xl p-4 border-2 ${optionClass}`}>
                <View className="flex-row items-center gap-3">
                  <View className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
                    <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text className={`flex-1 ${textClass}`}>{opt}</Text>
                  {isAnswered && isCorrect && (
                    <Text className="text-green-500 text-lg">✓</Text>
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <Text className="text-red-500 text-lg">×</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {q.status === 'answered' && (
          <View className="gap-3">
            <View
              className={`rounded-xl p-4 border ${
                q.selected === q.current.correct
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
              <Text
                className={`text-sm font-semibold mb-1 ${
                  q.selected === q.current.correct
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-amber-700 dark:text-amber-300'
                }`}>
                {q.selected === q.current.correct ? '✓ Benar!' : '✗ Kurang tepat'}
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-5">
                {q.current.explain}
              </Text>
            </View>

            <Pressable
              onPress={q.next}
              className="bg-primary rounded-xl p-4 items-center active:opacity-70">
              <Text className="text-white font-bold text-base">
                {q.index < q.total - 1 ? 'Lanjut →' : 'Lihat Hasil'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
