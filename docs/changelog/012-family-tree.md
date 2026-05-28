# Changelog 012 — Silsilah Keluarga (Family Tree CRUD)

**Tanggal:** 2026-05-12
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Tambah halaman **Silsilah Keluarga** — pohon keluarga (forest) dengan CRUD penuh:
tambah anggota, edit, hapus (cascade/promote), pilih orang tua, multi-generasi.
Data flat di state, disusun jadi tree pakai `useMemo`, persisten via AsyncStorage.

---

## File yang Dibuat / Diubah

| File                       | Status   | Perubahan                                        |
| -------------------------- | -------- | ------------------------------------------------ |
| `hooks/use-family-tree.ts` | **Baru** | State + CRUD + build tree dari list flat         |
| `app/apps/family-tree.tsx` | **Baru** | UI: tree rekursif + modal form (add/edit)        |
| `app/_layout.tsx`          | Diubah   | Register `Stack.Screen` untuk `apps/family-tree` |
| `app/(tabs)/apps.tsx`      | Diubah   | Tambah kartu 🌳 Silsilah Keluarga                |
| `components/sidebar.tsx`   | Diubah   | Tambah menu sidebar Silsilah Keluarga            |

---

## Akses

- Tab **Apps → Silsilah Keluarga** (icon 🌳)
- Sidebar **Mini Apps → Silsilah Keluarga**
- URL langsung: `/apps/family-tree`

---

## Data Model

Disimpan **flat** di state (bukan nested). Tiap anggota tahu siapa orang tuanya
via `parentId`. Struktur tree dibangun saat render dari list flat ini.

```ts
type Gender = 'male' | 'female';

type FamilyMember = {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  parentId: string | null; // null = leluhur (root)
  note?: string;
};
```

**Kenapa flat, bukan nested?** Tiga alasan:

1. **CRUD simple** — update / delete cukup `map` / `filter` 1 array. Kalau nested,
   tiap operasi harus rekursif clone tree.
2. **Persistence simple** — `JSON.stringify(members)` langsung jadi.
3. **Pindah parent** = ubah 1 field `parentId`, bukan unlink + relink subtree.

Bentuk tree hanya untuk **render**, dihitung on-the-fly via `useMemo`.

---

## Pattern Penting

### 1. Build Tree dari List Flat (`useMemo`)

```ts
const tree = useMemo<FamilyNode[]>(() => {
  // 1. Index by parent: { parentId -> children[] }
  const byParent = new Map<string | null, FamilyMember[]>();
  for (const m of members) {
    const key = m.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(m);
  }

  // 2. Recursive build dimulai dari roots (parentId === null)
  const build = (m: FamilyMember, generation: number): FamilyNode => ({
    ...m,
    generation,
    children: (byParent.get(m.id) ?? [])
      .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0))
      .map((child) => build(child, generation + 1)),
  });

  return (byParent.get(null) ?? []).map((root) => build(root, 0));
}, [members]);
```

**Kenapa pakai `Map`?** Lookup O(1) per parentId. Kalau pakai `filter` di setiap
node, jadi O(n²). Untuk pohon kecil tidak terasa, tapi pattern-nya benar.

`generation` di-pass ke anak (`generation + 1`) sambil traverse — ini cara
hitung kedalaman tree tanpa second pass.

### 2. Komponen Rekursif (`TreeBranch`)

Karena tree bisa nested berapapun level, render-nya rekursif:

```tsx
function TreeBranch({ node, ... }) {
  return (
    <View>
      <NodeCard node={node} />
      {isOpen && node.children.length > 0 ? (
        <View className="ml-5 pl-3 border-l-2 border-gray-200">
          {node.children.map((child) => (
            <TreeBranch key={child.id} node={child} ... />
          ))}
        </View>
      ) : null}
    </View>
  );
}
```

Pola umum di React: **komponen yang render dirinya sendiri**. Akhirnya berhenti
kalau `children` kosong. Setiap level dapat indent (`ml-5`) + garis vertikal
(`border-l-2`) supaya visual mirip tree.

### 3. Delete: Cascade vs Promote

Pas hapus anggota yang punya anak, ada 2 strategi yang biasa dipakai di
hierarchical data:

| Mode      | Efek                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `promote` | Anak naik 1 level ke kakeknya (parentId anak → parentId dari yang dihapus) |
| `cascade` | Hapus juga seluruh keturunan                                               |

```ts
const deleteMember = (id: string, mode: 'cascade' | 'promote') => {
  setMembers((prev) => {
    const target = prev.find((m) => m.id === id);
    if (!target) return prev;

    if (mode === 'promote') {
      return prev
        .filter((m) => m.id !== id)
        .map((m) => (m.parentId === id ? { ...m, parentId: target.parentId } : m));
    }

    // cascade: BFS kumpulkan descendant
    const descendants = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const m of prev) {
        if (m.parentId && descendants.has(m.parentId) && !descendants.has(m.id)) {
          descendants.add(m.id);
          changed = true;
        }
      }
    }
    return prev.filter((m) => !descendants.has(m.id));
  });
};
```

UI pakai `Alert.alert` dengan **3 tombol** kalau anggota punya anak: Batal /
Hapus + naikkan anak / Hapus semua keturunan.

### 4. Cegah Cycle saat Pilih Parent

Saat edit anggota, calon parent tidak boleh dirinya sendiri **atau keturunannya**
(kalau diizinkan, jadi cycle: A → B → A).

```ts
const getInvalidParentIds = (memberId: string): Set<string> => {
  const invalid = new Set<string>([memberId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of members) {
      if (m.parentId && invalid.has(m.parentId) && !invalid.has(m.id)) {
        invalid.add(m.id);
        changed = true;
      }
    }
  }
  return invalid;
};
```

Algoritmanya: mulai dari `{memberId}`, terus tambah node yang parent-nya sudah
ada di set. Berhenti kalau tidak ada penambahan.

Di UI, dropdown parent di-filter dengan set ini supaya user **tidak bisa pilih
parent yang invalid**.

### 5. Modal Form (Add + Edit dalam 1 Form)

Pakai satu state `editingId: string | null`:

- `null` → tombol "Tambah", submit panggil `addMember`
- ada id → tombol "Simpan", submit panggil `updateMember`

```ts
const handleSubmit = () => {
  if (editingId) {
    ft.updateMember(editingId, payload);
  } else {
    ft.addMember(payload);
  }
  closeModal();
};
```

Modal pakai `<Modal>` bawaan React Native dengan `animationType="slide"` dan
`transparent` supaya background gelap kelihatan. `KeyboardAvoidingView` supaya
TextInput tidak ketutup keyboard di iOS.

### 6. Animasi List

Pakai Reanimated layout animation supaya add/delete smooth:

```tsx
<Animated.View
  entering={FadeIn.duration(180)}
  exiting={FadeOut.duration(120)}
  layout={LinearTransition.duration(200)}>
  ...
</Animated.View>
```

Hapus node → fade out → sibling-nya naik smooth. Tambah → fade in dari posisi
benar.

---

## Konsep Baru Diintroduksi

| Konsep                         | Penjelasan                                                         |
| ------------------------------ | ------------------------------------------------------------------ |
| **Flat vs nested data**        | Simpan flat di state, derive nested struktur saat render           |
| **Komponen rekursif**          | Function component yang panggil dirinya sendiri untuk tree         |
| **`useMemo` build tree**       | Hindari rekomputasi tree tiap render, cuma kalau `members` berubah |
| **`Map<K, V>` untuk indexing** | O(1) lookup, lebih cepat dari `Array.filter` berulang              |
| **Cascade vs promote delete**  | Pattern handling penghapusan di hierarchical data                  |
| **Cycle prevention**           | Cegah user bikin loop di tree dengan filter invalid parents        |
| **Modal pattern (add+edit)**   | Satu form di-share lewat `editingId` state                         |
| **`textAlignVertical="top"`**  | Android: bikin multiline TextInput mulai dari atas, bukan center   |

---

## Cara Coba

1. Buka **Apps → Silsilah Keluarga**
2. Lihat data contoh: 1 leluhur (Pak Karto) → 2 anak → 3 cucu
3. **Tambah anak**: tap tombol **+ Anak** di node mana pun → form muncul,
   parent sudah ke-set otomatis
4. **Tambah leluhur**: tap **+ Tambah Leluhur** di bawah → form muncul,
   parent default `null`
5. **Edit**: tap tombol **Edit** → form terisi data lama, bisa pindah parent
6. **Hapus daun** (tanpa anak): konfirmasi 1 tombol
7. **Hapus node yang punya anak**: pilih:
   - "Hapus + naikkan anak" → keturunan naik ke generasi atasnya
   - "Hapus semua keturunan" → cascade
8. **Collapse/expand**: tap ▼ di depan nama untuk hide/show keturunan
9. **Reset**: tombol "Reset ke contoh" di bawah → kembali ke seed data
10. **Persistence**: tutup app → buka lagi → data masih ada (AsyncStorage)

---

## Coba Sendiri

1. **Tampilan horizontal** — bikin layout pohon ke samping (generasi = kolom),
   garis penghubung pakai SVG
2. **Pasangan (spouse)** — tambah field `spouseId`, render pasangan di sebelah
   anggota
3. **Foto** — `expo-image-picker` untuk avatar tiap anggota
4. **Search & highlight** — input filter nama, highlight match
5. **Export/Import JSON** — share data via `expo-sharing`
6. **Drag & drop pindah parent** — pakai `react-native-gesture-handler`
7. **Validasi tahun lahir** — anak tidak boleh lahir sebelum orang tuanya
8. **Statistik lanjutan** — rata-rata umur, anggota paling banyak anak, dll.
