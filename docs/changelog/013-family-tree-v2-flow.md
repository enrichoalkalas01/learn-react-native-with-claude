# Changelog 013 — Silsilah v2 (Couple Group) + Flow View

**Tanggal:** 2026-05-12
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Duplikasi halaman silsilah dengan **2 pendekatan UI baru**:

1. **Silsilah v2** — UI tree yang dirapikan: pasangan suami-istri otomatis di-group jadi
   1 card. Anggota single / cerai tetap tampil sendiri.
2. **Silsilah Flow** — Visualisasi ala React Flow: canvas pan + pinch zoom, auto-layout
   tree dengan SVG connection lines antar node.

Halaman v1 lama **tidak diubah** (tetap ada untuk perbandingan).

---

## File yang Dibuat / Diubah

| File                            | Status   | Perubahan                                                        |
| ------------------------------- | -------- | ---------------------------------------------------------------- |
| `hooks/use-family-tree-v2.ts`   | **Baru** | Model + spouseId bidirectional, build `CoupleNode \| PersonNode` |
| `app/apps/family-tree-v2.tsx`   | **Baru** | UI list dengan couple grouping                                   |
| `app/apps/family-tree-flow.tsx` | **Baru** | Canvas pan/zoom + SVG edges                                      |
| `app/_layout.tsx`               | Diubah   | Register 2 route baru                                            |
| `app/(tabs)/apps.tsx`           | Diubah   | 2 kartu baru: 💑 v2 + 🌐 Flow                                    |
| `components/sidebar.tsx`        | Diubah   | 2 menu sidebar baru                                              |

---

## Akses

| Halaman                | URL                      | Storage Key                     |
| ---------------------- | ------------------------ | ------------------------------- |
| Silsilah v1 (original) | `/apps/family-tree`      | `@app/family-tree`              |
| Silsilah v2 (couple)   | `/apps/family-tree-v2`   | `@app/family-tree-v2`           |
| Silsilah Flow          | `/apps/family-tree-flow` | `@app/family-tree-v2` (sharing) |

V2 dan Flow **share data** — flow page cuma cara render lain dari hook yang sama.

---

## Bagian 1: Couple Grouping (v2)

### Data Model Ditambah `spouseId`

```ts
type FamilyMember = {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  parentId: string | null;
  spouseId?: string | null; // ← baru
  note?: string;
};
```

### Aturan Couple

Dua member dianggap **pasangan** kalau saling mengakui:

```ts
function isMutualSpouse(a, members) {
  if (!a.spouseId) return null;
  const b = members.find((m) => m.id === a.spouseId);
  if (!b || b.spouseId !== a.id) return null; // harus mutual!
  return b;
}
```

Kalau cuma sebelah pihak (A → B, tapi B → null), bukan pasangan — tampil sendiri.
Ini matching dengan request user: _"kalau parent nya 1 atau ada kemungkinan
berpisah, maka dibuat 1 per 1 seperti sekarang"_.

### Tree Node: Union Type

Tree builder sekarang return discriminated union:

```ts
type PersonNode = {
  type: 'person';
  member: FamilyMember;
  children: TreeNode[];
  generation: number;
};
type CoupleNode = { type: 'couple'; id: string; primary; spouse; children; generation };
type TreeNode = PersonNode | CoupleNode;
```

Anak dari couple = **union** anak dari kedua spouse (parentId bisa menunjuk ke
salah satu, bukan keduanya):

```ts
const kidsA = childrenByParent.get(m.id) ?? [];
const kidsB = childrenByParent.get(spouse.id) ?? [];
const merged = [...kidsA, ...kidsB].filter((c) => !consumed.has(c.id));
```

### Pattern: `consumed` Set untuk Cegah Render Ganda

Kalau A spouse-nya B, dan kita mulai dari A → emit `couple{A,B}`. B sudah
"dikonsumsi" — saat iterasi roots berikutnya sampai ke B, skip.

```ts
const consumed = new Set<string>();

const buildNode = (m, generation) => {
  consumed.add(m.id);
  const spouse = isMutualSpouse(m, members);
  if (spouse && !consumed.has(spouse.id)) {
    consumed.add(spouse.id);
    return { type: 'couple', primary: m, spouse, children: ... };
  }
  return { type: 'person', member: m, children: ... };
};

for (const root of roots) {
  if (consumed.has(root.id)) continue;
  result.push(buildNode(root, 0));
}
```

### Sinkron Spouse 2-arah saat CRUD

Kunci: saat user set A.spouseId = B, kita harus set B.spouseId = A juga.
Dan kalau B sebelumnya punya pasangan C, putuskan C.spouseId.

```ts
const updateMember = (id, patch) => {
  setMembers((prev) => {
    const member = prev.find((m) => m.id === id);
    const newSpouseId = patch.spouseId ?? member.spouseId;

    return prev.map((m) => {
      if (m.id === id) return { ...m, ...patch };
      // Lepas link mantan
      if (member.spouseId && m.id === member.spouseId && newSpouseId !== m.id)
        return { ...m, spouseId: null };
      // Set link baru di calon pasangan
      if (newSpouseId && m.id === newSpouseId) return { ...m, spouseId: id };
      // Putus rival
      if (newSpouseId && m.spouseId === newSpouseId && m.id !== id)
        return { ...m, spouseId: null };
      return m;
    });
  });
};
```

Saat delete member, semua yang spouseId-nya menunjuk dia di-null-kan juga.

### UI: CoupleCard vs PersonCard

```tsx
{node.type === 'couple' ? (
  <CoupleCard ... />        // 2 person tiles side-by-side dgn ❤️
) : (
  <PersonCard ... />        // 1 card seperti v1
)}
```

Couple card punya:

- Header badge 💑 Pasangan + tombol collapse
- 2 tile (primary + spouse) dengan masing-masing Edit / Hapus
- Footer: tombol "+ Anak (mereka)" + tombol "Pisahkan"

Tombol **Pisahkan** = panggil `updateMember(primary.id, { spouseId: null })` —
otomatis lepas link 2 arah, mereka tampil terpisah.

---

## Bagian 2: Flow View (React Flow style)

### Konsep

Bukan list vertikal, tapi **infinite canvas**:

- Node = card absolutely-positioned
- Edge = SVG line dari parent ke child
- Pan (1 jari) untuk geser canvas
- Pinch (2 jari) untuk zoom

Mirip-mirip React Flow di web, diimplementasi pakai:

- `react-native-gesture-handler` untuk Pan + Pinch
- `react-native-reanimated` untuk transform shared value
- `react-native-svg` untuk lines

### Pattern 1: Auto-Layout Tree

```ts
function buildLayout(roots) {
  let cursor = PADDING;

  const place = (node, depth) => {
    const myW = node.type === 'couple' ? COUPLE_W : NODE_W;
    const myY = PADDING + depth * (NODE_H + V_GAP);
    let myX;

    if (node.children.length === 0) {
      // Leaf: ambil slot berikutnya
      myX = cursor;
      cursor += myW + H_GAP;
    } else {
      // Inner: layout anak dulu, lalu posisikan diri di tengah anak-anak
      const placements = node.children.map((c) => place(c, depth + 1));
      const first = placements[0];
      const last = placements[placements.length - 1];
      myX = (first.x + last.x + last.w) / 2 - myW / 2;
    }

    items.push({ node, x: myX, y: myY, w: myW, h: NODE_H, ... });
    return { x: myX, w: myW };
  };

  for (const root of roots) place(root, 0);
}
```

Kunci: **rekursif post-order**. Anak ditempatkan dulu, parent ditengahkan di atas
mereka. Cursor global supaya semua leaf tidak overlap.

### Pattern 2: Pan + Pinch dengan Reanimated

```tsx
const tx = useSharedValue(0);
const ty = useSharedValue(0);
const scale = useSharedValue(1);
const savedTx = useSharedValue(0);
const savedTy = useSharedValue(0);
const savedScale = useSharedValue(1);

const panGesture = Gesture.Pan()
  .minDistance(8) // ← tap pada Pressable tidak terganggu
  .onStart(() => {
    savedTx.value = tx.value;
    savedTy.value = ty.value;
  })
  .onUpdate((e) => {
    tx.value = savedTx.value + e.translationX;
    ty.value = savedTy.value + e.translationY;
  });

const pinchGesture = Gesture.Pinch()
  .onStart(() => {
    savedScale.value = scale.value;
  })
  .onUpdate((e) => {
    scale.value = Math.max(0.4, Math.min(2.2, savedScale.value * e.scale));
  });

const composed = Gesture.Simultaneous(panGesture, pinchGesture);
```

**Pattern saved-value:** simpan nilai awal di `onStart`, lalu hitung delta di
`onUpdate`. Tanpa ini, tiap event akan tambahkan delta secara absurd (gesture
events bersifat absolute dari titik mulai).

`minDistance(8)` di Pan — kalau jari geser < 8px, tidak dianggap pan. Ini penting
biar tap pada Pressable node tidak ke-intercept jadi pan.

### Pattern 3: Composed Gesture untuk Multi-Touch

```ts
Gesture.Simultaneous(panGesture, pinchGesture);
```

Berarti pan dan pinch boleh aktif **berbarengan**. User bisa 2-jari geser sambil
pinch, kedua-duanya update shared value masing-masing.

Alternatif:

- `Gesture.Exclusive(a, b)` — cuma satu, prioritas yang lebih spesifik dulu
- `Gesture.Race(a, b)` — yang trigger duluan menang, yang lain di-cancel

### Pattern 4: Transform Animated View

```tsx
const canvasStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: tx.value },
    { translateY: ty.value },
    { scale: scale.value },
  ],
}));

<GestureDetector gesture={composed}>
  <Animated.View
    style={[
      { position: 'absolute', width: layout.width, height: layout.height },
      canvasStyle,
    ]}>
    <Svg>{/* edges */}</Svg>
    {layout.items.map((item) => <FlowNode ... />)}
  </Animated.View>
</GestureDetector>
```

Karena translate dilakukan via `transform` (bukan layout), animasi smooth di
60fps (worklet, di UI thread).

### Pattern 5: SVG Connection Lines (Right-Angle)

```tsx
<Svg width={layout.width} height={layout.height} style={{ position: 'absolute' }}>
  {layout.edges.map((e, i) => {
    const midY = (e.fromY + e.toY) / 2;
    // M = move, L = line. Right-angle path: turun, geser horizontal, turun lagi.
    const d = `M ${e.fromX} ${e.fromY} L ${e.fromX} ${midY} L ${e.toX} ${midY} L ${e.toX} ${e.toY}`;
    return <Path key={i} d={d} stroke="#9ca3af" strokeWidth={2} fill="none" />;
  })}
</Svg>
```

Bentuk **right-angle** (siku-siku) lebih cocok untuk hierarchical tree drawing
karena jelas mana parent mana child. Alternatif: Bezier curve (`C` command)
untuk garis melengkung.

### Pattern 6: Dot Grid Background

Untuk feel "canvas" mirip Figma/React Flow:

```tsx
const dots: { x: number; y: number }[] = [];
const step = 24;
for (let y = 0; y < height; y += step) {
  for (let x = 0; x < width; x += step) {
    dots.push({ x, y });
  }
}

return (
  <Svg width={width} height={height} style={{ position: 'absolute' }}>
    {dots.map((d, i) => (
      <Path
        key={i}
        d={`M ${d.x} ${d.y} L ${d.x + 0.5} ${d.y}`}
        stroke="#e5e7eb"
        strokeWidth={1.5}
      />
    ))}
  </Svg>
);
```

Garis 0.5px = titik. SVG circle juga bisa tapi Path lebih ringan kalau banyak
elemen.

### Pattern 7: Tap-untuk-Aksi (Alert Menu)

Modal form kompleks tidak praktis di canvas. Solusi: tap node → `Alert.alert`
dengan multi-option:

```ts
const openMenu = (m: FamilyMember) => {
  Alert.alert(m.name, `Aksi untuk ${m.name}`, [
    { text: 'Batal', style: 'cancel' },
    { text: '+ Tambah Anak', onPress: () => openAdd(m.id) },
    { text: 'Edit', onPress: () => openEdit(m) },
    {
      text: 'Hapus',
      style: 'destructive',
      onPress: () => {
        /* nested confirm */
      },
    },
  ]);
};
```

iOS bisa lebih dari 3 tombol; Android bisa 3 (Batal/Negatif/Positif/Netral).
Untuk delete dengan keturunan, pakai **nested Alert** (Alert di dalam onPress
Alert).

### Pattern 8: Fit-to-Screen Calculation

```ts
const fitToScreen = () => {
  const sx = (screen.width - 40) / layout.width;
  const sy = (screen.height - 240) / layout.height;
  const s = Math.min(sx, sy, 1); // jangan zoom in melebihi 1
  scale.value = withTiming(Math.max(0.4, s), { duration: 250 });
  tx.value = withTiming(0);
  ty.value = withTiming(0);
};
```

Hitung scale di X dan Y, ambil minimum supaya seluruh canvas masuk viewport.
Clamp di 0.4–1 supaya kalau pohonnya kecil tidak zoom in berlebihan.

---

## Konsep Baru Diintroduksi

| Konsep                               | Penjelasan                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| **Discriminated union type**         | `type TreeNode = PersonNode \| CoupleNode` — narrow via `node.type === 'couple'` |
| **Mutual reference validation**      | Spouse dianggap valid hanya kalau saling refer (cegah inkonsisten state)         |
| **`consumed` set pattern**           | Cegah render duplikat saat traversal forest dgn pasangan                         |
| **Bidirectional state sync**         | Set A→B otomatis set B→A; delete A juga clear semua link ke A                    |
| **Tree auto-layout (post-order)**    | Letak anak dulu, parent ditengahkan di atas mereka                               |
| **Reanimated shared value**          | `useSharedValue` untuk state yang di-update di UI thread                         |
| **Pan + Pinch gesture**              | `Gesture.Pan()`, `Gesture.Pinch()`, `Gesture.Simultaneous(...)`                  |
| **`minDistance` pada Pan**           | Threshold supaya tap tidak ke-intercept jadi pan                                 |
| **Saved-value pattern di onStart**   | Snapshot nilai saat gesture mulai, hitung delta dari sana                        |
| **SVG `Path` "M L"**                 | Path syntax untuk garis siku-siku connection                                     |
| **Transform via `useAnimatedStyle`** | Pan/zoom pakai transform CSS, smooth 60fps di UI thread                          |

---

## Cara Coba

### Silsilah v2 (Couple)

1. Buka **Apps → 💑 Silsilah v2 (Couple Group)**
2. Lihat: Pak Karto + Bu Sari muncul **1 card** (pasangan).
   Di bawahnya: Pak Budi + Bu Lina (couple), Bu Wati (sendiri — single parent).
3. Tap "+ Anak" di couple Pak Budi → form, parent sudah ke-set
4. **Pisahkan**: tap tombol "Pisahkan" pada couple → mereka jadi 2 card terpisah
5. **Re-pair**: edit salah satu, set spouseId ke yang lain → balik jadi couple
6. **Add member dgn pasangan**: tambah anggota baru, pilih pasangan di chip
   "Pasangan" → otomatis 2-arah

### Silsilah Flow (React Flow style)

1. Buka **Apps → 🌐 Silsilah Flow**
2. **Pan**: 1 jari geser canvas
3. **Zoom**: 2 jari pinch in/out
4. **Fit**: tap tombol "Fit" → seluruh pohon masuk viewport
5. **Reset**: kembali ke (0,0) zoom 100%
6. **Tap node**: muncul Alert menu — Edit / + Anak / Hapus
7. **+ Add** di top bar: tambah leluhur baru
8. Pohon multi-generasi → couple Andi+Maya dengan anak Kenzo

---

## Coba Sendiri

1. **Drag node** — bikin node bisa di-drag posisinya (override auto-layout)
2. **Bezier curves** — ganti right-angle pakai SVG `C` path biar smooth
3. **Mini-map** — viewport kecil di pojok yang nunjukkin posisi user di canvas
4. **Selection state** — tap node = highlight, multi-select dgn long-press
5. **Drag-connect** — drag dari node A ke node B = bikin parent-child link
6. **Layout algorithm** — implement Reingold-Tilford yang lebih rapi
7. **Search & focus** — input search nama, tekan enter → animate pan ke node tsb
8. **Export to image** — capture canvas → save ke galeri (react-native-view-shot)
9. **Banyak generasi tampak ringkas** — auto-collapse kalau zoom < 0.6
10. **Marriage line khusus** — garis antar 2 spouse yang nikah masuk (saat ini
    spouse "menikah masuk" tampak terpisah di canvas)
