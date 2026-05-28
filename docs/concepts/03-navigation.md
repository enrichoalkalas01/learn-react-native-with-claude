# Konsep 03 — Navigasi dengan Expo Router

## Apa itu Expo Router?

Expo Router adalah sistem navigasi berbasis file untuk React Native.
Konsepnya mirip **Next.js App Router** — lokasi file menentukan URL/route-nya.

---

## File-Based Routing

```
app/
├── _layout.tsx          → layout root, URL: (tidak ada)
├── index.tsx            → URL: /
├── about.tsx            → URL: /about
├── modal.tsx            → URL: /modal
└── (tabs)/              → route group (nama folder tidak masuk URL)
    ├── _layout.tsx      → layout untuk tab group
    ├── index.tsx        → URL: /
    └── explore.tsx      → URL: /explore
```

### Konvensi Penamaan

| Pola             | Arti                                 |
| ---------------- | ------------------------------------ |
| `_layout.tsx`    | Layout wrapper, bukan screen sendiri |
| `(folder)/`      | Route group — tidak memengaruhi URL  |
| `[param].tsx`    | Dynamic route — misal: `/user/123`   |
| `[...rest].tsx`  | Catch-all route                      |
| `+not-found.tsx` | 404 screen                           |

---

## Struktur Layout di Project Ini

### Flow Navigasi

```
app/_layout.tsx  (RootLayout - Stack Navigator)
│
├── app/(tabs)/_layout.tsx  (TabLayout - Tab Navigator)
│   ├── app/(tabs)/index.tsx     → Tab "Home"
│   └── app/(tabs)/explore.tsx   → Tab "Explore"
│
└── app/modal.tsx                → Modal screen
```

### `app/_layout.tsx` — Root Layout

```tsx
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Semua tab tersembunyi di bawah satu screen "(tabs)" */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Modal tampil di atas dengan animasi naik dari bawah */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

### `app/(tabs)/_layout.tsx` — Tab Layout

```tsx
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab, // custom button dengan haptic feedback
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## Cara Navigasi Antar Screen

### 1. Menggunakan `<Link>` Component

```tsx
import { Link } from 'expo-router';

// Navigasi biasa
<Link href="/about">Ke halaman About</Link>

// Navigasi dengan replace (tidak bisa back)
<Link href="/home" replace>Go Home</Link>

// Navigasi ke modal
<Link href="/modal">Buka Modal</Link>

// Bungkus komponen lain
<Link href="/profile" asChild>
  <TouchableOpacity>
    <Text>Profile</Text>
  </TouchableOpacity>
</Link>
```

### 2. Menggunakan `useRouter()` Hook (programmatic)

```tsx
import { useRouter } from 'expo-router';

export default function MyScreen() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/detail')}>
      <Text>Buka Detail</Text>
    </TouchableOpacity>
  );
}
```

**Method router yang tersedia:**
| Method | Fungsi |
|--------|--------|
| `router.push('/path')` | Navigasi maju (bisa back) |
| `router.replace('/path')` | Ganti screen saat ini (tidak bisa back) |
| `router.back()` | Kembali ke screen sebelumnya |
| `router.dismiss()` | Tutup modal/stack |

### 3. Dynamic Route dengan Parameter

```tsx
// File: app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  return <Text>User ID: {id}</Text>;
}

// Cara navigasi ke sana:
<Link href="/user/123">Lihat User</Link>;
// atau
router.push('/user/123');
// atau dengan object
router.push({ pathname: '/user/[id]', params: { id: '123' } });
```

---

## Perbedaan Stack vs Tab vs Modal

| Tipe  | Animasi          | Back Button     | Kapan Dipakai                  |
| ----- | ---------------- | --------------- | ------------------------------ |
| Stack | Slide horizontal | Ya              | Flow linear (A → B → C)        |
| Tab   | Tidak ada        | Tidak           | Navigasi utama setara          |
| Modal | Slide dari bawah | Ya (swipe down) | Dialog, form, detail sementara |
