# Konsep 01 — Komponen Dasar React Native

## Apa itu Komponen?

Komponen adalah **blok pembangun UI** di React Native. Mirip seperti HTML element di web,
tapi React Native punya komponen sendiri yang di-render ke native UI (bukan HTML).

---

## Perbandingan Web vs React Native

| Web (HTML)      | React Native                         | Keterangan                     |
| --------------- | ------------------------------------ | ------------------------------ |
| `<div>`         | `<View>`                             | Container/wrapper              |
| `<p>`, `<span>` | `<Text>`                             | Teks — WAJIB di dalam `<Text>` |
| `<img>`         | `<Image>`                            | Gambar lokal/remote            |
| `<input>`       | `<TextInput>`                        | Input field                    |
| `<button>`      | `<TouchableOpacity>` / `<Pressable>` | Tombol                         |
| `<ul>`, `<li>`  | `<FlatList>`                         | List data                      |
| `<a>`           | `<Link>` (Expo Router)               | Navigasi                       |

---

## Komponen di Project Ini

### `ThemedText` — `components/themed-text.tsx`

Text yang otomatis menyesuaikan warna dengan light/dark mode.

**Props:**

```tsx
type ThemedTextProps = TextProps & {
  lightColor?: string; // warna override untuk light mode
  darkColor?: string; // warna override untuk dark mode
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};
```

**Cara pakai:**

```tsx
<ThemedText>Teks biasa</ThemedText>
<ThemedText type="title">Judul Besar</ThemedText>
<ThemedText type="subtitle">Sub Judul</ThemedText>
<ThemedText type="defaultSemiBold">Teks Tebal</ThemedText>
<ThemedText type="link">Teks Link</ThemedText>

// Override warna manual
<ThemedText lightColor="red" darkColor="pink">Teks Merah</ThemedText>
```

**Style yang diterapkan per type:**
| type | fontSize | fontWeight | lineHeight |
|------|----------|------------|------------|
| `default` | 16 | normal | 24 |
| `defaultSemiBold` | 16 | 600 | 24 |
| `title` | 32 | bold | 32 |
| `subtitle` | 20 | bold | - |
| `link` | 16 | normal | 30 |

---

### `ThemedView` — `components/themed-view.tsx`

View biasa tapi warna backgroundnya ikut light/dark mode.

**Cara pakai:**

```tsx
<ThemedView style={{ padding: 16 }}>
  <ThemedText>Konten di dalam</ThemedText>
</ThemedView>
```

---

### `ParallaxScrollView` — `components/parallax-scroll-view.tsx`

ScrollView dengan efek parallax di bagian header.
Ketika di-scroll ke atas, header menyusut; ke bawah, header membesar.

**Props:**

```tsx
type Props = {
  headerImage: ReactElement; // Gambar/komponen di header
  headerBackgroundColor: {
    // Warna header per mode
    light: string;
    dark: string;
  };
  children: ReactNode; // Konten di bawah header
};
```

**Cara pakai:**

```tsx
<ParallaxScrollView
  headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
  headerImage={<Image source={require('./logo.png')} />}>
  <Text>Konten halaman</Text>
</ParallaxScrollView>
```

**Cara kerja parallax:**

```
scroll offset berubah
    ↓
useAnimatedStyle() dihitung ulang
    ↓
interpolate(scrollOffset, [-250, 0, 250], [-125, 0, 187.5])
    ↓
header bergerak lebih lambat dari konten → efek parallax
```

---

### `HelloWave` — `components/hello-wave.tsx`

Emoji 👋 yang dianimasikan (rotate 25deg, 4x iterasi, 300ms per iterasi).

```tsx
// Penggunaan langsung
<HelloWave />
```

---

### `Collapsible` — `components/ui/collapsible.tsx`

Accordion — section yang bisa dibuka/tutup.

```tsx
<Collapsible title="Judul Section">
  <Text>Konten yang tersembunyi/tampil</Text>
</Collapsible>
```

---

## Aturan Penting React Native

1. **Semua teks HARUS di dalam `<Text>`** — tidak bisa langsung di `<View>`
2. **Tidak ada `display: block`** — semua komponen pakai Flexbox
3. **Tidak ada CSS class** — styling pakai `StyleSheet.create()` atau inline object
4. **Unit tanpa satuan** — `{ width: 100 }` artinya 100 density-independent pixels (dp), bukan px
