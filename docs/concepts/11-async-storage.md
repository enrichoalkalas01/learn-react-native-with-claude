# Konsep 11 — AsyncStorage (Persistensi Data Lokal)

`@react-native-async-storage/async-storage` adalah key-value store **persistent** di device. Data tetap ada walau app di-close, restart, atau update.

**Catatan:** AsyncStorage cocok untuk data kecil (preferences, cache ringan). Untuk data besar, pakai SQLite/MMKV/WatermelonDB.

---

## Install

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## API Dasar

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tulis (semua method async, return Promise)
await AsyncStorage.setItem('key', 'string value');

// Baca (return null kalau key tidak ada)
const value = await AsyncStorage.getItem('key');

// Hapus
await AsyncStorage.removeItem('key');

// Ambil semua key
const keys = await AsyncStorage.getAllKeys();

// Hapus banyak sekaligus
await AsyncStorage.multiRemove(['key1', 'key2']);

// Hapus semua (hati-hati — bahkan data lib lain ikut terhapus!)
await AsyncStorage.clear();
```

**Penting:** AsyncStorage hanya bisa simpan **string**. Untuk object/array → `JSON.stringify` saat tulis, `JSON.parse` saat baca.

---

## Pattern: Custom Hook `useStoredState<T>`

Untuk memanggil pattern ini secara berulang, project ini punya custom hook generic:

```tsx
// hooks/use-stored-state.ts (excerpt)
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key).then((raw) => {
      if (cancelled) return;
      if (raw != null) {
        try {
          setValue(JSON.parse(raw) as T);
        } catch {}
      }
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    AsyncStorage.setItem(key, JSON.stringify(value));
  }, [key, value, isLoaded]);

  return [value, setValue, isLoaded] as const;
}
```

### Detail Implementation

#### 1. `cancelled` flag — Race Condition Guard

Kalau `key` berubah cepat sebelum `getItem` selesai, callback bisa update state lama setelah komponen sudah unmount/key changed. `cancelled` flag mencegah itu.

#### 2. `skipNextSave` ref — Cegah Overwrite

Tanpa ini, urutan eksekusi jadi:

1. Mount → state = initial
2. Effect 2 (save) jalan → write initial ke storage ✗ (overwrite data lama!)
3. Effect 1 (load) selesai → state = stored
4. Effect 2 (save) jalan lagi → write stored OK

Pakai `skipNextSave`, save pertama di-skip → data tidak ter-overwrite.

#### 3. Try/Catch JSON.parse

Data corrupt? Lebih baik fallback ke initial daripada crash app.

---

## Pemakaian di Project

```tsx
// hooks/use-todos.ts
const [todos, setTodos] = useStoredState<Todo[]>('@app/todos', SEED);
```

Sama persis seperti `useState`, tapi data persistent.

### Convention Naming Key

Project pakai prefix `@app/`:

- `@app/todos`
- `@app/habits`
- `@app/transactions`
- `@app/pomodoro-sessions`
- `@app/theme-mode`
- `@app/onboarding-done`

Manfaat: gampang reset semua data app saja tanpa ganggu lib lain:

```tsx
export async function clearAllAppData() {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith('@app/'));
  if (appKeys.length) await AsyncStorage.multiRemove(appKeys);
}
```

---

## Pattern: One-Off Read (Bukan State)

Kalau hanya butuh baca sekali (misal: cek onboarding flag):

```tsx
useEffect(() => {
  AsyncStorage.getItem('@app/onboarding-done').then((v) => {
    const done = v === 'true';
    if (!done) router.replace('/onboarding');
  });
}, []);
```

Tidak perlu hook persistent — cukup raw API.

---

## Pitfalls

[!warning]
**1. Jangan await di body komponen.** AsyncStorage async — kalau di-await, komponen suspend. Pakai `useEffect`.

```tsx
// ❌ ERROR
function Component() {
  const v = await AsyncStorage.getItem(...); // tidak boleh!
}

// ✅ Benar
function Component() {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(...).then(setV);
  }, []);
}
```

[!warning]
**2. Data hanya string.** Object harus di-serialize:

```tsx
// ❌ Akan jadi "[object Object]" — tidak bisa di-restore!
AsyncStorage.setItem('user', { name: 'Budi' });

// ✅
AsyncStorage.setItem('user', JSON.stringify({ name: 'Budi' }));
```

[!warning]
**3. Async storage bukan untuk data besar/sensitif.**

- Data > 6MB → pakai SQLite atau MMKV
- Token/password → pakai `expo-secure-store` (encrypted)
- Performa kritis → MMKV (sync API, jauh lebih cepat)

---

## Alternatif

| Library                                     | Kapan dipakai                      |
| ------------------------------------------- | ---------------------------------- |
| `@react-native-async-storage/async-storage` | Default — preferences, small JSON  |
| `expo-secure-store`                         | Token, password, secrets           |
| `react-native-mmkv`                         | Performa kritis (sync API)         |
| `expo-sqlite`                               | Data terstruktur, query relasional |
| `WatermelonDB`                              | Offline-first dengan sync server   |

---

## Coba Sendiri

1. Tambah persistent setting `notificationEnabled: boolean` di settings.
2. Buat hook `useFavorites<T>(key)` yang manage list favorites pakai `useStoredState`.
3. Implement migration: kalau struktur data berubah, baca versi lama dan transform ke versi baru saat load.
