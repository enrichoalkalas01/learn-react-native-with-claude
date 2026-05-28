# Changelog 009 — Chart Lanjutan (Interaktif & Custom)

**Tanggal:** 2026-05-12
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Halaman baru `/apps/charts-advanced` berisi **8 chart advanced** yang fokus ke:

1. **Interaktivitas** — user bisa tap, edit, drag
2. **Custom data** — nilai bisa diubah real-time via stepper
3. **Real-time** — chart auto-update via `setInterval`
4. **Custom SVG** — chart yang tidak ada di library, dibangun manual

---

## Mengapa

Galeri Chart sebelumnya (changelog 008) lebih ke **static showcase** — tampilan saja.

Halaman ini menunjukkan **pola interaksi nyata**: data yang bisa diubah user, animasi otomatis, dan cara bikin chart custom kalau library tidak punya.

---

## File yang Dibuat / Diubah

| File                                    | Status   | Perubahan                       |
| --------------------------------------- | -------- | ------------------------------- |
| `app/apps/charts-advanced.tsx`          | **Baru** | 8 chart interaktif (~600 baris) |
| `app/_layout.tsx`                       | Diubah   | Register `Stack.Screen` baru    |
| `app/(tabs)/apps.tsx`                   | Diubah   | Tambah kartu "Chart Lanjutan"   |
| `components/sidebar.tsx`                | Diubah   | Tambah menu sidebar             |
| `docs/changelog/009-charts-advanced.md` | **Baru** | Dokumentasi ini                 |

---

## Daftar Chart

| #   | Chart                       | Interaksi                                | Customization                        |
| --- | --------------------------- | ---------------------------------------- | ------------------------------------ |
| 1   | Bar Chart Editable          | Tap bar → highlight + tampilkan value    | Stepper +/- per bar                  |
| 2   | Pie Chart Editable          | —                                        | Stepper per slice, total auto-recalc |
| 3   | Line Chart + Pointer        | Touch → pointer + tooltip                | —                                    |
| 4   | Radar Chart                 | Pilih preset role (Frontend/Backend/dll) | 4 preset profil                      |
| 5   | Bicolor Line + Threshold    | —                                        | Stepper untuk geser target line      |
| 6   | Live Sparkline              | Play/pause button                        | Stepper untuk speed update           |
| 7   | Custom Heatmap (SVG)        | Tombol "Acak Data"                       | Re-generate 84 cell                  |
| 8   | Custom Progress Rings (SVG) | —                                        | Stepper per ring                     |

---

## Komponen Helper Baru

### `<Stepper>`

Reusable +/- stepper untuk semua chart editable.

```tsx
<Stepper
  label="Sen"
  value={50}
  min={0}
  max={100}
  step={5}
  onChange={(v) => setValue(v)}
  color="#0a7ea4"
/>
```

Pattern controlled component — parent kontrol value, stepper hanya call `onChange`.

---

## Pattern Penting

### 1. Editable Chart — State Lift Up

Data chart disimpan di `useState`, chart re-render saat state berubah:

```tsx
const [bars, setBars] = useState(INITIAL_BARS);

const updateBar = (idx, newValue) =>
  setBars(prev =>
    prev.map((b, i) => (i === idx ? { ...b, value: newValue } : b))
  );

<BarChart data={bars.map(b => ({ label: b.label, value: b.value }))} />
<Stepper value={bars[0].value} onChange={v => updateBar(0, v)} />
```

Key: **immutable update** dengan `.map()`, bukan mutate langsung.

### 2. Selected State + Conditional Styling

```tsx
const data = bars.map((b, i) => ({
  ...b,
  frontColor: i === selectedIdx ? '#0a7ea4' : '#94a3b8',
  topLabelComponent: i === selectedIdx ? () => <Text>{b.value}</Text> : undefined,
  onPress: () => setSelectedIdx(selectedIdx === i ? null : i),
}));
```

`onPress` di item data — library akan call saat user tap bar tersebut. Toggle pattern: tap ulang = deselect.

### 3. Pointer Tooltip (Touch Interaction)

Library punya `pointerConfig` untuk LineChart:

```tsx
<LineChart
  pointerConfig={{
    pointerStripHeight: 160,
    pointerColor: '#0a7ea4',
    pointerLabelComponent: (items) => (
      <View className="bg-gray-900 rounded-lg px-3 py-2">
        <Text className="text-white">{items[0].value}</Text>
      </View>
    ),
  }}
/>
```

`pointerLabelComponent` adalah render-prop yang dipanggil saat user sentuh — `items` adalah data point terdekat dengan posisi sentuh.

### 4. Preset Switcher Pattern

```tsx
const PRESETS = {
  Frontend: [9, 9, 8, 4, 3, 4],
  Backend: [3, 6, 3, 9, 9, 8],
};
const [preset, setPreset] = useState('Frontend');

<RadarChart data={PRESETS[preset]} />;
```

User UX yang clean: bukan input manual, tapi pilih dari preset yang masuk akal.

### 5. Real-time Update via `setInterval`

```tsx
useEffect(() => {
  if (!playing) return;
  const id = setInterval(() => {
    setPoints((prev) => [
      ...prev.slice(1), // buang point paling lama
      { value: generateNext(prev) }, // tambah point baru di akhir
    ]);
  }, speed);
  return () => clearInterval(id);
}, [playing, speed]);
```

**Penting:**

- Cleanup di return — wajib clear interval saat unmount / dep change
- `[playing, speed]` di deps — kalau speed berubah, interval restart dengan speed baru
- Pakai `prev.slice(1)` untuk "geser" window — chart tetap punya jumlah point konstan

### 6. Bicolor Line + Reference Line

```tsx
<LineChartBicolor
  data={data}
  color="#22c55e" // di atas threshold
  colorNegative="#ef4444" // di bawah threshold
  showReferenceLine1
  referenceLine1Position={60} // threshold
  referenceLine1Config={{
    color: '#94a3b8',
    dashWidth: 4,
    dashGap: 4,
    labelText: 'Target 60',
  }}
/>
```

Library auto-detect mana point di atas / di bawah threshold dan warnai sesuai.

### 7. Custom Heatmap via SVG

```tsx
import Svg, { Rect } from 'react-native-svg';

<Svg width={width} height={height}>
  {data.map((value, i) => {
    const col = Math.floor(i / ROWS);
    const row = i % ROWS;
    return (
      <Rect
        x={col * (CELL + GAP)}
        y={row * (CELL + GAP)}
        width={CELL}
        height={CELL}
        fill={COLORS[value]} // value 0-4 → 5 warna intensity
        rx={3} // rounded corner
      />
    );
  })}
</Svg>;
```

Pattern grid layout dengan SVG — bagus untuk visualisasi yang library tidak support.

### 8. Custom Progress Ring via SVG

Trick: pakai `strokeDasharray` + `strokeDashoffset` untuk arc:

```tsx
const radius = SIZE / 2 - STROKE / 2;
const circumference = 2 * Math.PI * radius;
const offset = circumference * (1 - percent / 100);

<Circle
  cx={cx}
  cy={cy}
  r={radius}
  fill="none"
  stroke="#ef4444"
  strokeWidth={STROKE}
  strokeDasharray={circumference} // total panjang dash = keliling
  strokeDashoffset={offset} // offset = berapa yang kosong
  strokeLinecap="round"
  rotation={-90} // mulai dari atas
  origin={`${cx},${cy}`}
/>;
```

Multi-ring concentric: render beberapa `<Circle>` dengan radius berbeda. Spacing dihitung dari outer ke inner: `radius - i * (STROKE + GAP)`.

---

## Konsep Baru Diintroduksi

| Konsep                           | Penjelasan                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| **Immutable state update**       | Pakai `.map()` untuk update array — bukan mutate langsung. Mandatory untuk React re-render |
| **Controlled component pattern** | `<Stepper>` — parent kontrol value, child cuma trigger event                               |
| **Render-prop dengan args**      | `pointerLabelComponent(items)` — library pass data saat call function                      |
| **Toggle pattern**               | `setSelected(prev === id ? null : id)` — tap sama = deselect                               |
| **`setInterval` cleanup**        | Wajib `clearInterval` di useEffect return — kalau tidak: memory leak                       |
| **`useRef` untuk interval ID**   | Stable reference, tidak trigger re-render                                                  |
| **SVG stroke-dasharray trick**   | Math di balik progress ring — circumference + offset                                       |
| **Manual grid layout (SVG)**     | `Math.floor(i / cols)` & `i % cols` untuk row/col dari flat array                          |

---

## Cara Coba

```bash
npx expo start --clear
```

Buka:

- **Tab Apps → Chart Lanjutan** (kartu icon 🎯)
- **Sidebar → Mini Apps → Chart Lanjutan**
- URL: `/apps/charts-advanced`

Yang menarik untuk eksperimen:

1. **Pie Chart Editable** — set semua slice ke 0 kecuali 1, lihat efeknya
2. **Live Sparkline** — turunkan speed ke 200ms, lihat chart "ngebut"
3. **Heatmap** — tap "Acak Data" berkali-kali untuk regenerate
4. **Progress Rings** — set semua ke 100%, lihat ring penuh

---

## Coba Sendiri

1. **Persistensi** — simpan state chart ke AsyncStorage supaya tidak reset saat re-open
2. **Drag instead of stepper** — pakai `react-native-gesture-handler` untuk drag bar tinggi
3. **Animasi ring** — wrap value dengan `useSharedValue` + `withSpring` dari Reanimated
4. **Heatmap real data** — sambung ke `useHabits` hook untuk show kebiasaan harian
5. **Sparkline dari API** — replace random dengan polling endpoint nyata
6. **Export chart** — pakai `react-native-view-shot` untuk screenshot chart jadi image
