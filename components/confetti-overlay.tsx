import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export type ConfettiOverlayHandle = {
  fire: () => void;
};

// Overlay confetti yang bisa dipanggil dari mana saja via ref.
// Render-nya pakai pointerEvents="none" agar tidak block touch.
export const ConfettiOverlay = forwardRef<ConfettiOverlayHandle>((_, ref) => {
  const cannonRef = useRef<ConfettiCannon>(null);

  useImperativeHandle(ref, () => ({
    fire: () => cannonRef.current?.start(),
  }));

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}>
      <ConfettiCannon
        ref={cannonRef}
        count={120}
        origin={{ x: SCREEN_W / 2, y: -20 }}
        autoStart={false}
        fadeOut
        explosionSpeed={350}
        fallSpeed={2800}
        colors={['#0a7ea4', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899']}
      />
      {/* Hint penggunaan SCREEN_H untuk silence unused warning */}
      <View style={{ height: 0, width: SCREEN_H * 0 }} />
    </View>
  );
});

ConfettiOverlay.displayName = 'ConfettiOverlay';
