/**
 * useSoundEffect - เสียงเอฟเฟคสำหรับ CE Empire
 * สร้างเสียงด้วย Web Audio API (ไม่ต้องโหลดไฟล์)
 */

type SoundType = 'click' | 'success' | 'delete' | 'warning' | 'open' | 'copy' | 'save' | 'error';

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0
) {
  try {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch {
    // Ignore audio errors silently
  }
}

const SOUNDS: Record<SoundType, () => void> = {
  // คลิกปุ่มทั่วไป - เสียงสั้นกระชับ
  click: () => {
    playTone(800, 0.08, 'square', 0.15);
  },

  // สำเร็จ - เสียงขึ้น 2 โน้ต
  success: () => {
    playTone(523, 0.12, 'sine', 0.25);       // C5
    playTone(784, 0.18, 'sine', 0.25, 0.12); // G5
  },

  // ลบ - เสียงลง
  delete: () => {
    playTone(400, 0.08, 'sawtooth', 0.2);
    playTone(280, 0.15, 'sawtooth', 0.15, 0.08);
  },

  // เตือน - เสียงสั่น
  warning: () => {
    playTone(600, 0.1, 'square', 0.2);
    playTone(550, 0.1, 'square', 0.2, 0.12);
    playTone(600, 0.1, 'square', 0.2, 0.24);
  },

  // เปิดแอป - เสียงไทย "ดนตรี" สั้น
  open: () => {
    playTone(392, 0.1, 'sine', 0.2);        // G4
    playTone(523, 0.1, 'sine', 0.2, 0.1);   // C5
    playTone(659, 0.1, 'sine', 0.2, 0.2);   // E5
    playTone(784, 0.2, 'sine', 0.25, 0.3);  // G5
  },

  // คัดลอก - เสียงสั้น 2 ครั้ง
  copy: () => {
    playTone(700, 0.06, 'sine', 0.2);
    playTone(900, 0.06, 'sine', 0.2, 0.08);
  },

  // บันทึก - เสียงขึ้น
  save: () => {
    playTone(440, 0.1, 'sine', 0.2);
    playTone(660, 0.15, 'sine', 0.25, 0.1);
  },

  // ผิดพลาด - เสียงต่ำ
  error: () => {
    playTone(200, 0.2, 'sawtooth', 0.25);
    playTone(150, 0.25, 'sawtooth', 0.2, 0.2);
  },
};

// Global sound enabled state (persisted in localStorage)
function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem('ce-sound') !== 'off';
  } catch {
    return true;
  }
}

export function playSound(type: SoundType) {
  if (!isSoundEnabled()) return;
  SOUNDS[type]?.();
}

export function useSoundEffect() {
  const play = (type: SoundType) => playSound(type);

  const clickProps = {
    onClick: (e: React.MouseEvent) => {
      playSound('click');
    },
  };

  return { play, clickProps };
}

export type { SoundType };
