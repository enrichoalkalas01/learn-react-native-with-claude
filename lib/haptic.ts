// Wrapper tipis untuk expo-haptics — hanya panggil jika support tersedia.
// expo-haptics tidak bekerja di web; semua call jadi no-op silently.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const NATIVE = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptic = {
  light: () => {
    if (NATIVE) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    if (NATIVE) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  heavy: () => {
    if (NATIVE) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },
  selection: () => {
    if (NATIVE) Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    if (NATIVE)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning: () => {
    if (NATIVE)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
  error: () => {
    if (NATIVE)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
