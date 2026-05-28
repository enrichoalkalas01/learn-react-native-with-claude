# Changelog 005 — Sidebar Redesign (Section Grouping, Active State, Branding)

**Tanggal:** 2026-05-07
**Tipe:** Refactor + UX Improvement
**Status:** Selesai

---

## Apa yang Dilakukan

Redesign sidebar yang sebelumnya datar dan generic jadi lebih rapi & informatif:

1. **Section grouping** — 11 menu item dipecah jadi 3 bagian (Utama / Mini Apps / Sistem)
2. **Active state indicator** — route yang sedang aktif di-highlight (background tint + dot indicator + bold text)
3. **Branded header** — icon bubble + nama app + subtitle (bukan cuma teks "Menu")
4. **Footer informatif** — versi + hint swipe untuk tutup
5. **Safe area support** — header & footer respect notch/dynamic island & home indicator
6. **Scrollable menu** — fallback kalau menu panjang & layar kecil
7. **Smart navigation** — kalau user pilih route yang sudah aktif, sidebar tutup tanpa push (cegah history kotor)
8. **Refactor styling** — dari StyleSheet inline jadi NativeWind class (konsisten dengan rest of project)
9. **Lebar panel** sedikit ditambah (280 → 296px)

---

## File yang Diubah

| File                     | Perubahan                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `components/sidebar.tsx` | Rewrite total: section structure, active state, branded header, NativeWind styling |

---

## Sebelum vs Sesudah

### Sebelum

```
┌──────────────────────────┐
│  Menu                ✕   │
│ ────────────────────────│
│  🏠  Home                │
│  🧭  Explore             │
│  📝  Posts               │
│  🧩  Apps                │
│  ✅  Todo List           │
│  🔥  Habit Tracker       │
│  🧮  Tip Calculator      │
│  ❓  Quiz                │
│  ⏱️  Pomodoro            │
│  💸  Expenses            │
│  ⚙️  Settings            │
│ ────────────────────────│
│  Learn React Native v1.0 │
└──────────────────────────┘
```

Issue: 11 item flat, susah baca, tidak tahu di route mana sekarang.

### Sesudah

```
┌────────────────────────────┐
│ [📱] Learn React Native ✕ │
│      Sandbox project       │
│ ──────────────────────────│
│  UTAMA                     │
│  🏠  Home                  │
│  🧭  Explore               │
│  📝  Posts                 │
│                            │
│  MINI APPS                 │
│  🧩  Semua Apps            │
│  ✅  Todo List         ●   │ ← active
│  🔥  Habit Tracker         │
│  🧮  Tip Calculator        │
│  ❓  Quiz                  │
│  ⏱️  Pomodoro              │
│  💸  Expenses              │
│                            │
│  SISTEM                    │
│  ⚙️  Settings              │
│ ──────────────────────────│
│  v1.0.0 · Expo SDK 54      │
│         ← swipe untuk tutup│
└────────────────────────────┘
```

---

## Detail Implementasi

### 1. Data Structure: Sections

Sebelumnya array flat:

```tsx
const MENU_ITEMS = [
  { label: 'Home', href: '/', icon: '🏠' },
  // ... 11 items
];
```

Sekarang nested by section:

```tsx
type MenuSection = {
  title: string;
  items: { label: string; href: string; icon: string }[];
};

const MENU_SECTIONS: MenuSection[] = [
  { title: 'Utama', items: [...] },
  { title: 'Mini Apps', items: [...] },
  { title: 'Sistem', items: [...] },
];
```

Render dua loop bersarang:

```tsx
{MENU_SECTIONS.map((section) => (
  <View key={section.title}>
    <Text className="...uppercase tracking-wider...">{section.title}</Text>
    {section.items.map((item) => <MenuItem ... />)}
  </View>
))}
```

### 2. Active State dengan `usePathname`

```tsx
import { usePathname } from 'expo-router';

const pathname = usePathname();

function isRouteActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/') return pathname === '/';
  // /apps active untuk /apps DAN /apps/todo (drill-down)
  return pathname === itemHref || pathname.startsWith(itemHref + '/');
}
```

[!info]
Edge case: `/` adalah prefix dari semua URL. Tanpa special case, Home akan selalu "active". Cek persis (`pathname === '/'`) untuk Home.

### 3. Visual Active State

3 lapis indicator:

```tsx
<Pressable
  className={`mx-3 my-0.5 rounded-xl px-3 py-2.5 flex-row items-center gap-3 ${
    active
      ? 'bg-primary/10 dark:bg-primary/20' // ← layer 1: background tint
      : 'active:bg-gray-50 dark:active:bg-gray-800'
  }`}>
  <View
    className={`w-9 h-9 rounded-lg items-center justify-center ${
      active
        ? 'bg-primary' // ← layer 2: icon bg vibrant
        : 'bg-gray-100 dark:bg-gray-800'
    }`}>
    <Text>{item.icon}</Text>
  </View>
  <Text
    className={`flex-1 ${
      active
        ? 'font-semibold text-primary' // ← layer 3a: text bold + colored
        : 'font-medium text-gray-800 dark:text-gray-200'
    }`}>
    {item.label}
  </Text>
  {active && <View className="w-1.5 h-1.5 rounded-full bg-primary" />}{' '}
  {/* layer 3b: dot */}
</Pressable>
```

### 4. Smart Navigation

Sebelumnya: tap menu = push ke route. Kalau user di `/apps/todo` dan tap "Todo List" lagi, terjadi push duplikat ke history.

Sekarang:

```tsx
const handleNavigate = (href: string) => {
  if (isRouteActive(href, pathname)) {
    close(); // sudah di route ini, tutup saja
    return;
  }
  close();
  setTimeout(() => router.push(href as never), 100);
};
```

### 5. Safe Area Insets

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<View style={{ paddingTop: insets.top + 16 }}>...</View>   {/* header respect notch */}
<View style={{ paddingBottom: insets.bottom + 16 }}>...</View>  {/* footer respect home indicator */}
```

Tanpa ini, di iPhone X+ header bisa ketabrak notch.

### 6. NativeWind Migration

Sebelumnya 60+ baris StyleSheet di bottom file. Sekarang hanya 2 style yang tersisa:

```tsx
const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#000', zIndex: 10 },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
});
```

Sisanya pakai className. **Kenapa 2 ini tetap StyleSheet:**

- `position: absolute` + dimensions tertentu — lebih clear pakai object
- Shadow native — NativeWind tidak ekspose `elevation` (Android)

---

## Konsep Baru

| Konsep                                   | Lokasi                              |
| ---------------------------------------- | ----------------------------------- |
| `usePathname()` dari Expo Router         | active state detection              |
| `useSafeAreaInsets()`                    | top/bottom padding aware notch      |
| Section grouping pattern (data-driven)   | `MENU_SECTIONS` array               |
| Multi-layer active indicator             | bg + icon-bg + text + dot           |
| Smart navigation (no push if same route) | `handleNavigate`                    |
| ScrollView untuk overflow menu           | `<ScrollView>` di sekitar menu list |

---

## UX Polish yang Dipertimbangkan tapi Skip

| Ide                                       | Alasan skip                                          |
| ----------------------------------------- | ---------------------------------------------------- |
| Search bar di sidebar                     | Overkill untuk 11 item                               |
| Vertical bar indikator di kiri item aktif | Background tint + dot sudah cukup, tidak overkrowded |
| Theme toggle inline                       | Sudah ada di Settings, hindari duplikasi             |
| User profile section                      | Tidak ada auth di project                            |
| Animated icon scale saat aktif            | Subtle, tambah complexity                            |
| Collapse/expand section                   | 11 item tidak butuh collapse                         |

---

## Coba Sendiri

1. Tambah badge count di menu item (misal Todo: badge = jumlah task aktif).
2. Tambah scroll-to-top saat ulang buka sidebar.
3. Animate dot indicator pakai `withSpring` saat route berubah.
