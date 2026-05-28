# Changelog 011 — Custom Tab Bar + Push Notifications Page

**Tanggal:** 2026-05-12
**Tipe:** Feature + Refactor
**Status:** Selesai

---

## Apa yang Dilakukan

1. **Custom Bottom Tab Bar** — replace default Expo tab bar dengan custom component yang lebih bagus & animated
2. **Push Notifications Page** — halaman lengkap untuk send notif ke HP: instant, scheduled, daily reminder, dengan custom form

---

## File yang Dibuat / Diubah

| File                            | Status   | Perubahan                                             |
| ------------------------------- | -------- | ----------------------------------------------------- |
| `components/custom-tab-bar.tsx` | **Baru** | Custom tab bar dengan animated pill + haptic          |
| `app/(tabs)/_layout.tsx`        | Refactor | Pakai `tabBar={(props) => <CustomTabBar />}`          |
| `app/apps/notifications.tsx`    | **Baru** | Push notification page (form + list + daily)          |
| `lib/notifications.ts`          | Diubah   | Tambah `listScheduled`, `cancelById`, `sendImmediate` |
| `app/_layout.tsx`               | Diubah   | Register Stack.Screen                                 |
| `app/(tabs)/apps.tsx`           | Diubah   | Kartu Push Notifications                              |
| `components/sidebar.tsx`        | Diubah   | Menu sidebar baru                                     |

---

## Bagian 1: Custom Tab Bar

### Sebelum (default Expo)

- Plain bottom tabs
- Active state cuma warna icon (tint)
- Tidak ada animasi
- Label statis

### Sesudah (custom)

- **Pill highlight** di belakang active icon yang animate (fade + scale)
- **Icon translate ke atas sedikit** saat active
- **Label opacity animate** (0.6 → 1.0 saat active)
- **Press feedback** scale 0.88 (spring)
- **Haptic** di iOS saat tap
- **Dark mode aware** (otomatis ganti warna pill)

### Bagaimana Kerjanya

`Tabs` dari `expo-router` accept prop `tabBar`:

```tsx
<Tabs tabBar={(props) => <CustomTabBar {...props} />}>...</Tabs>
```

`props` bertipe `BottomTabBarProps` dari `@react-navigation/bottom-tabs`, berisi:

- `state.routes` — array semua tab
- `state.index` — index tab aktif sekarang
- `descriptors` — metadata tiap tab
- `navigation` — function untuk navigate

### Pattern Penting: Animasi Active State

Tiap tab punya `useSharedValue` untuk track progress active (0–1):

```tsx
const activeProgress = useSharedValue(isFocused ? 1 : 0);

useEffect(() => {
  activeProgress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
}, [isFocused]);
```

Lalu derive style dari progress:

```tsx
const pillStyle = useAnimatedStyle(() => ({
  opacity: activeProgress.value,
  transform: [{ scale: 0.7 + activeProgress.value * 0.3 }],
}));

const iconWrapStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: -activeProgress.value * 2 }],
}));
```

Hasil: smooth fade + scale + lift, bukan instant switch.

### Press Feedback (Tap Animation)

Pakai `onPressIn` / `onPressOut`:

```tsx
const pressScale = useSharedValue(1);

const handlePressIn = () =>
  (pressScale.value = withSpring(0.88, { damping: 12, stiffness: 300 }));

const handlePressOut = () =>
  (pressScale.value = withSpring(1, { damping: 10, stiffness: 200 }));
```

User feel: tap → ikon "tertekan" sebentar, lalu balik. Tactile feedback yang clean.

### Navigation Emit Pattern

Yang penting di custom tab bar: tetap pakai emit pattern bawaan supaya behaviour konsisten:

```tsx
const event = navigation.emit({
  type: 'tabPress',
  target: route.key,
  canPreventDefault: true,
});

if (!isFocused && !event.defaultPrevented) {
  navigation.navigate(route.name, route.params);
}
```

`canPreventDefault` artinya tab bisa di-cancel oleh listener (misal: "user belum login, tidak boleh ke tab ini").

---

## Bagian 2: Push Notifications Page

### URL & Akses

- Tab **Apps → Push Notifications** (icon 🔔)
- Sidebar **Mini Apps → Push Notifications**
- URL langsung: `/apps/notifications`

### Section yang Ada

| #   | Section         | Fungsi                                              |
| --- | --------------- | --------------------------------------------------- |
| 1   | Permission      | Request + status badge (Granted / Denied / Unknown) |
| 2   | Kirim Cepat     | Preset delay (Sekarang, 5s, 15s, 30s, 1m, 5m)       |
| 3   | Notif Custom    | Form: title + body + delay → send                   |
| 4   | Daily Reminder  | Stepper jam:menit + title + body → save             |
| 5   | Notif Terjadwal | List semua scheduled + cancel each + cancel all     |

### Lib Extensions

`lib/notifications.ts` di-extend dengan 3 function baru:

```ts
// Send immediate (no delay) — pakai trigger: null
export async function sendImmediate(title: string, body: string);

// Cancel notif spesifik by identifier
export async function cancelById(identifier: string);

// List semua scheduled dengan info ringkas
export async function listScheduled(): Promise<ScheduledItem[]>;
```

`ScheduledItem` shape:

```ts
type ScheduledItem = {
  id: string;
  title: string;
  body: string;
  triggerSummary: string; // "in 30s" atau "setiap 09:00"
};
```

### Pattern: Trigger Type Detection

Saat read scheduled notifications, `trigger` adalah union type. Bikin helper untuk format readable:

```ts
function summarizeTrigger(trigger: unknown): string {
  const t = trigger as {
    type?: string;
    seconds?: number;
    hour?: number;
    minute?: number;
  };
  if (t.type === 'timeInterval') return `in ${t.seconds}s`;
  if (t.type === 'daily') {
    const hh = String(t.hour).padStart(2, '0');
    const mm = String(t.minute ?? 0).padStart(2, '0');
    return `setiap ${hh}:${mm}`;
  }
  return t.type ?? 'scheduled';
}
```

### Expo Go Detection

Sejak SDK 53+, push notif **tidak jalan di Expo Go**. Page deteksi & show warning:

```tsx
import { IS_EXPO_GO } from '@/lib/notifications';

{
  IS_EXPO_GO ? (
    <View className="bg-amber-50 ...">
      <Text>⚠️ Push notif tidak jalan di Expo Go — pakai dev build</Text>
    </View>
  ) : null;
}
```

Solusi untuk user: `npx expo run:ios` atau `npx expo run:android` untuk dev build.

### Form Pattern: Stepper untuk Jam/Menit

Tidak pakai library picker. Stepper sederhana:

```tsx
const [reminderHour, setReminderHour] = useState(9);

<Pressable onPress={() => setReminderHour(h => Math.max(0, h - 1))}>
  <Text>−</Text>
</Pressable>
<Text>{String(reminderHour).padStart(2, '0')}</Text>
<Pressable onPress={() => setReminderHour(h => Math.min(23, h + 1))}>
  <Text>+</Text>
</Pressable>
```

Lebih simple dari `DateTimePicker`, lebih cocok untuk demo.

### Auto-refresh List

Setelah send/cancel notif, list refresh sendiri:

```tsx
const refresh = useCallback(async () => {
  const list = await listScheduled();
  setScheduled(list);
}, []);

useEffect(() => {
  refresh();
}, [refresh]);

const sendCustom = async () => {
  // ... send notif
  await refresh(); // re-fetch
};
```

Atau user bisa manual via tombol "🔄 Refresh".

### Layout Animation untuk List

Notif list pakai Reanimated layout animation supaya smooth saat add/remove:

```tsx
<Animated.View
  entering={FadeIn.duration(200)}
  exiting={FadeOut.duration(150)}
  layout={LinearTransition.duration(200)}>
  ...
</Animated.View>
```

Cancel notif → row fade out → items lain naik smooth.

---

## Konsep Baru Diintroduksi

| Konsep                                    | Penjelasan                                                         |
| ----------------------------------------- | ------------------------------------------------------------------ |
| **Custom tab bar component**              | Replace default tabs dengan komponen kustom via `tabBar` prop      |
| **`BottomTabBarProps` shape**             | `state.routes`, `state.index`, `descriptors`, `navigation`         |
| **`navigation.emit('tabPress')`**         | Pattern proper untuk emit event sebelum navigate                   |
| **`useColorScheme()` di tab bar**         | Dark mode aware tanpa context                                      |
| **`trigger: null` di expo-notifications** | Cara kirim notif immediate (tanpa delay)                           |
| **Trigger type narrowing**                | TypeScript-friendly cara baca trigger dari scheduled               |
| **`KeyboardAvoidingView`**                | Wrap ScrollView yang punya TextInput supaya tidak ketutup keyboard |
| **`keyboardShouldPersistTaps`**           | Tap chip saat keyboard open tidak dismiss keyboard dulu            |

---

## Cara Coba

### Tab Bar

Restart Metro dengan clear cache:

```bash
npx expo start --clear
```

Switch antar tab → lihat animasi pill, icon lift, label opacity. Tahan tab → long press feedback.

### Push Notifications

**Di Expo Go:** Form tetap berfungsi (tombol bisa di-tap), tapi notif tidak muncul karena limitasi Expo Go. Banner warning akan tampil di atas page.

**Di Dev Build:**

```bash
npx expo run:ios     # iOS
npx expo run:android # Android
```

Lalu buka **Apps → Push Notifications**:

1. Tap **Request Permission** — kasih izin di OS prompt
2. Tap **5 detik** di section Kirim Cepat
3. **Tutup app** (lock screen / minimize)
4. Tunggu 5 detik → notif muncul di tray

Untuk test daily reminder:

1. Set jam dekat-dekat (misal jam sekarang + 1 menit)
2. Set tombol Save
3. Tutup app, tunggu

Untuk lihat scheduled list:

1. Schedule beberapa notif dengan delay panjang (5 menit)
2. Lihat di section "Notif Terjadwal"
3. Tap × untuk cancel salah satu, atau "Batalkan Semua"

---

## Coba Sendiri

1. **Notif kategori** — channel berbeda di Android (importance, sound)
2. **Notif dengan action** — tombol "Reply" / "Dismiss" di notif (`categoryIdentifier`)
3. **Notif dengan image** — `attachments` untuk iOS, `largeIcon` untuk Android
4. **Token registration** — `getExpoPushTokenAsync` untuk remote push dari server
5. **Notif tap handler** — `addNotificationResponseReceivedListener` untuk react saat user tap notif
6. **Tab bar lain** — coba design dengan FAB (floating action button) di tengah
7. **Tab transition** — animate screen content saat switch tab (slide / fade)
