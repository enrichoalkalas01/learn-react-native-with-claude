# Konsep 02 — Styling di React Native

## Cara Styling

React Native **tidak menggunakan CSS**. Styling dilakukan dengan JavaScript object
yang mirip CSS, tapi hanya mendukung subset tertentu.

---

## StyleSheet.create()

Cara yang direkomendasikan untuk mendefinisikan style:

```tsx
import { StyleSheet, View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
```

**Kenapa pakai `StyleSheet.create()` bukan object biasa?**

- Validasi style saat development (error jika property tidak valid)
- Optimasi performa (style di-cache oleh bridge native)

---

## Inline Style

Bisa juga langsung di prop `style`:

```tsx
<View style={{ flex: 1, backgroundColor: 'red' }}>
```

**Kapan pakai inline?**

- Style yang dinamis / berubah-ubah berdasarkan state/props
- Style yang dipakai hanya sekali

---

## Menggabungkan Style (Style Array)

```tsx
<Text style={[styles.base, styles.bold, { color: 'red' }]}>Teks</Text>
```

Style di kanan menimpa style di kiri (seperti `Object.assign`).

---

## Flexbox di React Native

React Native menggunakan Flexbox sebagai sistem layout utama.
**Perbedaan dengan CSS Flexbox:**

| Property        | Default Web | Default React Native |
| --------------- | ----------- | -------------------- |
| `flexDirection` | `row`       | **`column`**         |
| `alignContent`  | `stretch`   | `flex-start`         |
| `flexShrink`    | `1`         | `0`                  |

### Contoh layout umum:

```tsx
// Dua item berdampingan (horizontal)
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Text>Kiri</Text>
  <Text>Kanan</Text>
</View>

// Tengah secara vertikal & horizontal
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <Text>Di Tengah</Text>
</View>

// Paksa child mengisi sisa ruang
<View style={{ flex: 1, flexDirection: 'row' }}>
  <Text style={{ flex: 1 }}>Mengisi sisa</Text>
  <Text>Fixed</Text>
</View>
```

---

## Property Style yang Sering Dipakai

### Layout

```
flex, flexDirection, justifyContent, alignItems, alignSelf
gap, rowGap, columnGap
padding, paddingTop/Bottom/Left/Right, paddingHorizontal, paddingVertical
margin, marginTop/Bottom/Left/Right, marginHorizontal, marginVertical
width, height, minWidth, maxWidth, minHeight, maxHeight
position ('absolute' | 'relative'), top, bottom, left, right
overflow ('visible' | 'hidden' | 'scroll')
```

### Tampilan

```
backgroundColor
borderRadius, borderTopLeftRadius, borderTopRightRadius, dst.
borderWidth, borderColor, borderStyle
opacity
shadow* (iOS) / elevation (Android)
```

### Teks (hanya untuk Text component)

```
fontSize, fontWeight, fontFamily, fontStyle
color
lineHeight
letterSpacing
textAlign, textDecorationLine
```

---

## Contoh di Project Ini

Dari `app/(tabs)/index.tsx`:

```tsx
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row', // children berderet horizontal
    alignItems: 'center', // rata tengah vertikal
    gap: 8, // jarak antar children 8dp
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute', // posisi absolut di dalam header
  },
});
```

---

## Units di React Native

Semua angka tanpa satuan = **density-independent pixels (dp)**.
React Native otomatis menyesuaikan dengan pixel density layar device.

```tsx
// Ini artinya 16dp, bukan 16px
{
  padding: 16;
}

// Untuk persentase, pakai string
{
  width: '50%';
}

// Untuk pixel absolut (jarang dipakai)
import { PixelRatio } from 'react-native';
const px = PixelRatio.roundToNearestPixel(16);
```
