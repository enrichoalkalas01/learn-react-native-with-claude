# Changelog 001 — Initial Setup & Dokumentasi Awal

**Tanggal:** 2026-04-16
**Tipe:** Setup & Dokumentasi
**Status:** Selesai

---

## Apa yang Dilakukan

Membuat folder `docs/` beserta dokumentasi awal yang menjelaskan seluruh
kondisi project dari awal (initial Expo template).

---

## Mengapa Dilakukan

Agar setiap perubahan dan pembelajaran bisa terdokumentasi dengan baik.
Dokumentasi ini menjadi referensi untuk memahami:

- Apa yang sudah ada di project
- Kenapa dibuat seperti itu
- Bagaimana cara kerjanya

---

## File yang Dibuat

```
docs/
├── README.md                          # Indeks & log semua perubahan
├── project-overview.md                # Tech stack & cara menjalankan
├── architecture/
│   └── folder-structure.md           # Penjelasan tiap folder & file
└── concepts/
    ├── 01-components.md              # Komponen dasar RN
    ├── 02-styling.md                 # StyleSheet, Flexbox, units
    ├── 03-navigation.md              # Expo Router, Stack, Tabs, Modal
    ├── 04-theming.md                 # Light/dark mode, Colors, hooks
    └── 05-animations.md             # Reanimated, parallax, keyframes
```

---

## Kondisi Project Saat Ini

Project adalah **default Expo template** yang belum dimodifikasi.
Fitur yang sudah ada:

| Fitur                         | File                                  | Status |
| ----------------------------- | ------------------------------------- | ------ |
| Tab navigasi (Home + Explore) | `app/(tabs)/`                         | Ada    |
| Stack navigator + Modal       | `app/_layout.tsx`                     | Ada    |
| Light/dark mode support       | `constants/theme.ts`, `hooks/`        | Ada    |
| Parallax scroll view          | `components/parallax-scroll-view.tsx` | Ada    |
| Animasi wave emoji            | `components/hello-wave.tsx`           | Ada    |
| Haptic feedback di tab        | `components/haptic-tab.tsx`           | Ada    |
| Collapsible/accordion         | `components/ui/collapsible.tsx`       | Ada    |
| Themed Text & View            | `components/themed-*.tsx`             | Ada    |
| Icon cross-platform           | `components/ui/icon-symbol.tsx`       | Ada    |

---

## Struktur Navigasi

```
RootLayout (Stack)
├── (tabs) — headerShown: false
│   ├── index.tsx   → tab "Home"
│   └── explore.tsx → tab "Explore"
└── modal.tsx → presentation: 'modal'
```

---

## Dependencies Utama

```json
{
  "expo": "~54.0.33",
  "expo-router": "~6.0.23",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~4.1.1",
  "typescript": "~5.9.2"
}
```

---

## Catatan Belajar

- Project menggunakan **Expo managed workflow** — tidak ada folder `android/` atau `ios/`
- File-based routing = nama file menentukan URL, seperti Next.js
- Semua komponen sudah support **dark mode** sejak awal
- Animasi menggunakan **Reanimated 4** (bukan Animated bawaan RN)
