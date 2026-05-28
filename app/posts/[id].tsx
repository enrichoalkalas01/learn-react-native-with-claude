import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { POSTS_DATA } from '@/app/(tabs)/posts';

// Data lengkap per post — diakses berdasarkan id dari URL
const POST_CONTENT: Record<string, string> = {
  '1': `React Native adalah framework open-source dari Meta yang memungkinkan kamu membangun aplikasi mobile native menggunakan JavaScript dan React.

Tidak seperti hybrid app (WebView), React Native menggunakan komponen native sungguhan — artinya performa mendekati app yang ditulis dengan Swift (iOS) atau Kotlin (Android).

**Kenapa belajar React Native?**

• Satu codebase untuk iOS dan Android
• Komunitas besar dan ekosistem library yang kaya
• Reuse skill JavaScript/React yang sudah kamu punya
• Hot reload untuk development yang cepat

**Komponen dasar yang perlu dipelajari:**

View — container utama (seperti div di web)
Text — semua teks WAJIB di dalam Text
Image — gambar lokal atau dari URL
ScrollView — area scroll
Pressable — tombol / area yang bisa ditekan`,

  '2': `Expo Router menggunakan pendekatan file-based routing — lokasi file di dalam folder app/ menentukan URL dan navigasi.

**Konvensi file:**

app/index.tsx → route "/"
app/about.tsx → route "/about"
app/(tabs)/home.tsx → route "/home" (dalam tab group)
app/user/[id].tsx → route "/user/123" (dynamic route)

**Cara navigasi:**

Gunakan komponen Link untuk navigasi deklaratif, atau useRouter() hook untuk navigasi programatik dari dalam event handler.

**Route Groups:**

Folder dengan tanda kurung (tabs) tidak memengaruhi URL — berguna untuk mengelompokkan screen yang berbagi layout yang sama.`,

  '3': `NativeWind membawa Tailwind CSS ke React Native. Kamu bisa pakai utility classes seperti className="flex-1 bg-white p-4" langsung di komponen React Native.

**Cara kerja:**

NativeWind mengompilasi Tailwind classes menjadi StyleSheet React Native saat build time. Hasilnya performa sama dengan StyleSheet biasa.

**Contoh perbandingan:**

Sebelum (StyleSheet):
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 }
})
<View style={styles.container} />

Sesudah (NativeWind):
<View className="flex-1 bg-white p-4" />

**Dark mode:**

Gunakan prefix dark: untuk styling dark mode:
className="bg-white dark:bg-gray-900 text-black dark:text-white"`,

  '4': `Reanimated menjalankan animasi di UI thread (native), bukan JS thread. Ini membuat animasi tetap smooth 60fps meski JavaScript sedang sibuk.

**Konsep utama:**

useSharedValue() — nilai yang bisa diakses dari JS dan UI thread
useAnimatedStyle() — style yang reaktif terhadap shared value
withTiming() — animasi linear/ease dalam durasi tertentu
withSpring() — animasi spring yang memantul

**Contoh fade in:**

const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withTiming(1, { duration: 400 });
}, []);

const style = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

return <Animated.View style={style} />;`,

  '5': `React Native secara otomatis mendeteksi setting light/dark mode dari sistem operasi device menggunakan useColorScheme() hook.

**Cara implementasi:**

const colorScheme = useColorScheme(); // 'light' | 'dark'

Lalu gunakan colorScheme untuk memilih warna yang tepat:

const bgColor = colorScheme === 'dark' ? '#000' : '#fff';

**Dengan NativeWind:**

Gunakan dark: prefix — otomatis mengikuti mode device:
className="bg-white dark:bg-gray-900"

**Dengan ThemeProvider:**

Di root _layout.tsx, wrap app dengan ThemeProvider dari @react-navigation/native agar semua komponen navigasi juga mengikuti mode.`,
};

export default function PostDetailScreen() {
  // useLocalSearchParams mengambil parameter dari URL
  // Kalau URL-nya /posts/3, maka id = '3'
  const { id } = useLocalSearchParams<{ id: string }>();

  const post = POSTS_DATA.find((p) => p.id === id);
  const content = POST_CONTENT[id ?? ''];

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-8">
        <Text className="text-5xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Post tidak ditemukan
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Post dengan ID &quot;{id}&quot; tidak ada.
        </Text>
        <Pressable
          className="bg-primary px-6 py-3 rounded-full"
          onPress={() => router.back()}>
          <Text className="text-white font-semibold">Kembali ke Posts</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Hero section */}
      <View className="bg-gray-50 dark:bg-gray-800 px-6 py-8 border-b border-gray-100 dark:border-gray-700">
        {/* Badge kategori */}
        <View className="self-start bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full mb-4">
          <Text className="text-primary text-sm font-semibold">{post.category}</Text>
        </View>

        {/* Judul */}
        <Text className="text-2xl font-bold text-gray-900 dark:text-white leading-8 mb-3">
          {post.title}
        </Text>

        {/* Meta info */}
        <View className="flex-row items-center gap-4">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            ⏱ {post.readTime}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">📖 Artikel</Text>
        </View>
      </View>

      {/* Konten artikel */}
      <View className="px-6 py-6">
        {/* Ringkasan / excerpt */}
        <View className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-primary rounded-r-lg p-4 mb-6">
          <Text className="text-blue-800 dark:text-blue-200 text-sm leading-5 italic">
            {post.excerpt}
          </Text>
        </View>

        {/* Body teks — whitespace dipertahankan untuk demo */}
        <Text className="text-gray-700 dark:text-gray-300 text-base leading-7">
          {content}
        </Text>

        {/* Tombol back di bagian bawah */}
        <Pressable
          className="mt-10 mb-6 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex-row items-center justify-center gap-2"
          onPress={() => router.back()}>
          <Text className="text-gray-600 dark:text-gray-300 font-medium">
            ← Kembali ke Posts
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
