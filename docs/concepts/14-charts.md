# 14 — Charts & Data Visualization

Cara membuat visualisasi data di React Native pakai `react-native-gifted-charts`.

---

## Kenapa Butuh Library Chart?

React Native tidak punya `<canvas>` atau `<svg>` native seperti web. Kalau mau gambar chart manual, harus pakai `react-native-svg` dan menggambar shape satu-satu — ribet & banyak math.

**Library chart** = wrapper yang sudah handle:

- Kalkulasi koordinat (data → posisi pixel)
- Scaling axis (nilai → tinggi bar)
- Animasi entrance
- Touch/tap interaction
- Tooltip & label

Project ini pakai **`react-native-gifted-charts`** karena:

- API simple & konsisten antar jenis chart
- Sudah pakai `react-native-svg` di bawah (sudah ter-install)
- Support hampir semua chart umum (line, bar, pie, radar, pyramid)
- Tipe TypeScript bawaan

---

## Anatomi Chart

Semua chart umumnya punya 4 bagian:

```
       │                      ← y-axis label
   100 ┤   ●─●                  ← grid line
       │  /   \
    75 ┤ ●     ●─●              ← data point (line)
       │/         \
    50 ┤●          ●            ← line / bar
       │
    25 ┤
       │
     0 ┴─Sen─Sel─Rab─Kam─Jum   ← x-axis label
```

| Bagian      | Prop di gifted-charts                          |
| ----------- | ---------------------------------------------- |
| Data points | `data={[{ value, label }]}`                    |
| Y-axis      | `yAxisColor`, `yAxisTextStyle`, `noOfSections` |
| X-axis      | `xAxisColor`, `xAxisLabelTextStyle`            |
| Grid line   | `rulesColor`, `rulesType`, `hideRules`         |
| Spacing     | `initialSpacing`, `spacing`                    |

---

## Jenis-jenis Chart & Kapan Pakai Mana

### Line Chart

**Pakai untuk:** Data time-series, trend over time.

```tsx
<LineChart
  data={[
    { value: 50, label: 'Sen' },
    { value: 80, label: 'Sel' },
    { value: 45, label: 'Rab' },
  ]}
  color="#0a7ea4"
  thickness={3}
/>
```

Variasi:

- `curved` — line jadi smooth (bukan zigzag tajam)
- `areaChart` — isi area di bawah line dengan warna
- `data2`, `data3` — tambah dataset untuk comparison

### Bar Chart

**Pakai untuk:** Bandingkan nilai antar kategori discrete.

```tsx
<BarChart
  data={[
    { value: 35, label: 'A', frontColor: '#0a7ea4' },
    { value: 50, label: 'B', frontColor: '#0a7ea4' },
  ]}
  barWidth={28}
  barBorderRadius={6}
/>
```

Variasi:

- `stackData` — bar bertingkat (stacked)
- `horizontal` (kalau ada) — bar memanjang ke kanan
- Beda warna per bar — set `frontColor` per item

### Pie Chart

**Pakai untuk:** Proporsi / persentase yang totalnya 100%.

```tsx
<PieChart
  data={[
    { value: 40, color: '#0a7ea4' },
    { value: 25, color: '#f59e0b' },
  ]}
  radius={90}
/>
```

Variasi:

- `donut` + `innerRadius` — pie dengan lubang
- `centerLabelComponent` — JSX di tengah donut
- `semiCircle` — setengah lingkaran (gauge style)

### Population Pyramid

**Pakai untuk:** Bandingkan 2 grup per kategori, horizontal mirror.

```tsx
<PopulationPyramid
  data={[{ left: 12, right: 14 }]}
  leftBarColor="#0a7ea4"
  rightBarColor="#ec4899"
/>
```

Klasik untuk demografi (pria/wanita per umur), tapi bisa juga untuk before/after, win/loss, dll.

---

## Pattern: Build Data dengan `useMemo`

Chart re-render setiap kali data berubah. Kalau data hasil transformasi (filter, group, sort) — bungkus dengan `useMemo` supaya tidak re-calculate setiap render.

```tsx
const breakdown = useMemo(() => buildExpenseBreakdown(transactions), [transactions]);

<PieChart data={breakdown.slices} />;
```

Tanpa `useMemo`: setiap render → group ulang transactions → bikin array baru → chart re-render (walau data sama secara logika).

---

## Pattern: Group by Category (Reduce)

Pattern paling umum: list of transactions → group by category → array slices.

```tsx
function groupByCategory(items) {
  const byCategory = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount;
  }

  return Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1]) // urutkan dari terbesar
    .map(([category, amount], i) => ({
      category,
      amount,
      color: COLORS[i % COLORS.length], // rotasi palette warna
    }));
}
```

Pakai pola ini untuk:

- Pie chart breakdown expense
- Bar chart top categories
- Donut chart task completion

---

## Pattern: Render-Prop (`centerLabelComponent`)

Donut chart punya space kosong di tengah. Library expose render-prop untuk isi space itu:

```tsx
<PieChart
  donut
  centerLabelComponent={() => (
    <View className="items-center">
      <Text>Total</Text>
      <Text className="font-bold">Rp 1.500.000</Text>
    </View>
  )}
/>
```

**Render-prop** = prop yang nilainya function yang return JSX. Library yang panggil function ini saat render. Bedanya dengan children: render-prop bisa di-positioning oleh library, children langsung di-pass.

---

## Pattern: Custom Legend

Legend bawaan library terbatas. Bikin sendiri supaya lebih kontrol:

```tsx
function Legend({ items }) {
  return (
    <View className="flex-row flex-wrap gap-4">
      {items.map((item) => (
        <View key={item.label} className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <Text>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
```

Pair dengan chart yang tidak punya label inline (donut, stacked bar).

---

## Tips & Gotchas

### 1. `width` & `height` Harus Dihitung

Library tidak auto-fit ke container. Kalau parent flexible, hitung manual atau pakai `Dimensions.get('window').width - padding`.

### 2. Warna Konsisten Antar Chart

Definisikan palette di constants:

```tsx
const COLORS = ['#0a7ea4', '#f59e0b', '#22c55e', '#ec4899', '#a855f7'];
```

Pakai `COLORS[i % COLORS.length]` supaya tidak out-of-range kalau data > 5 item.

### 3. Props Naming Bisa Beda Antar Chart

- `LineChart` pakai `dataPointsColor`
- `BarChart` pakai `frontColor`
- `PopulationPyramid` pakai `leftBarColor` / `rightBarColor`

Cek type definition di `.d.ts` kalau ragu — jangan asal copy dari chart lain.

### 4. Dark Mode

Pakai NativeWind class di **wrapper** card, bukan di chart props. Axis color tetap pakai hex (chart pakai SVG, bukan className).

```tsx
<View className="bg-white dark:bg-gray-800 p-4 rounded-2xl">
  <LineChart
    yAxisColor="#e5e7eb" // tetap hex
    yAxisTextStyle={{ color: '#9ca3af' }}
  />
</View>
```

Kalau mau axis warnanya beda di dark mode, pakai `useColorScheme()` lalu pilih hex sesuai mode.

### 5. Performance Tips

- Data > 100 points: pertimbangkan downsampling (ambil tiap N point)
- Animasi chart: prop `isAnimated` (default true) — matikan kalau lag
- Banyak chart di 1 screen: bungkus `ScrollView` + lazy render dengan `IntersectionObserver` pattern

---

## Library Alternatif

Kalau gifted-charts kurang cocok:

| Library                      | Strength                                             | Weakness                                 |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| **Victory Native**           | API mirip Victory web, sangat fleksibel              | Lebih berat, learning curve              |
| **react-native-skia**        | Skia engine native, performant, custom drawing bebas | Lebih low-level, perlu lebih banyak code |
| **react-native-svg-charts**  | Sudah lama, stabil                                   | Maintenance lambat, API agak dated       |
| **echarts-for-react-native** | ECharts power (banyak chart exotic)                  | Bundle besar, pakai webview              |

Untuk project belajar / dashboard sederhana → stick dengan **gifted-charts**.
Untuk visualisasi data science / heavy custom → **Victory Native** atau **Skia**.

---

## Lihat Implementasinya

- `app/apps/charts.tsx` — galeri 10 jenis chart (Galeri Chart)
- `app/apps/expenses.tsx` — pie chart real dengan data dari `useExpenses` hook

Buka via tab **Apps → Galeri Chart**.
