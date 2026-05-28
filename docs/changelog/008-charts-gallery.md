# Changelog 008 — Galeri Chart

**Tanggal:** 2026-05-12
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Membuat **halaman demo berbagai jenis chart** yang bisa dipakai di React Native menggunakan library `react-native-gifted-charts` yang sudah ada di project.

Tujuan: jadi referensi cepat saat butuh visualisasi data — tinggal lihat halaman ini, pilih chart yang cocok, copy konfigurasinya.

---

## Mengapa

Sebelumnya chart hanya muncul di 1 tempat (pie chart breakdown expense di `apps/expenses.tsx`). Saat ingin pakai chart lain di fitur baru, harus baca-baca dokumentasi library lagi.

Dengan galeri ini, semua varian chart populer ada di satu screen sebagai live preview + code reference.

---

## File yang Dibuat / Diubah

| File                     | Status   | Perubahan                                       |
| ------------------------ | -------- | ----------------------------------------------- |
| `app/apps/charts.tsx`    | **Baru** | Halaman galeri 10 jenis chart                   |
| `app/_layout.tsx`        | Diubah   | Daftar `Stack.Screen` untuk `apps/charts`       |
| `app/(tabs)/apps.tsx`    | Diubah   | Tambah kartu "Galeri Chart" di list apps        |
| `components/sidebar.tsx` | Diubah   | Tambah menu "Galeri Chart" di section Mini Apps |

---

## Chart yang Tersedia

| #   | Chart                          | Use Case                                              |
| --- | ------------------------------ | ----------------------------------------------------- |
| 1   | **Line Chart — Basic**         | Metric harian sederhana (visitors, sales, dll)        |
| 2   | **Area Chart — Gradient Fill** | Dashboard yang lebih visual dengan area di bawah line |
| 3   | **Multi-Line Chart**           | Bandingkan 2 dataset sekaligus (revenue vs expense)   |
| 4   | **Bar Chart — Basic**          | Bandingkan nilai antar kategori dengan jelas          |
| 5   | **Bar Chart — Colored**        | Ranking item dengan warna berbeda per bar             |
| 6   | **Stacked Bar Chart**          | Total + komposisi dalam 1 bar (online vs offline)     |
| 7   | **Pie Chart — Basic**          | Proporsi yang totalnya 100%                           |
| 8   | **Donut Chart**                | Pie dengan center label untuk total                   |
| 9   | **Semi-Circle (Gauge)**        | Progress / speedometer style                          |
| 10  | **Population Pyramid**         | Bandingkan 2 grup horizontal (pria/wanita per umur)   |

---

## Komponen Helper

Halaman ini punya 2 helper kecil supaya tiap section konsisten:

### `<ChartSection>`

Wrapper card untuk tiap chart — emoji + judul + deskripsi + container.

```tsx
<ChartSection
  emoji="📈"
  title="Line Chart — Basic"
  description="Tracking sederhana per hari.">
  <LineChart data={...} />
</ChartSection>
```

### `<Legend>`

Komponen legend di bawah chart — warna kotak + label + (opsional) nilai.

```tsx
<Legend
  items={[
    { color: '#0a7ea4', label: 'Revenue' },
    { color: '#ec4899', label: 'Expense' },
  ]}
/>
```

Pattern ini bagus karena legend bawaan `react-native-gifted-charts` cukup terbatas — bikin sendiri lebih fleksibel.

---

## Pattern Penting

### 1. Line Chart dengan Area Gradient

```tsx
<LineChart
  data={data}
  curved
  areaChart
  color="#22c55e"
  startFillColor="#22c55e"
  startOpacity={0.4}
  endFillColor="#22c55e"
  endOpacity={0.05}
/>
```

`areaChart` aktifkan area di bawah line. `startOpacity` di atas, `endOpacity` di bawah — bikin efek gradient memudar.

### 2. Multi-Line: 2 Dataset di 1 Chart

```tsx
<LineChart
  data={REVENUE} // dataset 1
  data2={EXPENSE} // dataset 2
  color="#0a7ea4"
  color2="#ec4899"
/>
```

Library support sampai `data5`. Cocok untuk comparison.

### 3. Stacked Bar Chart

Struktur data berbeda dari bar biasa — pakai `stacks` array per item:

```tsx
const STACKED = [
  {
    label: 'Sen',
    stacks: [
      { value: 20, color: '#0a7ea4' },
      { value: 30, color: '#f59e0b' },
    ],
  },
  // ...
];

<BarChart stackData={STACKED} />;
```

Penting: pakai prop `stackData`, **bukan** `data`.

### 4. Donut + Center Label

```tsx
<PieChart
  data={data}
  radius={90}
  innerRadius={60}
  donut
  centerLabelComponent={() => (
    <View className="items-center">
      <Text className="text-[10px] text-gray-500">Total</Text>
      <Text className="text-lg font-bold">100</Text>
    </View>
  )}
/>
```

`centerLabelComponent` adalah render-prop — fungsi yang return JSX. Posisinya auto di tengah donut.

### 5. Semi-Circle (Half Pie)

Sama seperti donut tapi tambah prop `semiCircle`:

```tsx
<PieChart data={data} radius={100} innerRadius={70} donut semiCircle />
```

Karena setengah lingkaran, posisi center label harus di-shift ke bawah dengan `marginTop`.

### 6. Population Pyramid

Beda dari chart lain — data pakai `left` dan `right`:

```tsx
const PYRAMID = [
  { left: 12, right: 14 },
  { left: 18, right: 19 },
];

<PopulationPyramid
  data={PYRAMID}
  leftBarColor="#0a7ea4"
  rightBarColor="#ec4899"
  showValuesAsBarLabels
  barLabelFontSize={9}
  barLabelColor="#fff"
/>;
```

⚠️ **Catatan**: PopulationPyramid **TIDAK** punya prop `barWidth` atau `barLabelTextStyle`. Pakai props individual seperti `barLabelFontSize` dan `barLabelColor`.

---

## Props yang Sering Dipakai (Common)

Hampir semua chart line/bar punya props ini — sekali hafal, bisa dipakai di mana-mana:

| Prop                                    | Fungsi                             |
| --------------------------------------- | ---------------------------------- |
| `width`, `height`                       | Ukuran chart container             |
| `color`                                 | Warna utama (line/bar)             |
| `thickness`                             | Tebal line (untuk LineChart)       |
| `barWidth`                              | Lebar bar (untuk BarChart)         |
| `barBorderRadius`                       | Rounded bar                        |
| `yAxisColor`, `xAxisColor`              | Warna axis line                    |
| `yAxisTextStyle`, `xAxisLabelTextStyle` | Style text label di axis           |
| `noOfSections`                          | Jumlah garis horizontal grid       |
| `initialSpacing`                        | Jarak dari y-axis ke titik pertama |
| `spacing`                               | Jarak antar titik / bar            |

---

## Konsep Baru Diintroduksi

| Konsep                                   | Penjelasan                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Render-prop (`centerLabelComponent`)** | Pola di mana prop adalah function yang return JSX — library yang panggil, bukan kita                                    |
| **Stacked data shape**                   | Struktur `{ label, stacks: [...] }` berbeda dari bar biasa                                                              |
| **Multi-dataset chart**                  | Beberapa series di 1 chart pakai `data2`, `data3`, dst                                                                  |
| **Helper component pattern**             | Bungkus chart dalam `<ChartSection>` untuk konsistensi UI                                                               |
| **Library type quirks**                  | Beda chart bisa punya naming convention prop yang beda (`barLabelFontSize` vs `barLabelTextStyle`) — selalu cek `.d.ts` |

---

## Cara Coba

```bash
npm run start
```

Lalu buka:

- **Tab Apps → Galeri Chart**, atau
- **Sidebar → Mini Apps → Galeri Chart**, atau
- URL: `/apps/charts`

Scroll dari atas ke bawah untuk lihat 10 jenis chart berurutan.

---

## Coba Sendiri

1. **Tambah chart baru** — coba RadarChart atau LineChartBicolor dari library yang sama.
2. **Bikin interaktif** — onPress di bar untuk show tooltip detail.
3. **Pakai data real** — sambungkan ke hook (misal `useExpenses`, `useHabits`) supaya chart hidup sesuai data user.
4. **Library lain** — coba `victory-native` atau `react-native-skia` untuk chart yang lebih advanced.
5. **Animasi entrance** — wrap chart dengan `Animated.View` + `FadeIn` dari Reanimated.
