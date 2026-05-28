# Konsep 12 — Animasi List (Entry, Exit, Layout)

Reanimated 4 menyediakan **layout animation** sederhana untuk list — tidak perlu setup shared value, cukup pasang prop di `Animated.View`.

---

## 3 Jenis Animasi yang Wajib Tahu

```tsx
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn.duration(200)} // muncul
  exiting={FadeOut.duration(150)} // hilang
  layout={LinearTransition.duration(200)} // bergeser saat layout berubah
/>;
```

| Prop       | Kapan dipanggil                                      |
| ---------- | ---------------------------------------------------- |
| `entering` | Saat komponen pertama kali render (mount)            |
| `exiting`  | Saat komponen unmount (dihapus dari tree)            |
| `layout`   | Saat komponen tetap mount tapi posisi/ukuran berubah |

---

## Pemakaian di Project

### Todo, Habit, Expense — semua list pakai pattern sama

```tsx
{
  todos.map((todo) => (
    <Animated.View
      key={todo.id}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}
      className="bg-white rounded-xl ...">
      {/* konten todo */}
    </Animated.View>
  ));
}
```

**Yang terjadi visual:**

- User tambah todo → fade in dari opacity 0
- User hapus → fade out lalu hilang
- Item di atasnya bergeser smooth (karena `layout`)

[!warning]
**`key` HARUS unik dan stabil.** Kalau `key` pakai index array, animasi rusak — React anggap item yang berubah index = item baru.

---

## Built-in Entering/Exiting Animations

```tsx
import {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  SlideInLeft,
  SlideOutLeft,
  SlideInUp,
  SlideOutUp,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInEasyX,
  FlipOutEasyX,
} from 'react-native-reanimated';
```

Bisa di-customize:

```tsx
<Animated.View
  entering={FadeIn.duration(300).delay(100)}
  exiting={FadeOut.duration(200).easing(Easing.out(Easing.quad))}
/>
```

---

## Layout Animation Variants

```tsx
import { LinearTransition, FadingTransition, SequencedTransition } from 'react-native-reanimated';

// Pindah posisi mulus
layout={LinearTransition.duration(300)}

// Fade out lama, fade in baru di posisi baru (cocok untuk reorder besar)
layout={FadingTransition.duration(300)}

// Sequenced — staggered effect
layout={SequencedTransition.duration(300)}
```

---

## Custom Animation

Untuk efek yang tidak ada di built-in, bikin manual:

```tsx
import { withTiming } from 'react-native-reanimated';

const customEnter = (values: any) => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.5 }] },
    animations: {
      opacity: withTiming(1, { duration: 200 }),
      transform: [{ scale: withTiming(1, { duration: 200 }) }],
    },
  };
};

<Animated.View entering={customEnter} />;
```

`'worklet'` directive WAJIB — fungsi jalan di UI thread.

---

## Pitfalls

[!warning]
**1. Animasi tidak jalan di awal app.**

`entering` hanya jalan saat mount **setelah** render pertama. Kalau item ada sejak app pertama kali load, mereka muncul tanpa animasi. Itu desain — supaya layar awal tidak banyak gerakan distractif.

[!warning]
**2. Layout animation bisa "skip frame".**

Kalau update terlalu cepat (misal: hapus 10 item dalam 100ms), animasi bisa terlihat patah. Solusi: throttle action atau pakai `FadingTransition`.

[!warning]
**3. Heavy item → drop frame.**

Kalau setiap item render banyak komponen (image besar, sub-list), 60fps mungkin tidak tercapai. Solusi:

- `React.memo` di komponen item
- Pakai FlatList dengan `windowSize` kecil
- Kurangi efek shadow/border-radius/overflow:hidden

---

## Alternatif: ScrollView vs FlatList

|                      | ScrollView               | FlatList               |
| -------------------- | ------------------------ | ---------------------- |
| Animasi list         | Mulus (semua item mount) | Tricky (recycle item)  |
| Performa item banyak | Buruk (semua render)     | Bagus (virtualization) |
| Aturan praktis       | < 30 item                | > 50 item              |

Project ini pakai **ScrollView + map** karena mini-app data kecil. Untuk data besar, switch ke FlatList — tapi animasi entering/exiting butuh setup tambahan (`itemLayoutAnimation` prop).

---

## Coba Sendiri

1. Ganti `FadeIn` → `SlideInRight` di list todo, perhatikan beda visualnya.
2. Custom: buat animation yang scale dari 0 + rotate 360 derajat saat item baru muncul.
3. Tambah `entering={FadeIn.delay(i * 100)}` di Quiz options agar muncul satu per satu.
