# Konsep 10 — Custom Hooks

Custom hook = fungsi JavaScript yang **dimulai dengan `use`** dan boleh memanggil hook React lain. Tujuannya: ekstrak logic dari komponen agar bisa di-reuse, di-test terpisah, dan UI lebih bersih.

---

## Kapan Bikin Custom Hook?

Ekstrak ke custom hook saat:

1. **Logic kompleks** di komponen mengganggu pembacaan UI
2. **Logic sama dipakai di 2+ komponen** (DRY)
3. **Mau di-test terpisah** dari rendering
4. **State management** sebuah fitur sudah berdiri sendiri (todos, habits, dst.)

Jangan buat hook untuk hal yang cuma 1-2 baris atau hanya dipakai di 1 tempat.

---

## Anatomi Custom Hook

```tsx
// hooks/use-counter.ts
import { useState } from 'react';

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => Math.max(0, c - 1));
  const reset = () => setCount(initial);

  return { count, increment, decrement, reset };
}
```

```tsx
// Pakai di komponen
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);
  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={increment} title="+" />
      <Button onPress={decrement} title="-" />
      <Button onPress={reset} title="reset" />
    </View>
  );
}
```

**3 aturan wajib custom hook:**

1. Nama dimulai dengan `use` (linter akan check ini)
2. Boleh memanggil hook lain (`useState`, `useEffect`, hook lain, dst.)
3. Hanya panggil di top-level (sama seperti hook biasa) — tidak di if/loop

---

## Pattern di Project Ini

Semua mini app pakai pattern yang sama:

```
hooks/use-todos.ts        ← Logic Todo
hooks/use-habits.ts       ← Logic Habit
hooks/use-tip-calculator.ts
hooks/use-quiz.ts
hooks/use-pomodoro.ts
hooks/use-expenses.ts
```

### Sebelum Refactor

```tsx
// app/apps/todo.tsx — 200+ baris (state + handler + UI campur aduk)
export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([...]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(...);
  const addTodo = () => { ... };
  const toggleTodo = (id) => { ... };
  const deleteTodo = (id) => { ... };
  // ... semua di sini

  return (/* JSX */);
}
```

### Setelah Refactor

```tsx
// hooks/use-todos.ts — 60 baris, semua logic
export function useTodos() {
  const [todos, setTodos] = useStoredState<Todo[]>('@app/todos', SEED);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const filtered = useMemo(...);
  // ...
  return { todos, filtered, input, filter, addTodo, toggleTodo, ... };
}

// app/apps/todo.tsx — 100 baris, fokus UI
export default function TodoScreen() {
  const t = useTodos();
  return (
    <View>
      <TextInput value={t.input} onChangeText={t.setInput} />
      <Pressable onPress={t.addTodo}>...</Pressable>
      {t.filtered.map(...)}
    </View>
  );
}
```

---

## Pattern: Generic Reusable Hook

`useStoredState<T>` — drop-in replacement untuk `useState` yang otomatis persist ke AsyncStorage:

```tsx
// hooks/use-stored-state.ts
export function useStoredState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [isLoaded, setIsLoaded] = useState(false);
  // ... load saat mount, save saat berubah
  return [value, setValue, isLoaded];
}
```

Pemakaian sama persis seperti `useState`:

```tsx
const [todos, setTodos] = useStoredState<Todo[]>('@app/todos', []);
```

**Generic `<T>`** memungkinkan hook ini dipakai untuk type apa saja: array, object, primitive — TypeScript tetap aman.

---

## Pattern: Return Object vs Tuple

```tsx
// Tuple (mirip useState) — bagus kalau cuma 2-3 nilai
return [value, setValue] as const;

// Object — bagus kalau banyak nilai/method
return { count, increment, decrement, reset };
```

**Aturan praktis:**

- 1-3 return values → tuple OK
- > 3 → object (lebih self-documenting, tidak perlu hafal urutan)

Project ini pakai object untuk semua mini-app hook.

---

## Pattern: Composition (Hook Memanggil Hook)

```tsx
// useTodos memanggil useStoredState
export function useTodos() {
  const [todos, setTodos] = useStoredState<Todo[]>('@app/todos', SEED);
  // ...
}
```

Custom hook bisa memanggil hook React **dan** custom hook lain. Inilah cara membangun abstraksi berlapis.

---

## Pattern: useEffect Cleanup di Hook

Pomodoro pakai `setInterval` — wajib di-cleanup:

```tsx
export function usePomodoro() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    // CLEANUP — dipanggil saat:
    // 1. Component unmount
    // 2. Sebelum effect jalan ulang (saat dep array berubah)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);
}
```

**Tanpa cleanup:** `setInterval` terus jalan walau komponen sudah unmount → memory leak + bug.

---

## Tips Membuat Hook yang Baik

### ✅ DO

- **Nama yang jelas:** `useTodos`, `useDebouncedValue`, `useFetchUser`
- **Return yang predictable:** semua method/value yang user butuh
- **Internal state encapsulated:** detail implementasi tidak bocor keluar
- **Deps di useEffect lengkap:** linter akan complain kalau missing
- **Cleanup setiap subscription:** intervals, listeners, timers

### ❌ DON'T

- **Conditional hook call:** `if (cond) useState(...)` → ERROR
- **Nama tidak diawali `use`:** linter tidak akan recognize sebagai hook
- **Side effect di body:** tulis ke storage di body komponen → di luar useEffect tidak boleh
- **Return mutable object:** kalau user mutate, bisa cause infinite loop. Selalu return object/array baru

---

## Coba Sendiri

1. Buat `useToggle(initial = false)` yang return `[value, toggle]`.
2. Buat `useDebouncedValue<T>(value, delay)` — return value yang ter-debounce setelah delay ms tanpa berubah.
3. Refactor sebuah komponen di project ini yang punya banyak state ke custom hook — bandingkan readability sebelum dan sesudah.
