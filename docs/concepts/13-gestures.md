# Konsep 13 — Gestures (Tap, Pan, Swipe)

`react-native-gesture-handler` (RNGH) menggantikan touch handler RN bawaan dengan API yang jalan di **UI thread native** — tidak putus karena JS sibuk.

---

## Setup

### Install

```bash
npx expo install react-native-gesture-handler
```

### Wrap Root App

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* seluruh app */}
    </GestureHandlerRootView>
  );
}
```

[!warning]
Tanpa `GestureHandlerRootView` di root, gesture **tidak akan responsif**.

---

## Anatomi Gesture API

### 1. Definisi Gesture

```tsx
import { Gesture } from 'react-native-gesture-handler';

const gesture = Gesture.Pan()
  .onUpdate((e) => {
    // update tiap frame saat user gerak
  })
  .onEnd((e) => {
    // saat user lepas
  });
```

### 2. Bungkus Komponen

```tsx
import { GestureDetector } from 'react-native-gesture-handler';

<GestureDetector gesture={gesture}>
  <Animated.View>...</Animated.View>
</GestureDetector>;
```

---

## Jenis Gesture

| Tipe                  | Kapan                        |
| --------------------- | ---------------------------- |
| `Gesture.Tap()`       | Single tap                   |
| `Gesture.LongPress()` | Tahan minimal X ms           |
| `Gesture.Pan()`       | Drag/swipe                   |
| `Gesture.Pinch()`     | Pinch zoom (2 jari)          |
| `Gesture.Rotation()`  | Rotate (2 jari)              |
| `Gesture.Fling()`     | Fling cepat ke arah tertentu |

---

## Pan Gesture (di Project ini)

Project pakai Pan untuk **swipe-to-close sidebar**:

```tsx
const panGesture = Gesture.Pan()
  .activeOffsetX([-10, 10])  // gesture aktif kalau drag > 10px horizontal
  .onUpdate((e) => {
    // e.translationX = jarak dari posisi awal
    const next = Math.min(0, e.translationX);
    if (next < 0) {
      translateX.value = next;
    }
  })
  .onEnd((e) => {
    const shouldClose =
      e.translationX < -SIDEBAR_WIDTH / 3 ||  // drag lebih dari 1/3 lebar
      e.velocityX < -500;                     // ATAU swipe cepat ke kiri
    if (shouldClose) {
      translateX.value = withTiming(-SIDEBAR_WIDTH, {...}, (finished) => {
        if (finished) runOnJS(close)();
      });
    } else {
      translateX.value = withTiming(0, {...});  // snap back
    }
  });
```

### Property Penting Pan

| Prop / event                | Arti                                                         |
| --------------------------- | ------------------------------------------------------------ |
| `e.translationX`            | jarak X dari titik mulai gesture                             |
| `e.translationY`            | jarak Y                                                      |
| `e.velocityX`               | kecepatan gesture (px/s)                                     |
| `e.x`, `e.y`                | posisi current finger di layar                               |
| `activeOffsetX([min, max])` | gesture mulai diaktifkan kalau translationX di luar range    |
| `failOffsetY([min, max])`   | gesture FAIL (tidak active) kalau translationY di luar range |

`activeOffsetX([-10, 10])` artinya: jangan aktifkan pan sampai user drag minimal 10px ke kiri/kanan. Berguna untuk membedakan dari scroll vertical.

---

## Pattern Snapping

Pattern umum saat pan:

1. Saat `onUpdate` → update posisi mengikuti jari
2. Saat `onEnd` → check threshold (jarak atau velocity)
3. Kalau lewat threshold → animasi ke posisi target
4. Kalau tidak → animasi balik ke posisi awal

```tsx
.onEnd((e) => {
  const shouldDoAction =
    Math.abs(e.translationX) > THRESHOLD ||
    Math.abs(e.velocityX) > VELOCITY_THRESHOLD;

  if (shouldDoAction) {
    translateX.value = withTiming(TARGET);
  } else {
    translateX.value = withTiming(START);
  }
});
```

---

## `runOnJS` di Gesture

Gesture callback jalan di **UI thread** (worklet). Untuk panggil React state setter / function JS:

```tsx
.onEnd((e) => {
  if (shouldDoSomething) {
    runOnJS(setMyState)(true);   // bukan setMyState(true) langsung
    runOnJS(navigation.goBack)();
  }
});
```

Kalau lupa pakai `runOnJS`, error: "Tried to synchronously call function from a different thread".

---

## Kombinasi Gesture

```tsx
import { Gesture } from 'react-native-gesture-handler';

// Race — yang aktif duluan menang
const composed = Gesture.Race(tapGesture, panGesture);

// Simultaneous — keduanya aktif bersamaan (misal pinch + rotate)
const composed = Gesture.Simultaneous(pinchGesture, rotationGesture);

// Exclusive — hanya satu aktif, kalau gesture A gagal baru cek B
const composed = Gesture.Exclusive(longPressGesture, panGesture);
```

---

## Tap Gesture (Lebih Bagus dari `onPress`)

```tsx
const tap = Gesture.Tap()
  .numberOfTaps(2) // double tap
  .maxDuration(250)
  .onEnd((_e, success) => {
    if (success) runOnJS(handleDoubleTap)();
  });
```

Untuk single tap dengan ripple/feedback, `Pressable` masih lebih praktis. Tap Gesture berguna saat butuh kombinasi (tap + pan, double tap, dst.).

---

## Pitfalls

[!warning]
**1. Conflict dengan ScrollView.**

ScrollView punya pan internal (untuk scroll). Kalau pan custom kamu di dalam ScrollView, mereka akan saling berebut. Solusi: pakai `activeOffsetX` untuk pan horizontal saja, biarkan ScrollView handle vertical.

[!warning]
**2. Lupa `GestureHandlerRootView` di root.**

App akan kelihatan jalan tapi gesture bisa miss event. Wajib root component.

[!warning]
**3. Akses `.value` shared value langsung di gesture callback.**

```tsx
.onUpdate((e) => {
  console.log(stateValue);  // ❌ akan stale, ambil dari snapshot saat gesture mulai
  console.log(translateX.value);  // ✅ shared value selalu live
});
```

Kalau perlu state React di dalam gesture, pakai shared value (`useSharedValue`).

---

## Coba Sendiri

1. Tambah swipe-to-delete di Todo list (swipe item ke kiri → hapus).
2. Pinch-to-zoom di Image — pakai `Gesture.Pinch()` + `transform: [{ scale }]`.
3. Pull-to-refresh custom yang dimodifikasi — tarik dari atas + spring back.
