import { createContext, useContext, useRef, type ReactNode } from 'react';
import {
  ConfettiOverlay,
  type ConfettiOverlayHandle,
} from '@/components/confetti-overlay';
import { haptic } from '@/lib/haptic';

type ConfettiContextType = {
  fire: () => void;
};

const ConfettiContext = createContext<ConfettiContextType | null>(null);

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const ref = useRef<ConfettiOverlayHandle>(null);

  const fire = () => {
    haptic.success();
    ref.current?.fire();
  };

  return (
    <ConfettiContext.Provider value={{ fire }}>
      {children}
      <ConfettiOverlay ref={ref} />
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  const ctx = useContext(ConfettiContext);
  if (!ctx) throw new Error('useConfetti must be used inside <ConfettiProvider>');
  return ctx;
}
