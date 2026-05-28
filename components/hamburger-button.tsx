import { Pressable, StyleSheet } from 'react-native';

import { useSidebar } from '@/context/sidebar-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';

export function HamburgerButton() {
  const { toggle } = useSidebar();
  const color = useThemeColor({}, 'text');

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
      {/* 3 garis hamburger dengan ThemedText sebagai trick lintas platform */}
      <ThemedText style={[styles.icon, { color }]}>☰</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
    padding: 4,
  },
  icon: {
    fontSize: 22,
    lineHeight: 26,
  },
});
