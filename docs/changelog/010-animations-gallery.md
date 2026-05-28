# Changelog 010 — Galeri Animasi

**Tanggal:** 2026-05-12
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Halaman baru `/apps/animations` berisi **13 demo animasi** lengkap menggunakan **Reanimated 4**. Dibagi 4 grup untuk ease of learning:

1. **Basic Transforms** — fade, scale, rotate, flip
2. **Timing & Sequencing** — easing, shake, pulse, skeleton
3. **Value Interpolation** — counter, color, progress bar
4. **Gesture & Layout** — draggable, swipe-to-delete

---

## File yang Dibuat / Diubah

| File                      | Status   | Perubahan                      |
| ------------------------- | -------- | ------------------------------ |
| `app/apps/animations.tsx` | **Baru** | 13 section animasi, ~700 baris |
| `app/_layout.tsx`         | Diubah   | Register Stack.Screen          |
| `app/(tabs)/apps.tsx`     | Diubah   | Tambah kartu Galeri Animasi    |
| `components/sidebar.tsx`  | Diubah   | Tambah menu sidebar            |

---

## Daftar Animasi

| #   | Animasi           | API Reanimated                       | Use Case                    |
| --- | ----------------- | ------------------------------------ | --------------------------- |
| 1   | Fade In/Out       | `withTiming` + opacity               | Show/hide content smooth    |
| 2   | Spring Scale      | `withSpring`                         | Tap feedback yang bouncy    |
| 3   | Rotate            | `withTiming` + rotate                | Loading spinner, refresh    |
| 4   | Flip Card 3D      | `rotateY` + perspective              | Card with hidden info       |
| 5   | Easing Comparison | `Easing.linear/cubic/bounce/elastic` | Pilih curve yang pas        |
| 6   | Shake             | `withSequence`                       | Validation error feedback   |
| 7   | Pulse Heartbeat   | `withRepeat(-1)`                     | Live indicator, notif badge |
| 8   | Skeleton Shimmer  | `withRepeat` + interpolate           | Loading state placeholder   |
| 9   | Animated Counter  | `requestAnimationFrame`              | Number counting up          |
| 10  | Color Morph       | `interpolateColor`                   | Status indicator            |
| 11  | Progress Bar      | width + color interpolate            | Upload/download             |
| 12  | Draggable Box     | `Gesture.Pan`                        | Drag-to-reorder             |
| 13  | Swipe to Delete   | Pan + threshold + LinearTransition   | Inbox row delete            |

---

## API Reanimated yang Diperkenalkan

### Shared values

```tsx
const opacity = useSharedValue(1);
```

Value yang bisa di-animate. Tinggal di UI thread, tidak trigger re-render.

### Animated styles

```tsx
const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
```

Reactive style — auto-update saat shared value berubah.

### Timing functions

```tsx
withTiming(toValue, { duration, easing });
withSpring(toValue, { damping, stiffness });
withSequence(anim1, anim2, anim3); // berurutan
withRepeat(anim, -1); // infinite loop
```

### Interpolation

```tsx
interpolate(value, [0, 1], [0, 100]); // 0..1 → 0..100
interpolateColor(value, [0, 1], ['red', 'blue']); // warna
```

### Easing

```tsx
Easing.linear;
Easing.inOut(Easing.cubic);
Easing.bounce;
Easing.elastic(1.5);
```

### Gestures

```tsx
const pan = Gesture.Pan()
  .onUpdate((e) => {
    offsetX.value = e.translationX;
  })
  .onEnd(() => {
    offsetX.value = withSpring(0);
  });

<GestureDetector gesture={pan}>
  <Animated.View style={style} />
</GestureDetector>;
```

### Layout animations

```tsx
<Animated.View
  entering={FadeIn.duration(200)}
  exiting={FadeOut.duration(150)}
  layout={LinearTransition.duration(250)}
/>
```

### Run on JS thread

```tsx
withTiming(0, { duration: 200 }, () => {
  runOnJS(onComplete)(id); // panggil JS function dari UI thread
});
```

### Cancel animation

```tsx
cancelAnimation(scale); // stop ongoing animation
```

---

## Pattern Penting

### 1. Toggle dengan Conditional Value

```tsx
opacity.value = withTiming(opacity.value > 0.5 ? 0 : 1);
```

Baca current value lalu animate ke kebalikannya — tidak perlu useState terpisah.

### 2. Pulse Loop dengan Cancel

```tsx
const start = () => {
  scale.value = withRepeat(
    withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 600 })),
    -1 // -1 = infinite
  );
};

const stop = () => {
  cancelAnimation(scale); // wajib! tanpa ini animasi keep running
  scale.value = withTiming(1); // reset ke posisi awal smooth
};
```

### 3. Skeleton Shimmer

```tsx
// 1. Continuous loop yang menggerakkan highlight
const progress = useSharedValue(0);
useEffect(() => {
  progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  return () => cancelAnimation(progress);
}, []);

// 2. Highlight bar dengan translateX
const shimmer = useAnimatedStyle(() => ({
  transform: [{ translateX: interpolate(progress.value, [0, 1], [-150, 250]) }],
}));

// 3. Parent box overflow:hidden
<View className="bg-gray-200 overflow-hidden">
  <Animated.View style={[shimmer, { width: 80, background: '#fff' }]} />
</View>;
```

### 4. Swipe-to-Delete dengan Callback ke JS

```tsx
const pan = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = Math.min(0, e.translationX);
  })
  .onEnd((e) => {
    if (e.translationX < -THRESHOLD) {
      // Animate off-screen, lalu trigger delete
      translateX.value = withTiming(-400, { duration: 200 }, () => {
        runOnJS(onDelete)(item.id); // panggil setState dari JS thread
      });
    } else {
      translateX.value = withSpring(0); // spring back
    }
  });
```

**Key insight**: animasi jalan di UI thread, tapi `setState` HARUS di JS thread → pakai `runOnJS`.

### 5. Animated Counter (Pure JS)

Tidak semua animasi harus Reanimated. Untuk number counter, JS-based dengan `requestAnimationFrame` lebih simple:

```tsx
const animateNumber = (from: number, to: number) => {
  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(1, elapsed / 1500);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    setValue(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  tick();
};
```

Trade-off: jalan di JS thread, tapi update text content yang otherwise butuh `useAnimatedProps` (lebih ribet).

### 6. Flip Card 3D

```tsx
const frontStyle = useAnimatedStyle(() => ({
  transform: [
    { perspective: 1000 },                   // tambah depth
    { rotateY: `${rotation.value}deg` },
  ],
  backfaceVisibility: 'hidden',              // sembunyikan saat menghadap belakang
}));

const backStyle = useAnimatedStyle(() => ({
  transform: [
    { perspective: 1000 },
    { rotateY: `${rotation.value + 180}deg` }, // offset 180 dari front
  ],
  backfaceVisibility: 'hidden',
}));

// 2 view absolute, stacked
<View style={{ position: 'relative' }}>
  <Animated.View style={[frontStyle, ...]}>FRONT</Animated.View>
  <Animated.View style={[backStyle, ...]}>BACK</Animated.View>
</View>
```

---

## Konsep Baru Diintroduksi

| Konsep                      | Penjelasan                                                 |
| --------------------------- | ---------------------------------------------------------- |
| **UI thread vs JS thread**  | Reanimated jalan di UI thread (60fps walau JS sibuk)       |
| **Shared values**           | State khusus animasi, tidak trigger re-render React        |
| **Worklets**                | Function yang jalan di UI thread (otomatis via Reanimated) |
| **Interpolation**           | Map input range ke output range smooth                     |
| **Layout animations**       | Auto-animate entering/exiting/moving                       |
| **Pan gesture**             | Drag/swipe detection dengan threshold                      |
| **`runOnJS`**               | Bridge dari UI thread balik ke JS thread                   |
| **`cancelAnimation`**       | Stop loop/long animation explicitly                        |
| **Easing curves**           | Linear / ease / bounce / elastic — beda feel               |
| **`backfaceVisibility`**    | CSS-like property untuk 3D flip                            |
| **`requestAnimationFrame`** | Plain JS animation (60fps tick) untuk hal sederhana        |

---

## Cara Coba

```bash
npx expo start --clear
```

Buka:

- **Tab Apps → Galeri Animasi** (icon ✨)
- **Sidebar → Mini Apps → Galeri Animasi**
- URL: `/apps/animations`

Yang paling fun untuk eksperimen:

1. **Flip Card** — tap berulang lihat 3D flip
2. **Easing Comparison** — lihat perbedaan curve di 1 layar
3. **Skeleton Shimmer** — loading state yang real-feel
4. **Swipe to Delete** — swipe kiri item, lihat layout transition saat item lain naik

---

## Coba Sendiri

1. **Parallax scroll** — pakai `useAnimatedScrollHandler` untuk header yang shrink
2. **Bottom sheet manual** — pan gesture + snap points (mirip @gorhom/bottom-sheet tapi DIY)
3. **Tab indicator** — bar bawah yang slide ke tab aktif
4. **Image gallery** — pinch + pan untuk zoom
5. **Confetti** — multiple particles dengan random direction
6. **Number ticker** — counter yang scroll vertical (digit-per-digit)
