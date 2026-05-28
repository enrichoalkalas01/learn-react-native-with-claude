# Changelog 006 — Homepage Dashboard + Mini Shop (E-commerce)

**Tanggal:** 2026-05-07
**Tipe:** Feature + Refactor
**Status:** Selesai

---

## Apa yang Dilakukan

1. **Replace homepage default Expo** dengan dashboard custom: time-aware greeting + stats real-time + featured apps + daily tip + continue learning.
2. **Mini App #7: E-commerce Shop** (`/apps/shop`) — katalog 20 produk, search, kategori filter, cart persistent, modal review cart, checkout demo.

---

## File yang Dibuat / Diubah

### File Baru

| File                           | Fungsi                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `hooks/use-dashboard-stats.ts` | Baca data dari semua AsyncStorage key untuk stats homepage. Auto-refresh via `useFocusEffect`. |
| `hooks/use-shop.ts`            | State cart + filter + 20 product seed. Persistent via AsyncStorage `@app/cart`.                |
| `app/apps/shop.tsx`            | UI shop: search, kategori, grid 2-kolom, cart bar floating, modal cart                         |

### File Diubah

| File                     | Perubahan                                                                   |
| ------------------------ | --------------------------------------------------------------------------- |
| `app/(tabs)/index.tsx`   | Rewrite total — replace ParallaxScrollView template dengan dashboard custom |
| `app/(tabs)/apps.tsx`    | Tambah kartu Mini Shop                                                      |
| `components/sidebar.tsx` | Tambah menu Mini Shop di section Mini Apps                                  |
| `app/_layout.tsx`        | Register `apps/shop` Stack.Screen                                           |

---

## Bagian 1: Homepage Dashboard

### Tujuan

Sebelumnya homepage adalah template Expo standar dengan ParallaxScrollView, hello wave, dan step 1/2/3 yang isinya generic. Tidak relevan dengan project actual.

Sekarang: **dashboard yang menyambut user dengan info personal dari data app sendiri**.

### Struktur Layout

```
┌─────────────────────────────┐
│ KAMIS, 7 MEI                │
│ Selamat sore 👋             │  ← time-aware greeting
│ Mau belajar React Native    │
│ apa hari ini?               │
├─────────────────────────────┤
│ ┌──────┐ ┌──────┐           │
│ │  ✅  │ │  🔥  │           │  ← 2x2 stats grid
│ │ 3/8  │ │ 57%  │           │     (real data dari AsyncStorage)
│ └──────┘ └──────┘           │
│ ┌──────┐ ┌──────┐           │
│ │  ⏱️  │ │  💸  │           │
│ │  12  │ │ 4,8jt│           │
│ └──────┘ └──────┘           │
├─────────────────────────────┤
│ Coba Sekarang     Lihat semua│
│ ✅ Todo List              › │  ← featured apps
│ ⏱️ Pomodoro Timer         › │
│ 🛍️ Mini Shop              › │
├─────────────────────────────┤
│ 💡 Tips Hari Ini             │  ← rotating daily tip
│ "Pakai functional updater    │     (pakai dayOfYear % tips.length)
│ di async callback..."        │
├─────────────────────────────┤
│ Lanjutkan Belajar            │
│ 📝 Artikel Belajar         › │
│ 🧭 Explore Components      › │
└─────────────────────────────┘
```

### Time-Aware Greeting

```tsx
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}
```

[!info]
Sederhana, tapi bikin app terasa "alive". Di morning flow developer pakai aplikasi, sapaan-nya pun berubah.

### Daily Tip (Deterministic per Hari)

```tsx
function getDailyTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TIPS[dayOfYear % TIPS.length];
}
```

Kenapa pakai `dayOfYear % length` (bukan random)? Supaya **konsisten dalam 1 hari** — user buka app berkali-kali, tip yang sama. Besok baru ganti.

### Stats Hook dengan Auto-Refresh

```tsx
// hooks/use-dashboard-stats.ts
import { useFocusEffect } from 'expo-router';

export function useDashboardStats() {
  const [stats, setStats] = useState<Stats>(INITIAL);

  const refresh = useCallback(async () => {
    const [todosRaw, habitsRaw, sessionsRaw, txnsRaw] = await Promise.all([
      AsyncStorage.getItem('@app/todos'),
      AsyncStorage.getItem('@app/habits'),
      AsyncStorage.getItem('@app/pomodoro-sessions'),
      AsyncStorage.getItem('@app/transactions'),
    ]);
    // ... derive stats
    setStats({...});
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return { ...stats, refresh };
}
```

[!info]
**`useFocusEffect`** dari Expo Router (re-export dari React Navigation) memanggil callback **setiap kali screen aktif** — termasuk saat user kembali dari screen lain. Cocok untuk refresh data yang mungkin berubah di screen lain.

### Pattern Multi-Read AsyncStorage

```tsx
const [todosRaw, habitsRaw, sessionsRaw, txnsRaw] = await Promise.all([
  AsyncStorage.getItem('@app/todos'),
  AsyncStorage.getItem('@app/habits'),
  AsyncStorage.getItem('@app/pomodoro-sessions'),
  AsyncStorage.getItem('@app/transactions'),
]);
```

Pakai `Promise.all` — 4 read paralel, bukan sequential. Lebih cepat ~4×.

[!warning]
Setelah parse, **wajib type-check** karena data lama bisa beda struktur. Project ini pakai `try/catch` di `useStoredState`, dan di sini cuma trust struktur (sudah controlled).

### StatCard Component

Reusable component dalam file:

```tsx
function StatCard({ icon, label, value, href, accent }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      className="flex-1 min-w-[45%] bg-white dark:bg-gray-800 rounded-2xl p-4 ...">
      <View className={`w-10 h-10 rounded-xl ${accent}`}>...</View>
      <Text>{label}</Text>
      <Text className="text-xl font-bold">{value}</Text>
    </Pressable>
  );
}
```

`min-w-[45%]` + `flex-wrap` di parent → otomatis 2 kolom yang lebar sama, baris penuh kalau >2 item.

---

## Bagian 2: Mini Shop (E-commerce)

### Tujuan

Belajar pattern e-commerce sederhana: **product catalog + filter + cart + checkout**. Tanpa backend (data hardcoded), tanpa payment processor (alert simulasi).

### Demo

```
┌─────────────────────────────┐
│ Mini Shop                   │
│ 20 dari 20 produk           │
├─────────────────────────────┤
│ 🔍 Cari produk...        ✕ │
├─────────────────────────────┤
│ [Semua] [Fashion] [Elek...] │
├─────────────────────────────┤
│ ┌──────┐ ┌──────┐           │
│ │ 👕   │ │ 🧥   │           │
│ │ Kaos │ │ Kemeja│          │
│ │ ⭐4.5│ │ ⭐4.7 │          │
│ │ 89rb │ │ 245rb │          │
│ │[+Cart]│ │[+Cart]│          │
│ └──────┘ └──────┘           │
│ ...                         │
├─────────────────────────────┤
│ 🛒 3 item   Rp 540rb  →    │  ← floating cart bar
└─────────────────────────────┘
```

Tap floating bar → modal slide-up dengan list cart + checkout button.

### State Architecture

```tsx
// hooks/use-shop.ts
type CartEntry = { productId: string; qty: number };

export function useShop() {
  const [cart, setCart] = useStoredState<CartEntry[]>('@app/cart', []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  // ...
}
```

**Catatan desain:** simpan cart sebagai `{productId, qty}[]`, bukan `Product[]`. Kenapa?

- Kalau harga produk berubah, cart auto-update (di-derive saat render)
- Tidak ada duplikasi data product info (DRY)
- Bisa validasi: kalau product sudah tidak ada di catalog → skip

### Derive `cartItems` dengan useMemo

```tsx
const cartItems: CartItem[] = useMemo(() => {
  return cart
    .map((entry) => {
      const product = PRODUCTS.find((p) => p.id === entry.productId);
      if (!product) return null;
      return { ...product, qty: entry.qty, subtotal: product.price * entry.qty };
    })
    .filter((x): x is CartItem => x !== null);
}, [cart]);
```

`.filter((x): x is CartItem => x !== null)` — TypeScript type guard. Setelah filter, type berubah dari `(CartItem | null)[]` jadi `CartItem[]`. Cleaner daripada `as CartItem[]` cast paksa.

### Cart Operations

```tsx
const addToCart = (productId: string) => {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  setCart((prev) => {
    const existing = prev.find((c) => c.productId === productId);
    if (existing) {
      // Stock guard
      if (existing.qty >= product.stock) return prev;
      return prev.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
    }
    return [...prev, { productId, qty: 1 }];
  });
};

const decrementCart = (productId: string) => {
  setCart(
    (prev) =>
      prev
        .map((c) => (c.productId === productId ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0) // ← auto-remove kalau qty = 0
  );
};
```

[!info]
**Auto-cleanup di `decrementCart`** — kalau qty turun ke 0, item dihapus dari array. Lebih clean daripada bikin handler `removeFromCart` terpisah yang harus di-call manual.

### Filter + Search Combined

```tsx
const filtered = useMemo(() => {
  let result = PRODUCTS;
  if (category !== 'Semua') {
    result = result.filter((p) => p.category === category);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }
  return result;
}, [category, search]);
```

Order matters: filter kategori dulu (lebih cepat — strict equality), baru text search (lebih lambat — substring).

### UI: Product Card

```tsx
<View className="w-[48%] bg-white rounded-2xl border ...">
  {/* Image area dengan aspect-square */}
  <View className="aspect-square bg-gray-50 items-center justify-center">
    <Text className="text-6xl">{p.emoji}</Text>
    {p.stock < 10 && (
      <View className="absolute top-2 left-2 bg-amber-500 rounded-full px-2 py-0.5">
        <Text className="text-[10px] font-bold text-white">Sisa {p.stock}</Text>
      </View>
    )}
  </View>
  {/* Info */}
  <View className="p-3 gap-1.5">
    <Text className="text-sm font-semibold" numberOfLines={2}>{p.name}</Text>
    <StarRating rating={p.rating} />
    <Text className="text-base font-bold text-primary">{formatIDR(p.price)}</Text>
    {/* Add button OR stepper kalau sudah di cart */}
    {qtyInCart === 0 ? (
      <Pressable onPress={...}>+ Tambah</Pressable>
    ) : (
      <View className="flex-row ...">
        <Pressable onPress={() => decrementCart(p.id)}>−</Pressable>
        <Text>{qtyInCart}</Text>
        <Pressable onPress={() => addToCart(p.id)}>+</Pressable>
      </View>
    )}
  </View>
</View>
```

[!info]
**Conditional UI per state:**

- Belum di cart → tombol "Tambah"
- Sudah di cart → stepper +/-
  Pattern ini muncul di semua marketplace app (Tokopedia, Shopee). User langsung tahu mereka punya N item di cart tanpa buka cart screen.

### Floating Cart Bar (Sticky Bottom)

```tsx
{
  s.totalQty > 0 && (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="absolute left-4 right-4 bottom-6">
      <Pressable
        onPress={() => setCartOpen(true)}
        className="bg-primary rounded-2xl px-5 py-4 ...">
        <View>
          <Text className="text-xs text-white/80">{s.totalQty} item</Text>
          <Text className="text-base font-bold text-white">
            {formatIDR(s.totalPrice)}
          </Text>
        </View>
        <Text className="text-white">Lihat Cart →</Text>
      </Pressable>
    </Animated.View>
  );
}
```

**Pattern:**

- `position: absolute` + `bottom: 6` (NativeWind: `absolute bottom-6 left-4 right-4`)
- Hanya muncul kalau ada item (`totalQty > 0`)
- Animated fade in/out smooth saat muncul/hilang

`pb-32` di ScrollView contentContainer supaya konten terakhir tidak tertutup floating bar.

### Modal Cart Review

```tsx
<Modal animationType="slide" transparent visible={cartOpen}>
  <View className="flex-1 bg-black/50 justify-end">
    <View className="bg-white rounded-t-3xl max-h-[85%]">
      {/* Header dengan close button */}
      {/* Scrollable cart items */}
      {/* Sticky footer: total + checkout */}
    </View>
  </View>
</Modal>
```

[!info]
**`max-h-[85%]`** → modal max 85% layar, sisanya overlay hitam. User tetap lihat sebagian background → context "ini overlay, bukan full navigation".

### Checkout Demo

```tsx
const handleCheckout = () => {
  Alert.alert('Checkout', `Bayar ${formatIDR(s.totalPrice)} untuk ${s.totalQty} item?`, [
    { text: 'Batal', style: 'cancel' },
    {
      text: 'Bayar',
      onPress: () => {
        s.clearCart();
        setCartOpen(false);
        Alert.alert('Berhasil!', 'Pesanan kamu sudah masuk. 🎉');
      },
    },
  ]);
};
```

Native `Alert.alert` untuk konfirmasi. Tidak butuh modal kustom.

---

## Konsep Baru

| Konsep                                                | Lokasi                                        |
| ----------------------------------------------------- | --------------------------------------------- |
| `useFocusEffect` untuk refresh data                   | dashboard stats                               |
| `Promise.all` untuk parallel AsyncStorage read        | `useDashboardStats.refresh`                   |
| Time-aware UI (greeting, daily tip)                   | homepage                                      |
| Deterministic content per hari (`dayOfYear % length`) | daily tip rotation                            |
| TypeScript type guard di `.filter()`                  | `cartItems.filter((x): x is CartItem => ...)` |
| Cart pattern: `{id, qty}` bukan `Product[]`           | `useShop.cart`                                |
| Auto-cleanup di decrement                             | `decrementCart`                               |
| Conditional UI per item state                         | "Tambah" vs stepper                           |
| Floating sticky bottom bar                            | shop cart preview                             |
| Modal slide-up sheet                                  | cart review                                   |
| `aspect-square` untuk product image                   | product card                                  |
| Stock badge "Sisa N"                                  | product card overlay                          |

---

## Cara Coba

```bash
npm run start
```

Buka app → akan dapat:

- **Home tab** → dashboard dengan stats live (akan kosong kalau belum pakai mini app, coba tambah data dulu)
- **Apps tab → Mini Shop** → langsung lihat 20 produk, filter, search, tambah ke cart
- Cart persistent → tutup app, buka lagi, isi cart masih ada

---

## Coba Sendiri

### Homepage

1. Tambah greeting variasi based on hari (Senin: "Semangat awal minggu!", Jumat: "Hampir weekend!").
2. Tambah quote inspirasi di bawah daily tip.
3. Tambah "Rekomendasi mini app" yang dynamic — saran app yang user belum pakai.

### Shop

1. Tambah halaman Detail Produk (Stack screen `/apps/shop/[id]`).
2. Tambah favorite/wishlist (toggle heart icon, persistent).
3. Tambah variant produk (size: S/M/L untuk Fashion).
4. Tambah voucher/diskon — kurangi total kalau apply kode tertentu.
5. Tambah riwayat pesanan setelah checkout — simpan ke `@app/orders`.
