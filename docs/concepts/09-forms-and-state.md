# Konsep 09 — Forms & State Management

Pelajaran ini muncul saat membangun 4 mini-app di [changelog 003](../changelog/003-mini-apps.md).
Fokusnya: **bagaimana mengelola form input dan state turunannya** dengan cara React-style.

---

## 1. Controlled Component (TextInput)

Di React Native, `TextInput` adalah versi controlled-component dari input HTML:

```tsx
const [input, setInput] = useState('');

<TextInput
  value={input} // value selalu mengikuti state
  onChangeText={setInput} // setiap user mengetik, update state
  placeholder="Tambah task..."
/>;
```

**Aturannya sederhana:**

- `value` ← dari state
- `onChangeText` → ke setter

Karena UI selalu mengikuti state, kamu bisa:

- Reset input → `setInput('')`
- Pre-fill dari data lain → `setInput(post.title)`
- Validasi sebelum simpan → cek `input.trim()`

### Props penting TextInput

| Prop                   | Fungsi                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| `placeholder`          | Hint teks saat input kosong                                             |
| `placeholderTextColor` | Warna placeholder (RN tidak respect Tailwind di sini)                   |
| `keyboardType`         | Jenis keyboard: `default`, `numeric`, `email-address`, `phone-pad`, dll |
| `returnKeyType`        | Label tombol enter di keyboard: `done`, `next`, `search`, `send`        |
| `onSubmitEditing`      | Callback saat user tekan enter di keyboard                              |
| `secureTextEntry`      | True untuk password (text di-mask)                                      |
| `autoCapitalize`       | `none`, `sentences`, `words`, `characters`                              |
| `multiline`            | True untuk text area                                                    |

---

## 2. Update State Immutable

Di React, state **TIDAK BOLEH** di-mutate langsung:

```tsx
// ❌ SALAH — mutasi langsung, React tidak akan re-render
todos.push(newTodo);
todos[0].done = true;
setTodos(todos); // sama saja, reference array tetap sama

// ✅ BENAR — return array/object baru
setTodos((prev) => [...prev, newTodo]);
setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
```

### Tiga Pola Wajib

**Tambah:**

```tsx
setItems((prev) => [...prev, newItem]); // tambah di akhir
setItems((prev) => [newItem, ...prev]); // tambah di awal
```

**Update item tertentu:**

```tsx
setItems((prev) =>
  prev.map((item) => (item.id === id ? { ...item, name: 'baru' } : item))
);
```

**Hapus:**

```tsx
setItems((prev) => prev.filter((item) => item.id !== id));
```

### Functional Updater vs Direct

```tsx
// Direct — pakai snapshot state saat onClick dipanggil
setCount(count + 1);

// Functional — selalu pakai state TERBARU dari React
setCount((prev) => prev + 1);
```

**Pakai functional updater** kalau:

- Update bergantung pada state sebelumnya (paling aman selalu pakai ini)
- State di-update beberapa kali berturut-turut
- Update di dalam async callback / setTimeout

---

## 3. Nested Immutable Update

Yang paling sering bikin bingung — update properti dalam item dalam array:

```tsx
type Habit = { id: string; days: boolean[] };
const [habits, setHabits] = useState<Habit[]>([]);

// Toggle day ke-3 di habit dengan id 'h1'
setHabits((prev) =>
  prev.map((h) =>
    h.id === 'h1' ? { ...h, days: h.days.map((d, i) => (i === 3 ? !d : d)) } : h
  )
);
```

**Cara baca dari luar ke dalam:**

1. `prev.map((h) => ...)` → array habits baru
2. `h.id === 'h1' ? ... : h` → kalau habit yang dimaksud, ganti; selainnya pakai apa adanya
3. `{ ...h, days: ... }` → object habit baru dengan reference baru
4. `h.days.map((d, i) => ...)` → array days baru
5. `i === 3 ? !d : d` → kalau index ke-3 toggle, selainnya pakai apa adanya

> Pelajaran kunci: **setiap level yang kamu ubah harus jadi reference baru**. Yang tidak diubah boleh pakai reference lama.

Untuk state nested yang dalam, library seperti `immer` bisa membantu — tapi pelajari pattern manual ini dulu.

---

## 4. Derived State dengan useMemo

**Derived state** = nilai yang dihitung dari state lain. Jangan disimpan sebagai state terpisah:

```tsx
// ❌ JANGAN — duplikasi data, gampang out-of-sync
const [todos, setTodos] = useState<Todo[]>([]);
const [activeTodos, setActiveTodos] = useState<Todo[]>([]); // bahaya!

// ✅ HITUNG dari state utama
const activeTodos = todos.filter((t) => !t.done);
```

Kalau perhitungannya berat (filter ribuan item, sort kompleks), bungkus dengan `useMemo`:

```tsx
const filtered = useMemo(() => {
  return todos.filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));
}, [todos, search]);
```

`useMemo` menyimpan hasil dan **hanya menghitung ulang** kalau dependency (`todos`, `search`) berubah.

### Kapan TIDAK perlu useMemo

- List kecil (< 100 item)
- Komputasi sederhana (just filter/map sekali)
- Komponen tidak sering re-render

`useMemo` punya overhead sendiri — pemakaian sembarangan justru bikin lebih lambat.

---

## 5. Form Number Input — Pattern Aman

Untuk input angka, **simpan sebagai string**, parse saat butuh:

```tsx
const [billText, setBillText] = useState('');

// Sanitasi: buang karakter non-digit
const bill = useMemo(() => {
  const clean = billText.replace(/[^\d]/g, '');
  return parseInt(clean || '0', 10);
}, [billText]);

<TextInput value={billText} onChangeText={setBillText} keyboardType="numeric" />;
```

**Kenapa simpan string?**

- User mengetik `'1'` → state `1` → tampil `1` ✓
- User backspace → state `''` → kalau pakai number, akan jadi `0` atau `NaN` → bingung di UI
- User mengetik koma/titik di tengah → string mempertahankan input mentah

Pattern ini juga kepake untuk: tanggal (format `YYYY-MM-DD`), nomor telepon, kode OTP.

---

## 6. State Machine dengan String Literal

Daripada banyak boolean, pakai satu state dengan tipe union:

```tsx
// ❌ Susah maintain — kombinasi mana yang valid?
const [isLoading, setIsLoading] = useState(false);
const [isAnswered, setIsAnswered] = useState(false);
const [isFinished, setIsFinished] = useState(false);

// ✅ Eksplisit — hanya bisa salah satu dari nilai ini
type Status = 'idle' | 'loading' | 'answered' | 'finished';
const [status, setStatus] = useState<Status>('idle');

// Cek mudah, tipe aman
if (status === 'answered') { ... }
```

State machine string literal:

- TypeScript mencegah typo (`'asnwered'` → error)
- Tidak mungkin "loading sekaligus answered"
- Switch case lebih clean

---

## 7. Dynamic className di NativeWind

NativeWind tidak bisa interpolasi nilai dinamis ke nama kelas:

```tsx
// ❌ TIDAK BEKERJA — Tailwind compiler tidak tahu ini class apa
<View className={`bg-${color}-500`} />
<View className={`w-${percent}`} />

// ✅ Pakai string lengkap berdasarkan kondisi
<View className={isActive ? 'bg-blue-500' : 'bg-gray-200'} />

// ✅ Untuk nilai dinamis (width, height numerik), pakai inline style
<View
  className="h-2 bg-primary rounded-full"
  style={{ width: `${percent}%` }}
/>
```

**Aturannya:** kelas Tailwind harus muncul **literal** di file agar di-scan compiler. Komposisi via konkatenasi runtime tidak akan dikompilasi.

### Pattern Untuk Banyak Kondisi

```tsx
// Pendek — pakai ternary
<Text className={done ? 'text-gray-400 line-through' : 'text-gray-900'} />;

// Banyak cabang — pakai let + assignment
let optionClass = 'bg-white border-gray-200';
if (isAnswered && isCorrect) optionClass = 'bg-green-50 border-green-500';
else if (isAnswered && isSelected) optionClass = 'bg-red-50 border-red-500';

<View className={optionClass} />;
```

---

## 8. Cheatsheet — useState Pattern

```tsx
// ── Primitive state ────────────────────────────
const [count, setCount] = useState(0);
setCount(count + 1); // OK kalau cuma sekali
setCount((prev) => prev + 1); // PALING AMAN

// ── Object state ───────────────────────────────
const [user, setUser] = useState({ name: '', age: 0 });
setUser((prev) => ({ ...prev, name: 'Budi' }));

// ── Array of primitives ────────────────────────
const [tags, setTags] = useState<string[]>([]);
setTags((prev) => [...prev, 'baru']);
setTags((prev) => prev.filter((t) => t !== 'lama'));

// ── Array of objects ───────────────────────────
const [items, setItems] = useState<Item[]>([]);
setItems((prev) => [...prev, newItem]);
setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: true } : i)));
setItems((prev) => prev.filter((i) => i.id !== id));

// ── Toggle boolean ─────────────────────────────
const [open, setOpen] = useState(false);
setOpen((prev) => !prev);
```

---

## Bacaan Lanjutan

- React docs — [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- React docs — [Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- React docs — [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
- NativeWind docs — [Dynamic styles](https://www.nativewind.dev/) (cari "dynamic")
