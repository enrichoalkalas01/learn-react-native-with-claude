# Konsep 04 — Theming & Dark Mode

## Gambaran Sistem Theming

Project ini menggunakan sistem theming berlapis:

```
Device OS (light/dark setting)
    ↓
useColorScheme() hook
    ↓
Colors[colorScheme] dari constants/theme.ts
    ↓
useThemeColor() hook
    ↓
Komponen ThemedText / ThemedView
```

---

## `constants/theme.ts` — Definisi Warna & Font

```ts
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4', // warna aksen (biru)
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};
```

**Menambahkan warna baru:**

```ts
// Tambahkan ke kedua mode
export const Colors = {
  light: {
    ...existing,
    card: '#F5F5F5', // warna kartu di light mode
    error: '#DC2626',
  },
  dark: {
    ...existing,
    card: '#1F1F1F', // warna kartu di dark mode
    error: '#EF4444',
  },
};
```

---

## `hooks/use-color-scheme.ts` — Deteksi Mode

```ts
// Mengembalikan 'light' atau 'dark'
const colorScheme = useColorScheme();
```

Di `hooks/use-color-scheme.web.ts` ada override khusus untuk web platform
karena implementasinya sedikit berbeda.

---

## `hooks/use-theme-color.ts` — Ambil Warna

```ts
export function useThemeColor(
  props: { light?: string; dark?: string }, // warna override opsional
  colorName: keyof typeof Colors.light // nama key dari Colors
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  // Prioritas: prop > Colors[theme][colorName]
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
```

**Contoh penggunaan:**

```tsx
// Ambil warna 'text' dari theme
const textColor = useThemeColor({}, 'text');

// Override hanya untuk komponen ini
const bgColor = useThemeColor({ light: '#blue', dark: '#navy' }, 'background');
```

---

## Komponen Themed

### `ThemedText`

```tsx
// Otomatis pakai warna text dari theme
<ThemedText>Hello World</ThemedText>

// Override warna
<ThemedText lightColor="#FF0000" darkColor="#FF6666">
  Teks Merah
</ThemedText>
```

### `ThemedView`

```tsx
// Otomatis pakai warna background dari theme
<ThemedView style={{ padding: 16 }}>{/* children */}</ThemedView>
```

---

## Cara Membuat Komponen Themed Sendiri

```tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import { View, type ViewProps } from 'react-native';

type ThemedCardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedCard({ lightColor, darkColor, style, ...rest }: ThemedCardProps) {
  // Pakai key 'card' yang sudah kita tambahkan di Colors
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');

  return (
    <View style={[{ backgroundColor, borderRadius: 12, padding: 16 }, style]} {...rest} />
  );
}
```

---

## Provider di Root Layout

Di `app/_layout.tsx`, seluruh app dibungkus dengan `ThemeProvider` dari React Navigation:

```tsx
<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  <Stack>...</Stack>
</ThemeProvider>
```

Ini memastikan header navigation, tab bar, dan komponen React Navigation
otomatis mengikuti mode gelap/terang device.

---

## Testing Dark Mode

- **iOS Simulator**: Device → Appearance → Dark / Light
- **Android Emulator**: Settings → Display → Dark Theme
- **Expo Go**: Ganti setting di HP asli
- **Web**: DevTools → Rendering → Emulate CSS prefers-color-scheme
