# Struktur Folder

## Gambaran Umum

```
learn-react-native-with-claude/
├── app/                        # Semua screen/halaman (file-based routing)
│   ├── _layout.tsx             # Root layout — wraps seluruh app
│   ├── modal.tsx               # Screen modal
│   └── (tabs)/                 # Group tab navigasi
│       ├── _layout.tsx         # Konfigurasi tab bar
│       ├── index.tsx           # Screen "Home" (tab pertama)
│       └── explore.tsx         # Screen "Explore" (tab kedua)
│
├── components/                 # Komponen reusable
│   ├── themed-text.tsx         # Text dengan support dark/light mode
│   ├── themed-view.tsx         # View dengan support dark/light mode
│   ├── parallax-scroll-view.tsx # ScrollView dengan efek parallax di header
│   ├── hello-wave.tsx          # Animasi tangan melambai 👋
│   ├── haptic-tab.tsx          # Tab button dengan haptic feedback
│   ├── external-link.tsx       # Link yang buka browser eksternal
│   └── ui/
│       ├── icon-symbol.tsx     # Icon component (cross-platform)
│       ├── icon-symbol.ios.tsx # Override khusus iOS
│       └── collapsible.tsx     # Accordion/collapsible section
│
├── constants/
│   └── theme.ts                # Warna & font (light + dark mode)
│
├── hooks/                      # Custom React hooks
│   ├── use-color-scheme.ts     # Detect light/dark mode device
│   ├── use-color-scheme.web.ts # Override untuk web platform
│   └── use-theme-color.ts      # Ambil warna berdasarkan theme saat ini
│
├── assets/
│   └── images/                 # Asset gambar (icon, splash, logo)
│
├── scripts/
│   └── reset-project.js        # Script reset ke blank project
│
├── docs/                       # Dokumentasi belajar (folder ini)
├── app.json                    # Konfigurasi Expo (nama app, icon, splash)
├── package.json                # Dependencies & scripts
├── tsconfig.json               # Konfigurasi TypeScript
└── eslint.config.js            # Konfigurasi ESLint
```

---

## Penjelasan Per Folder

### `app/` — Routing Berbasis File

Expo Router menggunakan **file-based routing** seperti Next.js.
Setiap file `.tsx` di dalam folder `app/` otomatis menjadi sebuah route/screen.

| File                     | Route      | Keterangan                                     |
| ------------------------ | ---------- | ---------------------------------------------- |
| `app/_layout.tsx`        | (root)     | Layout wrapper global, tidak punya URL sendiri |
| `app/(tabs)/index.tsx`   | `/`        | Home screen                                    |
| `app/(tabs)/explore.tsx` | `/explore` | Explore screen                                 |
| `app/modal.tsx`          | `/modal`   | Modal screen                                   |

**Konvensi penamaan penting:**

- `_layout.tsx` → bukan screen, tapi layout/wrapper untuk sibling-nya
- `(folder)` → route group, nama foldernya tidak masuk ke URL
- `[param].tsx` → dynamic route (belum dipakai di sini)

---

### `components/` — Komponen Reusable

Komponen yang dipakai di banyak tempat. Dipisah dari `app/` agar mudah di-reuse.

**Pattern yang digunakan:**

- Komponen `Themed*` menerima prop `lightColor` dan `darkColor` opsional
- Jika tidak diberikan, otomatis pakai warna dari `constants/theme.ts`

---

### `constants/theme.ts` — Pusat Warna & Font

Semua warna app didefinisikan di satu tempat:

```ts
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',    // warna aksen utama
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: { ... }        // versi gelap
};
```

---

### `hooks/` — Custom Hooks

| Hook                              | Fungsi                                               |
| --------------------------------- | ---------------------------------------------------- |
| `useColorScheme()`                | Return `'light'` atau `'dark'` sesuai setting device |
| `useThemeColor(props, colorName)` | Return warna yang tepat berdasarkan mode saat ini    |

**Flow `useThemeColor`:**

```
useThemeColor({ light: '#fff', dark: '#000' }, 'background')
    ↓
Cek apakah prop light/dark diberikan?
    ├── Ya  → pakai warna dari prop
    └── Tidak → ambil dari Colors[theme]['background']
```
