# Changelog 003 — 4 Mini Apps Tanpa Backend

**Tanggal:** 2026-05-06
**Tipe:** Feature
**Status:** Selesai

---

## Apa yang Dilakukan

Menambahkan **4 aplikasi sederhana tanpa API backend**, masing-masing di page terpisah, lengkap dengan satu hub tab "Apps" yang melisting semuanya:

1. **Todo List** (`/apps/todo`) — CRUD task, filter All/Active/Completed
2. **Habit Tracker** (`/apps/habits`) — checklist 7 hari + streak counter
3. **Tip Calculator** (`/apps/calculator`) — hitung tip + split per orang
4. **Quiz React Native** (`/apps/quiz`) — 7 soal multiple choice + scoring

Tujuannya: latihan konsep React Native dengan kasus nyata (state, list, form input, conditional rendering, derivasi data) tanpa perlu setup API.

---

## File yang Dibuat / Diubah

### File Baru

| File                                  | Fungsi                                                   |
| ------------------------------------- | -------------------------------------------------------- |
| `app/(tabs)/apps.tsx`                 | Tab "Apps" — hub yang menampilkan kartu untuk 4 mini-app |
| `app/apps/todo.tsx`                   | Todo List (Stack screen)                                 |
| `app/apps/habits.tsx`                 | Habit Tracker (Stack screen)                             |
| `app/apps/calculator.tsx`             | Tip Calculator (Stack screen)                            |
| `app/apps/quiz.tsx`                   | Quiz multiple choice (Stack screen)                      |
| `docs/concepts/09-forms-and-state.md` | Konsep TextInput, useState pattern, useMemo              |

### File Diubah

| File                            | Perubahan                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `app/(tabs)/_layout.tsx`        | Tambah tab "Apps" dengan icon `square.grid.2x2.fill`                             |
| `app/_layout.tsx`               | Register 4 Stack.Screen baru untuk `apps/*` agar header title-nya rapi           |
| `components/ui/icon-symbol.tsx` | Tambah mapping `doc.text.fill` → `description` & `square.grid.2x2.fill` → `apps` |
| `components/sidebar.tsx`        | Tambah 5 menu item baru (Apps + 4 mini-app)                                      |

---

## Struktur Routing yang Dihasilkan

```
URL                  File                              Lokasi UI
─────────────────────────────────────────────────────────────────────
/                    app/(tabs)/index.tsx              Tab Home
/explore             app/(tabs)/explore.tsx            Tab Explore
/posts               app/(tabs)/posts.tsx              Tab Posts
/posts/[id]          app/posts/[id].tsx                Stack screen
/apps                app/(tabs)/apps.tsx               Tab Apps (HUB)
/apps/todo           app/apps/todo.tsx                 Stack screen
/apps/habits         app/apps/habits.tsx               Stack screen
/apps/calculator     app/apps/calculator.tsx           Stack screen
/apps/quiz           app/apps/quiz.tsx                 Stack screen
```

**Pola yang dipakai:** sama persis dengan posts:

- File di dalam `(tabs)/` muncul sebagai tab — punya tab bar di bawah.
- File di luar `(tabs)/` (contoh: `apps/todo.tsx`) jadi Stack screen — punya tombol back, tab bar hilang saat dibuka. Cocok untuk drill-down.

---

## Flow 1: Todo List (`/apps/todo`)

### Konsep yang Dipraktikkan

- `useState` untuk array of objects
- Derivasi data dengan `useMemo` (filtered list)
- Form input dengan `TextInput` + controlled component
- Conditional rendering (empty state, filter)
- Update immutable (`map`, `filter`, spread)

### State Shape

```ts
type Todo = { id: string; text: string; done: boolean };

const [todos, setTodos] = useState<Todo[]>([...]);
const [input, setInput] = useState('');
const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
```

### Pola Update Immutable

```tsx
// Tambah → spread + prepend
setTodos((prev) => [{ id: '...', text, done: false }, ...prev]);

// Toggle → map
setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

// Hapus → filter
setTodos((prev) => prev.filter((t) => t.id !== id));
```

> Pelajaran penting: di React, **JANGAN** `todos.push()` atau `todos[i].done = true`. Selalu return array/object baru. Kalau tidak, React tidak tahu state berubah → komponen tidak re-render.

### useMemo untuk Filter

```tsx
const filtered = useMemo(() => {
  if (filter === 'active') return todos.filter((t) => !t.done);
  if (filter === 'completed') return todos.filter((t) => t.done);
  return todos;
}, [todos, filter]);
```

`useMemo` mencegah filter dihitung ulang saat ada state lain berubah (misal `input`). Untuk list 5 item ini sebenarnya overkill — tapi pola ini wajib dikuasai untuk list besar.

---

## Flow 2: Habit Tracker (`/apps/habits`)

### Konsep yang Dipraktikkan

- Nested update array (toggle 1 item dalam array dalam array)
- Reduce untuk agregasi
- Custom helper function di luar komponen
- Progress bar dengan inline style + width %

### State Shape

```ts
type Habit = {
  id: string;
  name: string;
  days: boolean[]; // panjang 7 = Senin-Minggu
};
```

### Toggle Hari di Habit Tertentu

Ini contoh **nested immutable update** — pattern yang sering bikin bingung:

```tsx
setHabits((prev) =>
  prev.map((h) =>
    h.id === habitId ? { ...h, days: h.days.map((d, i) => (i === dayIndex ? !d : d)) } : h
  )
);
```

- Outer `map` → cari habit yang mau diubah
- Object spread `{...h, days: ...}` → habit baru dengan reference baru
- Inner `map` → array `days` baru dengan satu nilai diubah

### Helper Function di Luar Komponen

```tsx
function calcStreak(days: boolean[]): number {
  let max = 0,
    curr = 0;
  for (const d of days) {
    if (d) {
      curr++;
      if (curr > max) max = curr;
    } else curr = 0;
  }
  return max;
}
```

Karena fungsi ini **murni** (tidak butuh state/props), letakkan **di luar** komponen — supaya tidak dibikin ulang setiap render.

### Progress Bar

```tsx
<View className="h-2 bg-gray-100 rounded-full overflow-hidden">
  <View className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
</View>
```

NativeWind tidak bisa interpolasi nilai dinamis ke kelas (mis. `w-${percent}`), jadi pakai inline `style` untuk width persen. Sisanya tetap pakai className.

---

## Flow 3: Tip Calculator (`/apps/calculator`)

### Konsep yang Dipraktikkan

- `keyboardType="numeric"` untuk input angka
- Sanitasi input string (`replace(/[^\d]/g, '')`)
- Multiple `useMemo` untuk derived values
- Format angka (`toLocaleString('id-ID')`)

### Input Numeric Aman

```tsx
const [billText, setBillText] = useState('');

// Selalu simpan sebagai string, parse saat butuh angka
const bill = useMemo(() => {
  const clean = billText.replace(/[^\d]/g, ''); // buang non-digit
  return parseInt(clean || '0', 10);
}, [billText]);
```

> Tip: jangan langsung simpan sebagai `number`, karena user belum tentu selesai mengetik. Simpan string mentah → parse saat dibutuhkan.

### Derivasi Beberapa Nilai dari useMemo

```tsx
const { tipAmount, totalAmount, perPerson, tipPerPerson } = useMemo(() => {
  const tip = bill * (tipPercent / 100);
  const total = bill + tip;
  return {
    tipAmount: tip,
    totalAmount: total,
    perPerson: total / Math.max(1, people),
    tipPerPerson: tip / Math.max(1, people),
  };
}, [bill, tipPercent, people]);
```

Satu `useMemo` bisa return beberapa nilai sekaligus dalam object. Lebih efisien daripada bikin 4 `useMemo` terpisah karena ketergantungannya sama.

`Math.max(1, people)` = guard division by zero.

### Format Rupiah Tanpa Library

```tsx
function formatIDR(amount: number): string {
  if (!isFinite(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}
```

JavaScript built-in `toLocaleString` sudah cukup untuk format dasar. Tidak perlu library ekstra.

---

## Flow 4: Quiz App (`/apps/quiz`)

### Konsep yang Dipraktikkan

- State machine sederhana (`'idle' | 'answered' | 'finished'`)
- Conditional rendering 2 layar (quiz vs hasil)
- Disabled state dengan `disabled` prop di Pressable
- Dynamic className berdasarkan banyak kondisi

### State Machine

```ts
type Status = 'idle' | 'answered' | 'finished';

const [status, setStatus] = useState<Status>('idle');
```

- `idle` → user belum jawab → option bisa diklik
- `answered` → sudah jawab → tampilkan benar/salah + tombol next
- `finished` → semua soal selesai → render layar hasil

State machine string literal lebih clear daripada banyak boolean (`isAnswered`, `isFinished`, dst.).

### Dynamic className

```tsx
let optionClass = 'bg-white border-gray-200';
let textClass = 'text-gray-900';

if (isAnswered) {
  if (isCorrect) {
    optionClass = 'bg-green-50 border-green-500';
    textClass = 'text-green-700 font-semibold';
  } else if (isSelected) {
    optionClass = 'bg-red-50 border-red-500';
    textClass = 'text-red-700';
  }
}

<Pressable className={`rounded-xl p-4 border-2 ${optionClass}`}>
  <Text className={textClass}>{opt}</Text>
</Pressable>;
```

Untuk styling yang bercabang banyak kondisi, **let** + assignment lebih readable daripada nested ternary.

### Layar Hasil — Early Return

```tsx
if (status === 'finished') {
  return <ResultScreen />;
}
return <QuizScreen />;
```

Pattern early return memisahkan dua layar yang sangat berbeda layoutnya — lebih clean daripada satu JSX besar dengan ternary.

---

## Update Routing — Stack.Screen Registration

Di `app/_layout.tsx` saya tambahkan 4 entry baru:

```tsx
<Stack.Screen name="apps/todo" options={{ title: 'Todo List', headerBackTitle: 'Apps' }} />
<Stack.Screen name="apps/habits" options={{ title: 'Habit Tracker', headerBackTitle: 'Apps' }} />
<Stack.Screen name="apps/calculator" options={{ title: 'Tip Calculator', headerBackTitle: 'Apps' }} />
<Stack.Screen name="apps/quiz" options={{ title: 'Quiz', headerBackTitle: 'Apps' }} />
```

**Catatan:** registrasi `Stack.Screen` ini **tidak wajib** untuk routing — Expo Router auto-discover semua file di `app/`. Tujuan registrasi adalah customize header (title, back button label) per screen. Tanpa ini, header akan pakai nama file sebagai title.

---

## Sidebar — Quick Access

Sidebar diperluas dengan 5 menu baru:

```tsx
const MENU_ITEMS = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Explore', href: '/explore', icon: '🧭' },
  { label: 'Posts', href: '/posts', icon: '📝' },
  { label: 'Apps', href: '/apps', icon: '🧩' },
  { label: 'Todo List', href: '/apps/todo', icon: '✅' },
  { label: 'Habit Tracker', href: '/apps/habits', icon: '🔥' },
  { label: 'Tip Calculator', href: '/apps/calculator', icon: '🧮' },
  { label: 'Quiz', href: '/apps/quiz', icon: '❓' },
];
```

Sekarang user bisa langsung jump ke mini-app tertentu tanpa harus lewat tab Apps dulu.

---

## Konsep Baru yang Diperkenalkan

| Konsep                           | Pertama muncul di                             |
| -------------------------------- | --------------------------------------------- |
| `TextInput` controlled           | `todo.tsx`, `habits.tsx`                      |
| `keyboardType` & `returnKeyType` | semua input form                              |
| `useMemo` untuk derived state    | `todo.tsx`, `calculator.tsx`                  |
| Nested immutable update          | `habits.tsx` (toggleDay)                      |
| State machine string literal     | `quiz.tsx` (status)                           |
| Dynamic className conditional    | `quiz.tsx` (option styling)                   |
| Inline style untuk dynamic value | `habits.tsx`, `quiz.tsx` (progress bar width) |
| `disabled` prop pada Pressable   | `quiz.tsx`                                    |
| Number sanitization & formatting | `calculator.tsx`                              |

Detail lengkap konsep ini dituangkan di [`concepts/09-forms-and-state.md`](../concepts/09-forms-and-state.md).

---

## Yang Tidak Saya Lakukan (Intentional)

- **Tidak pakai AsyncStorage** — semua state hanya di memori. Reload app = data hilang. Ini disengaja agar fokus belajar useState dulu, tidak distraksi setup library baru. Persistence bisa jadi changelog selanjutnya.
- **Tidak pakai library form** (Formik/RHF) — pakai useState + onChange manual karena ini bagian penting yang harus dikuasai dulu.
- **Tidak refactor jadi custom hook** — sengaja keep semua logic di komponen agar terlihat alurnya. Refactor jadi `useTodos()`, `useQuiz()` dll bisa jadi latihan lanjutan.
