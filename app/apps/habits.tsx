import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { calcStreak, useHabits } from '@/hooks/use-habits';

const DAY_LABELS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

export default function HabitsScreen() {
  const h = useHabits();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Habit Tracker
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {h.totalCompleted}/{h.totalPossible} centang minggu ini
          </Text>
        </View>

        {h.totalPossible > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress mingguan
              </Text>
              <Text className="text-sm font-semibold text-primary">
                {Math.round(h.percent)}%
              </Text>
            </View>
            <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${h.percent}%` }}
              />
            </View>
          </View>
        )}

        <View className="flex-row gap-2">
          <TextInput
            value={h.input}
            onChangeText={h.setInput}
            onSubmitEditing={h.addHabit}
            placeholder="Habit baru..."
            placeholderTextColor="#9ca3af"
            returnKeyType="done"
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
          />
          <Pressable
            onPress={h.addHabit}
            className="bg-primary px-5 rounded-xl items-center justify-center active:opacity-70">
            <Text className="text-white font-semibold">Tambah</Text>
          </Pressable>
        </View>

        {h.habits.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-8 items-center border border-dashed border-gray-200 dark:border-gray-700">
            <Text className="text-4xl mb-2">🌱</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              Belum ada habit. Mulai dengan menambah satu di atas.
            </Text>
          </View>
        ) : (
          h.habits.map((habit) => {
            const streak = calcStreak(habit.days);
            const completed = habit.days.filter(Boolean).length;
            return (
              <Animated.View
                key={habit.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                layout={LinearTransition.duration(200)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                      {habit.name}
                    </Text>
                    <View className="flex-row gap-3 mt-1">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        🔥 Streak: {streak} hari
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        ✅ {completed}/7
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => h.deleteHabit(habit.id)}
                    className="w-8 h-8 items-center justify-center rounded-lg active:bg-red-50 dark:active:bg-red-900/30">
                    <Text className="text-red-500 text-lg">×</Text>
                  </Pressable>
                </View>

                <View className="flex-row justify-between gap-1">
                  {habit.days.map((done, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => h.toggleDay(habit.id, idx)}
                      className={`flex-1 aspect-square rounded-lg items-center justify-center border ${
                        done
                          ? 'bg-primary border-primary'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                      }`}>
                      <Text
                        className={`text-xs font-semibold ${
                          done ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                        {DAY_LABELS[idx]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
