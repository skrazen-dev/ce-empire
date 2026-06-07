import React, { createContext, useContext, useState, useCallback } from 'react';
import { playSound, SoundType } from '@/hooks/useSoundEffect';

interface SoundContextValue {
  soundEnabled: boolean;
  toggleSound: () => void;
  play: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextValue>({
  soundEnabled: true,
  toggleSound: () => {},
  play: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('ce-sound') !== 'off';
    } catch {
      return true;
    }
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('ce-sound', next ? 'on' : 'off');
      } catch {}
      return next;
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    if (soundEnabled) playSound(type);
  }, [soundEnabled]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
