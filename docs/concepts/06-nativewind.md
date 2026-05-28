# Konsep 06 — NativeWind (Tailwind CSS di React Native)

## Apa itu NativeWind?

NativeWind adalah library yang membawa **Tailwind CSS utility classes** ke React Native.
Alih-alih menulis `StyleSheet.create()`, kamu bisa langsung pakai `className="..."`.

---

## Perbandingan StyleSheet vs NativeWind

```tsx
// StyleSheet (cara lama)
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
});
<View style={styles.card}>
  <Text style={styles.title}>Judul</Text>
</View>

// NativeWind (cara baru)
<View className="bg-white rounded-2xl p-4 mb-3 shadow-md">
  <Text className="text-base font-bold text-gray-900">Judul</Text>
</View>
```

---

## Setup di Project Ini

### 1. `babel.config.js`

Memberitahu Babel untuk memproses `className` menjadi style native:

```js
['babel-preset-expo', { jsxImportSource: 'nativewind' }];
```

### 2. `metro.config.js`

Memberitahu Metro bundler untuk memproses file CSS:

```js
module.exports = withNativeWind(config, { input: './global.css' });
```

### 3. `global.css`

Diimpor di root `_layout.tsx`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. `tailwind.config.js`

Daftar file yang di-scan untuk class:

```js
content: ['./app/**/*.tsx', './components/**/*.tsx'];
presets: [require('nativewind/preset')];
```

### 5. `nativewind-env.d.ts`

Supaya TypeScript tidak komplain soal `className` prop:

```ts
/// <reference types="nativewind/types" />
```

---

## Dark Mode dengan NativeWind

Tambahkan prefix `dark:` untuk style yang aktif di dark mode:

```tsx
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Otomatis ikut setting device!</Text>
</View>
```

NativeWind mendeteksi dark mode dari `useColorScheme()` secara otomatis.

---

## Cheatsheet Class yang Sering Dipakai

### Layout

```
flex-1           → flex: 1
flex-row         → flexDirection: 'row'
items-center     → alignItems: 'center'
justify-center   → justifyContent: 'center'
justify-between  → justifyContent: 'space-between'
gap-4            → gap: 16
```

### Spacing (1 unit = 4px)

```
p-4    → padding: 16
px-4   → paddingHorizontal: 16
py-2   → paddingVertical: 8
pt-6   → paddingTop: 24
m-4    → margin: 16
mb-3   → marginBottom: 12
mt-auto → marginTop: 'auto'
```

### Warna Background

```
bg-white          → backgroundColor: '#fff'
bg-gray-100       → backgroundColor: '#f3f4f6'
bg-blue-500       → backgroundColor: '#3b82f6'
bg-primary        → backgroundColor: '#0a7ea4'  (custom di tailwind.config.js)
bg-primary/10     → backgroundColor dengan opacity 10%
```

### Teks

```
text-sm    → fontSize: 14
text-base  → fontSize: 16
text-lg    → fontSize: 18
text-xl    → fontSize: 20
text-2xl   → fontSize: 24
font-bold  → fontWeight: 'bold'
font-semibold → fontWeight: '600'
text-center → textAlign: 'center'
text-gray-500 → color: '#6b7280'
leading-5  → lineHeight: 20
```

### Border & Radius

```
rounded         → borderRadius: 4
rounded-lg      → borderRadius: 8
rounded-xl      → borderRadius: 12
rounded-2xl     → borderRadius: 16
rounded-full    → borderRadius: 9999
border          → borderWidth: 1
border-gray-200 → borderColor: '#e5e7eb'
border-b        → borderBottomWidth: 1
```

### Ukuran & Posisi

```
w-full      → width: '100%'
w-1/2       → width: '50%'
w-10        → width: 40
h-10        → height: 40
absolute    → position: 'absolute'
relative    → position: 'relative'
top-0       → top: 0
inset-0     → top/right/bottom/left: 0
z-10        → zIndex: 10
overflow-hidden → overflow: 'hidden'
```

### Opacity & Shadow

```
opacity-50      → opacity: 0.5
shadow-sm       → shadow kecil
shadow-md       → shadow medium
shadow-lg       → shadow besar
```

---

## Perbedaan dengan Tailwind Web

| Fitur                     | Web                 | React Native (NativeWind)   |
| ------------------------- | ------------------- | --------------------------- |
| `display: flex`           | Default untuk block | Selalu flex                 |
| `flexDirection`           | `row` default       | `column` default            |
| `hover:` prefix           | Ya                  | Tidak ada (pakai `pressed`) |
| CSS `calc()`              | Ya                  | Tidak                       |
| Arbitrary values `[23px]` | Ya                  | Terbatas                    |
| Grid                      | Ya                  | Tidak (pakai flex)          |

---

## Class Khusus NativeWind

```tsx
// Android ripple effect
<Pressable android_ripple={{ color: '#00000020' }} className="...">

// Platform-specific (tidak ada di Tailwind web)
// Gunakan Platform.select() dari React Native untuk ini
```

---

## Custom Theme

Di `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#0a7ea4',    // pakai sebagai bg-primary, text-primary, dll.
      brand: {
        50: '#f0f9ff',
        500: '#0a7ea4',
        900: '#0c4a6e',
      },
    },
    spacing: {
      '18': '72px',          // p-18, m-18, dll.
    },
  },
},
```
