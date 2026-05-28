# Konsep 08 — Sidebar Menu & Context API

## Gambaran Implementasi

Sidebar di project ini dibangun dari tiga lapisan:

```
1. Context API  → state management (siapa yang menyimpan isOpen)
2. Reanimated   → animasi smooth (slide + fade)
3. Komponen     → UI sidebar itu sendiri
```

---

## Layer 1: Context API

### Masalah yang Diselesaikan

Sidebar perlu dikontrol dari banyak tempat:

- HamburgerButton di header → toggle sidebar
- Item menu di sidebar → close sidebar setelah navigasi
- Backdrop → close sidebar saat diklik

Tanpa Context, kita harus _drill_ prop `toggle` dari parent ke semua tempat yang butuh.
Dengan Context, komponen manapun bisa langsung akses tanpa prop drilling.

### Implementasi

```tsx
// context/sidebar-context.tsx

// 1. Definisikan bentuk data yang disimpan di context
type SidebarContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

// 2. Buat context object
const SidebarContext = createContext<SidebarContextType | null>(null);

// 3. Provider = komponen yang menyimpan state dan membaginya
export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
      }}>
      {children}
    </SidebarContext.Provider>
  );
}

// 4. Hook untuk mengakses context
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar harus dipakai dalam SidebarProvider');
  return ctx;
}
```

### Cara Pakai

```tsx
// Di root layout — wrap semua konten
<SidebarProvider>
  <Stack />
  <Sidebar />
</SidebarProvider>;

// Di HamburgerButton — buka/tutup sidebar
function HamburgerButton() {
  const { toggle } = useSidebar();
  return <Pressable onPress={toggle}>☰</Pressable>;
}

// Di Sidebar — baca state dan tutup
function Sidebar() {
  const { isOpen, close } = useSidebar();
  // ...
}
```

---

## Layer 2: Animasi Reanimated

### Konsep Animasi Sidebar

```
Panel sidebar dimulai di luar layar (kiri): translateX = -280
Saat dibuka: geser masuk ke translateX = 0
Saat ditutup: geser kembali ke translateX = -280
```

```tsx
const translateX = useSharedValue(-SIDEBAR_WIDTH); // mulai tersembunyi

useEffect(() => {
  if (isOpen) {
    translateX.value = withTiming(0, { duration: 280 }); // masuk
  } else {
    translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 280 }, (finished) => {
      if (finished) runOnJS(setBackdropActive)(false); // callback setelah keluar
    });
  }
}, [isOpen]);

// Style panel ikut translateX
const panelStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));

// Style backdrop ikut posisi panel (interpolasi)
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(
    translateX.value,
    [-SIDEBAR_WIDTH, 0], // range input: posisi panel
    [0, 0.5] // range output: opacity backdrop
  ),
}));
```

### `interpolate` — Fungsi Pemetaan Nilai

```
interpolate(nilai, [inputMin, inputMax], [outputMin, outputMax])

Contoh:
interpolate(translateX.value, [-280, 0], [0, 0.5])

translateX = -280 → opacity = 0     (panel di luar, backdrop transparan)
translateX = -140 → opacity = 0.25  (panel setengah, backdrop semi-transparan)
translateX = 0    → opacity = 0.5   (panel masuk penuh, backdrop gelap)
```

### `runOnJS` — Lintas Thread

```tsx
// MASALAH: callback withTiming jalan di UI thread
// React setState harus jalan di JS thread
// Solusi: runOnJS membungkus fungsi agar jalan di JS thread

translateX.value = withTiming(-SIDEBAR_WIDTH, {}, (finished) => {
  if (finished) runOnJS(setBackdropActive)(false); // ← aman
  // setBackdropActive(false); // ← CRASH! Tidak boleh langsung
});
```

---

## Layer 3: Struktur Komponen

### Hierarki

```
<Sidebar>
  ├── <Animated.View>  backdrop (hitam semi-transparan)
  │   └── <Pressable>  klik untuk tutup
  │
  └── <Animated.View>  panel putih
      ├── Header
      │   ├── "Menu" (judul)
      │   └── [✕] tombol tutup
      ├── MenuList
      │   └── MenuItem × N  (Home, Explore, Posts)
      └── Footer (info versi)
```

### Penempatan di App

```
app/_layout.tsx
└── View (flex: 1, posisi relatif)
    ├── Stack (konten app)     zIndex: default
    └── Sidebar                zIndex: 10 (backdrop), 20 (panel)
```

Sidebar ditempatkan sebagai sibling dari Stack dengan `position: absolute`.
Ini membuatnya berada di atas semua konten.

### `pointerEvents` — Kontrol Interaksi

```tsx
// Backdrop tidak boleh menerima sentuhan saat sidebar tertutup
<Animated.View pointerEvents={backdropActive ? 'auto' : 'none'} style={backdropStyle}>
  <Pressable onPress={close} />
</Animated.View>
```

`pointerEvents="none"` = komponen tidak bisa diklik (tapi tetap terlihat kalau ada opacity).

---

## Pola Context yang Bisa Direplikasi

Pola yang sama bisa dipakai untuk fitur lain:

```tsx
// Toast/notification context
const [toasts, setToasts] = useState([]);
const showToast = (msg) => setToasts((prev) => [...prev, msg]);

// Modal context
const [modalContent, setModalContent] = useState(null);
const openModal = (content) => setModalContent(content);
const closeModal = () => setModalContent(null);

// Auth context
const [user, setUser] = useState(null);
const login = async (credentials) => {
  /* fetch */
};
const logout = () => setUser(null);
```

Semua mengikuti pola yang sama:

1. State di Provider
2. Fungsi untuk mengubah state
3. Hook untuk mengakses dari luar
