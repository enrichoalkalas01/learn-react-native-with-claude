import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

// Data dummy untuk demo — nanti bisa diganti dengan fetch dari API
export const POSTS_DATA = [
  {
    id: '1',
    title: 'Belajar React Native',
    category: 'Tutorial',
    readTime: '5 min',
    excerpt: 'Panduan lengkap memulai React Native dari nol hingga membuat app pertama.',
  },
  {
    id: '2',
    title: 'Expo Router: File-Based Routing',
    category: 'Navigation',
    readTime: '4 min',
    excerpt: 'Cara kerja Expo Router dan bagaimana file menentukan route di app kamu.',
  },
  {
    id: '3',
    title: 'Styling dengan NativeWind',
    category: 'Styling',
    readTime: '6 min',
    excerpt:
      'Gunakan Tailwind CSS di React Native dengan NativeWind untuk styling yang cepat.',
  },
  {
    id: '4',
    title: 'Animasi dengan Reanimated 4',
    category: 'Animation',
    readTime: '8 min',
    excerpt:
      'Buat animasi smooth 60fps dengan React Native Reanimated dan shared values.',
  },
  {
    id: '5',
    title: 'Dark Mode & Theming',
    category: 'UI/UX',
    readTime: '3 min',
    excerpt: 'Implementasi light/dark mode yang proper menggunakan useColorScheme hook.',
  },
];

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  Tutorial: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-900',
    darkText: 'dark:text-blue-300',
  },
  Navigation: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    darkBg: 'dark:bg-purple-900',
    darkText: 'dark:text-purple-300',
  },
  Styling: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    darkBg: 'dark:bg-pink-900',
    darkText: 'dark:text-pink-300',
  },
  Animation: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    darkBg: 'dark:bg-orange-900',
    darkText: 'dark:text-orange-300',
  },
  'UI/UX': {
    bg: 'bg-green-100',
    text: 'text-green-700',
    darkBg: 'dark:bg-green-900',
    darkText: 'dark:text-green-300',
  },
};

export default function PostsScreen() {
  return (
    // className adalah NativeWind — setara dengan StyleSheet tapi pakai Tailwind utility classes
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-3">
        {/* Header section */}
        <View className="mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Artikel Belajar
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {POSTS_DATA.length} artikel tersedia
          </Text>
        </View>

        {/* List kartu post */}
        {POSTS_DATA.map((post) => {
          const color = CATEGORY_COLORS[post.category];
          return (
            <Pressable
              key={post.id}
              // android_ripple untuk efek ripple di Android
              android_ripple={{ color: '#00000010' }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
              onPress={() => router.push(`/posts/${post.id}` as never)}>
              {/* Baris atas: badge kategori + waktu baca */}
              <View className="flex-row justify-between items-center mb-3">
                <View className={`px-3 py-1 rounded-full ${color.bg} ${color.darkBg}`}>
                  <Text
                    className={`text-xs font-semibold ${color.text} ${color.darkText}`}>
                    {post.category}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  ⏱ {post.readTime}
                </Text>
              </View>

              {/* Judul */}
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {post.title}
              </Text>

              {/* Excerpt */}
              <Text
                className="text-sm text-gray-500 dark:text-gray-400 leading-5"
                numberOfLines={2}>
                {post.excerpt}
              </Text>

              {/* Footer kartu */}
              <View className="flex-row items-center justify-end mt-3">
                <Text className="text-xs font-medium text-primary">
                  Baca selengkapnya →
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
