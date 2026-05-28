# Konsep 05 — Animasi dengan React Native Reanimated

## Kenapa Reanimated?

React Native punya `Animated` API bawaan, tapi ada keterbatasan:
animasi dijalankan di **JS thread** yang sama dengan logika app.
Kalau JS thread sibuk, animasi bisa patah-patah (jank).

**Reanimated** menjalankan animasi di **UI thread** (native) terpisah
sehingga animasi tetap smooth 60fps meski JS thread sedang sibuk.

---

## Konsep Utama Reanimated

### Shared Values

Nilai yang bisa dibaca dari JS thread maupun UI thread:

```tsx
import { useSharedValue } from 'react-native-reanimated';

const opacity = useSharedValue(1); // nilai awal: 1
const position = useSharedValue(0); // nilai awal: 0

// Ubah nilai (trigger animasi)
opacity.value = 0; // langsung
opacity.value = withTiming(0); // dengan animasi
```

### Animated Style

Style yang bereaksi terhadap perubahan shared value:

```tsx
import { useAnimatedStyle } from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: opacity.value, // auto-track opacity shared value
    transform: [{ translateX: position.value }],
  };
});

// Pakai di Animated component
<Animated.View style={[styles.box, animatedStyle]} />;
```

### Fungsi Animasi

```tsx
import {
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

// Animasi linear/ease dalam durasi tertentu
opacity.value = withTiming(0, { duration: 300 });

// Animasi spring (memantul)
position.value = withSpring(100);

// Ulangi animasi (count: -1 = selamanya)
opacity.value = withRepeat(withTiming(0, { duration: 500 }), 4, true);

// Jalankan berurutan
position.value = withSequence(withTiming(100), withTiming(0));
```

---

## Animasi di Project Ini

### `HelloWave` — `components/hello-wave.tsx`

Menggunakan CSS-style animation API Reanimated (lebih baru):

```tsx
<Animated.Text
  style={{
    fontSize: 28,
    animationName: {
      '50%': { transform: [{ rotate: '25deg' }] }, // keyframe di 50%
    },
    animationIterationCount: 4, // ulang 4 kali
    animationDuration: '300ms', // tiap iterasi 300ms
  }}>
  👋
</Animated.Text>
```

**Flow animasi:**

```
Start: rotate(0deg)
  ↓ 150ms
50%: rotate(25deg)    ← miring ke kanan
  ↓ 150ms
End: rotate(0deg)     ← kembali tegak
  ↓ (ulang 4x)
Selesai
```

---

### `ParallaxScrollView` — Animasi Scroll

Efek parallax menggunakan scroll position sebagai input animasi.

```tsx
const scrollRef = useAnimatedRef<Animated.ScrollView>();
const scrollOffset = useScrollOffset(scrollRef); // track posisi scroll

const headerAnimatedStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        // Header bergerak lebih lambat dari konten (0.5x speed ke atas, 0.75x ke bawah)
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT], // input range
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75] // output range
        ),
      },
      {
        // Header membesar saat di-overscroll ke atas
        scale: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [2, 1, 1] // 2x besar saat overscroll, normal saat di atas, tetap saat scroll bawah
        ),
      },
    ],
  };
});
```

**Cara kerja `interpolate`:**

```
Input: scrollOffset.value
Output: translateY

Scroll ke atas (-250) → translateY = -125   (header naik setengah kecepatan)
Di posisi 0           → translateY = 0      (posisi normal)
Scroll ke bawah (250) → translateY = 187.5  (header turun 3/4 kecepatan)
```

---

## Template Animasi Umum

### Fade In saat komponen muncul

```tsx
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

function FadeIn({ children }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
```

### Shake animation (untuk error)

```tsx
const translateX = useSharedValue(0);

function shake() {
  translateX.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
}

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

### Scale saat ditekan

```tsx
const scale = useSharedValue(1);

const style = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

<Animated.View
  style={[styles.button, style]}
  onTouchStart={() => {
    scale.value = withTiming(0.95);
  }}
  onTouchEnd={() => {
    scale.value = withSpring(1);
  }}
/>;
```

---

## Penting: Worklets

Fungsi yang dijalankan di UI thread harus ditandai dengan `'worklet'`:

```tsx
const animatedStyle = useAnimatedStyle(() => {
  'worklet'; // ← ini dijalankan di UI thread
  return { opacity: opacity.value };
});
```

`useAnimatedStyle` otomatis membuat worklet, jadi biasanya tidak perlu tulis manual.
Tapi jika membuat fungsi helper yang dipanggil dari animated style, perlu ditambahkan.
