import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useTodos, type TodoFilter } from '@/hooks/use-todos';

const FILTERS: { key: TodoFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Selesai' },
];

export default function TodoScreen() {
  const t = useTodos();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Todo List
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {t.remaining} task tersisa
          </Text>
        </View>

        <View className="flex-row gap-2">
          <TextInput
            value={t.input}
            onChangeText={t.setInput}
            onSubmitEditing={t.addTodo}
            placeholder="Tambah task baru..."
            placeholderTextColor="#9ca3af"
            returnKeyType="done"
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
          />
          <Pressable
            onPress={t.addTodo}
            className="bg-primary px-5 rounded-xl items-center justify-center active:opacity-70">
            <Text className="text-white font-semibold">Tambah</Text>
          </Pressable>
        </View>

        <View className="flex-row bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          {FILTERS.map((f) => {
            const isActive = t.filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => t.setFilter(f.key)}
                className={`flex-1 py-2 rounded-lg ${isActive ? 'bg-primary' : ''}`}>
                <Text
                  className={`text-center text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {t.filtered.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-8 items-center border border-dashed border-gray-200 dark:border-gray-700">
            <Text className="text-4xl mb-2">🗒️</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              {t.filter === 'completed'
                ? 'Belum ada task yang selesai'
                : t.filter === 'active'
                  ? 'Tidak ada task aktif'
                  : 'List kosong, tambahkan task pertama!'}
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {t.filtered.map((todo) => (
              <Animated.View
                key={todo.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                layout={LinearTransition.duration(200)}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 flex-row items-center gap-3 border border-gray-100 dark:border-gray-700">
                <Pressable
                  onPress={() => t.toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-md items-center justify-center border-2 ${
                    todo.done
                      ? 'bg-primary border-primary'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                  {todo.done && <Text className="text-white text-xs font-bold">✓</Text>}
                </Pressable>

                <Pressable onPress={() => t.toggleTodo(todo.id)} className="flex-1">
                  <Text
                    className={`text-base ${
                      todo.done
                        ? 'text-gray-400 dark:text-gray-500 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                    {todo.text}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => t.deleteTodo(todo.id)}
                  className="w-8 h-8 items-center justify-center rounded-lg active:bg-red-50 dark:active:bg-red-900/30">
                  <Text className="text-red-500 text-lg">×</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}

        {t.hasCompleted && (
          <Pressable
            onPress={t.clearCompleted}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 items-center active:bg-gray-100 dark:active:bg-gray-800">
            <Text className="text-gray-600 dark:text-gray-300 font-medium">
              Hapus task yang selesai
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
