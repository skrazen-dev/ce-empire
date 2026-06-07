import { useEffect, useState } from 'react';
import { playSound } from '@/hooks/useSoundEffect';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'logo' | 'loading' | 'done'>('logo');
  const [statusText, setStatusText] = useState('กำลังเริ่มระบบ...');

  useEffect(() => {
    // Play open sound
    const t0 = setTimeout(() => playSound('open'), 300);

    // Phase 1: Logo appear
    const t1 = setTimeout(() => setPhase('loading'), 600);

    // Progress bar
    const steps = [
      { delay: 700,  progress: 15, text: 'โหลดข้อมูลบัญชี...' },
      { delay: 900,  progress: 35, text: 'เชื่อมต่อฐานข้อมูล...' },
      { delay: 1100, progress: 55, text: 'ตรวจสอบสิทธิ์...' },
      { delay: 1300, progress: 75, text: 'โหลดการตั้งค่า...' },
      { delay: 1500, progress: 90, text: 'เกือบเสร็จแล้ว...' },
      { delay: 1700, progress: 100, text: 'พร้อมใช้งาน!' },
    ];

    const timers = steps.map(({ delay, progress, text }) =>
      setTimeout(() => {
        setProgress(progress);
        setStatusText(text);
      }, delay)
    );

    // Done
    const tDone = setTimeout(() => {
      setPhase('done');
      playSound('success');
      setTimeout(onComplete, 400);
    }, 2000);

    return () => {
      clearTimeout(t0); clearTimeout(t1); clearTimeout(tDone);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-400 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1525 50%, #0a0e1a 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,217,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00D9FF, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-500 ${
        phase === 'logo' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
      }`}>

        {/* Logo */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(0,217,255,0.15), rgba(168,85,247,0.15))',
              borderColor: 'rgba(0,217,255,0.4)',
              boxShadow: '0 0 40px rgba(0,217,255,0.3), inset 0 0 20px rgba(0,217,255,0.05)',
              color: '#00D9FF',
            }}
          >
            CE
          </div>
          {/* Spinning ring */}
          <div
            className="absolute -inset-2 rounded-2xl border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#00D9FF',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'rgba(0,217,255,0.3)',
              animationDuration: '2s',
            }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-wider" style={{ color: '#00D9FF' }}>
            CE EMPIRE
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,217,255,0.5)' }}>
            Banking Dashboard
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00D9FF, #A855F7)',
                boxShadow: '0 0 8px rgba(0,217,255,0.6)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {statusText}
            </p>
            <p className="text-xs font-mono" style={{ color: '#00D9FF' }}>
              {progress}%
            </p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: '#00D9FF',
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
