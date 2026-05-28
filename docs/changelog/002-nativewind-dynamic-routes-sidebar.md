# Changelog 002 — NativeWind + Dynamic Routes + Sidebar Menu

**Tanggal:** 2026-04-16
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Menambahkan tiga fitur besar sekaligus:

1. **NativeWind** — Tailwind CSS untuk React Native
2. **Dynamic Routes** — Halaman dengan parameter URL (`/posts/1`, `/posts/2`, dst.)
3. **Sidebar Menu** — Panel menu yang slide dari kiri dengan animasi
4. **Footer Menu (Tab baru)** — Tab "Posts" ditambahkan ke tab bar

---

## File yang Dibuat / Diubah

### File Baru

| File                              | Fungsi                                            |
| --------------------------------- | ------------------------------------------------- |
| `babel.config.js`                 | Config Babel — NativeWind jsxImportSource         |
| `metro.config.js`                 | Config Metro bundler — wrap dengan withNativeWind |
| `tailwind.config.js`              | Config Tailwind — content paths, preset, tema     |
| `global.css`                      | Entry point CSS Tailwind (`@tailwind` directives) |
| `nativewind-env.d.ts`             | TypeScript type declaration untuk className prop  |
| `context/sidebar-context.tsx`     | Context API untuk state sidebar (open/close)      |
| `components/sidebar.tsx`          | Komponen sidebar dengan animasi Reanimated        |
| `components/hamburger-button.tsx` | Tombol hamburger ☰ untuk buka sidebar            |
| `app/(tabs)/posts.tsx`            | Tab Posts — list artikel dengan NativeWind        |
| `app/posts/[id].tsx`              | Dynamic route — detail artikel berdasarkan ID     |

### File Diubah

| File                     | Perubahan                                                 |
| ------------------------ | --------------------------------------------------------- |
| `app/_layout.tsx`        | Import global.css, tambah SidebarProvider + Sidebar       |
| `app/(tabs)/_layout.tsx` | Aktifkan header, tambah HamburgerButton, tambah tab Posts |

---

## Flow 1: NativeWind

### Cara Kerja

```
Kamu tulis className="flex-1 bg-white p-4"
    ↓
Metro bundler (withNativeWind) memproses global.css
    ↓
Babel plugin (jsxImportSource: 'nativewind') transformasi JSX
    ↓
NativeWind kompilasi class → StyleSheet React Native
    ↓
Komponen render dengan style yang sudah dikonversi
```

### File Konfigurasi

**`babel.config.js`** — Memberitahu Babel untuk proses className:

```js
presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]];
```

**`metro.config.js`** — Memberitahu Metro untuk proses CSS:

```js
module.exports = withNativeWind(config, { input: './global.css' });
```

**`tailwind.config.js`** — Tentukan file mana yang di-scan untuk class:

```js
content: ['./app/**/*.tsx', './components/**/*.tsx'];
presets: [require('nativewind/preset')];
```

**`global.css`** — Entry CSS yang di-import di root layout:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`nativewind-env.d.ts`** — Supaya TypeScript tidak error saat pakai `className`:

```ts
/// <reference types="nativewind/types" />
```

### Cara Pakai

```tsx
// Sebelum (StyleSheet)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
});
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

// Sesudah (NativeWind)
<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold text-gray-800">Hello</Text>
</View>

// Dark mode otomatis
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Auto dark!</Text>
</View>
```

---

## Flow 2: Dynamic Routes

### Konsep

Dynamic route = halaman yang URL-nya berubah-ubah berdasarkan data.

Contoh: `/posts/1`, `/posts/2`, `/posts/abc` — semuanya ditangani satu file.

### Cara Kerja

```
File: app/posts/[id].tsx

URL: /posts/1  → id = '1'
URL: /posts/42 → id = '42'
URL: /posts/abc → id = 'abc'
```

### Struktur File

```
app/
├── (tabs)/
│   └── posts.tsx        ← List semua post (TAB, URL: /posts)
└── posts/
    └── [id].tsx         ← Detail satu post (STACK, URL: /posts/1)
```

**Catatan penting:** `(tabs)/posts.tsx` dan `posts/[id].tsx` adalah dua route berbeda:

- `(tabs)/posts.tsx` → URL: `/posts` (ada di tab bar)
- `posts/[id].tsx` → URL: `/posts/1` (Stack screen, ada tombol back)

### Cara Navigasi ke Dynamic Route

```tsx
// Dari list → detail
import { router } from 'expo-router';

// Cara 1: string langsung
router.push(`/posts/${post.id}`);

// Cara 2: object (lebih type-safe dengan typedRoutes)
router.push({ pathname: '/posts/[id]', params: { id: post.id } });

// Cara 3: Link component
<Link href={`/posts/${post.id}`}>Buka Post</Link>;
```

### Cara Ambil Parameter di Screen Tujuan

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function PostDetailScreen() {
  // Ambil parameter dari URL
  const { id } = useLocalSearchParams<{ id: string }>();

  // Sekarang id berisi nilai dari URL
  // Kalau URL /posts/3, maka id = '3'
  console.log(id); // '3'

  // Fetch data berdasarkan id
  const post = getPostById(id);
}
```

---

## Flow 3: Sidebar Menu

### Arsitektur

Sidebar menggunakan **Context API** + **Reanimated** untuk:

- Context API = state management (open/close) yang bisa diakses dari mana saja
- Reanimated = animasi smooth di UI thread

### Flow Data

```
User tekan ☰ (HamburgerButton)
    ↓
toggle() dari useSidebar() dipanggil
    ↓
SidebarContext: isOpen → true
    ↓
Sidebar component mendeteksi isOpen berubah (useEffect)
    ↓
Reanimated: translateX.value = withTiming(0)  ← panel geser masuk
    ↓
Backdrop muncul (opacity 0 → 0.5)

User tekan backdrop / tombol ✕ / pilih menu
    ↓
close() dipanggil
    ↓
Reanimated: translateX.value = withTiming(-280) ← panel geser keluar
    ↓
Setelah animasi selesai (callback): backdropActive = false
```

### Struktur Komponen

```
app/_layout.tsx
└── SidebarProvider          ← menyimpan state isOpen
    └── View (flex: 1)
        ├── Stack             ← semua screen
        └── Sidebar           ← overlay di atas Stack
            ├── Backdrop      ← hitam semi-transparan, klik untuk tutup
            └── Panel         ← panel putih yang slide dari kiri
                ├── Header    ← judul "Menu" + tombol ✕
                ├── MenuList  ← daftar item navigasi
                └── Footer    ← info versi
```

### Kode Kunci — Animasi Sidebar

```tsx
// Shared value = posisi panel secara horizontal
const translateX = useSharedValue(-SIDEBAR_WIDTH); // mulai dari luar layar (kiri)

useEffect(() => {
  if (isOpen) {
    // Panel masuk → geser ke posisi 0 (kiri layar)
    translateX.value = withTiming(0, { duration: 280 });
  } else {
    // Panel keluar → geser keluar layar lagi
    translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 280 }, (finished) => {
      // Setelah animasi selesai, nonaktifkan backdrop
      // runOnJS diperlukan karena callback ini jalan di UI thread
      if (finished) runOnJS(setBackdropActive)(false);
    });
  }
}, [isOpen]);

// Backdrop opacity ikut posisi panel (interpolate)
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(
    translateX.value,
    [-SIDEBAR_WIDTH, 0], // input: posisi panel
    [0, 0.5] // output: opacity backdrop
  ),
}));
```

### Kenapa `runOnJS`?

Reanimated menjalankan callback animasi di **UI thread** (bukan JS thread).
Tapi `setBackdropActive` adalah React state setter yang harus jalan di **JS thread**.

`runOnJS(setBackdropActive)(false)` = "panggil fungsi ini di JS thread dari UI thread"

---

## Footer Menu (Tab Bar)

### Tab yang Ditambahkan

| Tab                | File                 | Icon              |
| ------------------ | -------------------- | ----------------- |
| Home               | `(tabs)/index.tsx`   | `house.fill`      |
| Explore            | `(tabs)/explore.tsx` | `paperplane.fill` |
| **Posts** _(baru)_ | `(tabs)/posts.tsx`   | `doc.text.fill`   |

### Header di Tab

Header diaktifkan (`headerShown: true`) agar bisa menampilkan hamburger button:

```tsx
screenOptions={{
  headerShown: true,
  headerLeft: () => <HamburgerButton />,
}}
```

`headerLeft` menerima function yang return React element.
`HamburgerButton` adalah komponen terpisah agar bisa menggunakan hook `useSidebar()`.

---

## Dependensi yang Ditambahkan

```json
{
  "nativewind": "^4.2.3",
  "tailwindcss": "^3.4.19"
}
```
