# Project Overview

## Tujuan Project

Project ini dibuat sebagai **sandbox belajar React Native** menggunakan Expo.
Setiap fitur yang ditambahkan bertujuan untuk mempelajari konsep tertentu — bukan untuk production.

---

## Tech Stack

| Teknologi                    | Versi    | Kegunaan                   |
| ---------------------------- | -------- | -------------------------- |
| React Native                 | 0.81.5   | Framework utama mobile app |
| React                        | 19.1.0   | Library UI                 |
| Expo                         | ~54.0.33 | Managed workflow & tooling |
| Expo Router                  | ~6.0.23  | File-based navigation      |
| TypeScript                   | ~5.9.2   | Type safety                |
| React Navigation             | ^7.x     | Navigator (tabs, stack)    |
| React Native Reanimated      | ~4.1.1   | Animasi performa tinggi    |
| React Native Gesture Handler | ~2.28.0  | Gesture & touch handling   |

---

## Cara Menjalankan Project

```bash
# Install dependencies (pertama kali)
npm install

# Jalankan development server
npx expo start

# Pilih platform:
# Tekan `i` untuk iOS Simulator
# Tekan `a` untuk Android Emulator
# Tekan `w` untuk Web Browser
# Scan QR code dengan Expo Go app di HP
```

---

## Konsep Utama yang Dipelajari

- [Komponen Dasar](concepts/01-components.md) — View, Text, Image, StyleSheet
- [Styling](concepts/02-styling.md) — Flexbox, StyleSheet, inline style
- [Navigasi](concepts/03-navigation.md) — Expo Router, Tab, Stack, Modal
- [Theming](concepts/04-theming.md) — Light/Dark mode, custom colors
- [Animasi](concepts/05-animations.md) — Reanimated, parallax, wave
