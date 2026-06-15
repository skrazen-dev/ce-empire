import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Coins, DollarSign } from 'lucide-react';
import { useStore } from '@/lib/store';
import { trpc } from '@/lib/trpc';
import { useSound } from '@/contexts/SoundContext';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663690140697/LEwiJDTkxh7Zpu9QQSN3Ab/ce-empire-favicon-huVwYnigudxF9CKVaHQtCS.webp';

const TAGLINES = [
  'ทุกธุรกรรมสร้างอาณาจักร',
  'กำไรเกิดจากวินัย ไม่ใช่โชค',
  'เงินสดคือออกซิเจนของธุรกิจ',
  'ปกป้องทุนก่อนล่ากำไร',
];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Soft "wealth chime" using Web Audio API — a gentle 3-note major arpeggio. */
function playWealthChime() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.connect(ctx.destination);
    // C5, E5, G5 — warm major triad
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 1.2);
    });
    master.gain.setValueAtTime(0.9, now);
    // auto-close after the sound completes
    setTimeout(() => ctx.close().catch(() => {}), 2000);
  } catch {
    /* no-op */
  }
}

/** Gold particle + data-stream background on a canvas. Respects reduced-motion. */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let raf = 0;
    let width = 0;
    let height = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles: { x: number; y: number; vy: number; r: number; a: number }[] = [];
    const streams: { x: number; y: number; len: number; speed: number; a: number }[] = [];

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const PCOUNT = reduced ? 30 : 70;
    const SCOUNT = reduced ? 0 : 14;
    for (let i = 0; i < PCOUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: 0.1 + Math.random() * 0.4,
        r: 0.6 + Math.random() * 1.6,
        a: 0.2 + Math.random() * 0.6,
      });
    }
    for (let i = 0; i < SCOUNT; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 40 + Math.random() * 120,
        speed: 1 + Math.random() * 2.5,
        a: 0.05 + Math.random() * 0.18,
      });
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,175,55,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);

      // vertical data streams (chrome/gold thin lines)
      for (const s of streams) {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
        grad.addColorStop(0, 'rgba(212,175,55,0)');
        grad.addColorStop(1, `rgba(212,175,55,${s.a})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.len);
        ctx.stroke();
        s.y += s.speed;
        if (s.y - s.len > height) {
          s.y = -s.len;
          s.x = Math.random() * width;
        }
      }

      // rising gold particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,175,55,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.vy;
        if (p.y < -5) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }
      }
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

/** Animated counter that eases up to `value`. Respects reduced-motion. */
function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <>
      {display.toLocaleString('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

export default function LandingPage() {
  const { setEnteredApp, setPage } = useStore();
  const { play } = useSound();
  const [taglineIdx, setTaglineIdx] = useState(0);
  const chimedRef = useRef(false);

  // Real data (if available) — getSummaryToday is a real analytics procedure.
  const { data: summary } = trpc.analytics.getSummaryToday.useQuery(undefined, {
    retry: false,
  });

  const revenueToday = summary?.deposits.total ?? 0;
  const expenseToday = summary?.usdt.totalTHB ?? 0; // THB spent acquiring USDT
  const profitToday = summary?.profit.total ?? 0;
  const usdtToday = summary?.usdt.total ?? 0;

  const widgets = useMemo(
    () => [
      { label: 'รายรับวันนี้', value: revenueToday, unit: '฿', decimals: 0, icon: TrendingUp, color: '#D4AF37' },
      { label: 'รายจ่ายวันนี้', value: expenseToday, unit: '฿', decimals: 0, icon: TrendingDown, color: '#C0C0C0' },
      { label: 'กำไรวันนี้', value: profitToday, unit: '฿', decimals: 0, icon: DollarSign, color: '#D4AF37' },
      { label: 'USDT วันนี้', value: usdtToday, unit: 'USDT', decimals: 2, icon: Coins, color: '#C0C0C0' },
    ],
    [revenueToday, expenseToday, profitToday, usdtToday]
  );

  // Rotating tagline
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => {
      setTaglineIdx((i) => (i + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Play the wealth chime once after the first user interaction (autoplay-safe).
  useEffect(() => {
    const onInteract = () => {
      if (chimedRef.current) return;
      chimedRef.current = true;
      playWealthChime();
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
    window.addEventListener('pointerdown', onInteract);
    window.addEventListener('keydown', onInteract);
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  const handleEnter = () => {
    play('click');
    if (!chimedRef.current) {
      chimedRef.current = true;
      playWealthChime();
    }
    setPage('dashboard');
    setEnteredApp(true);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-5 py-12"
      style={{
        background:
          'radial-gradient(120% 120% at 50% 0%, #16181C 0%, #0C0D10 55%, #08090B 100%)',
      }}
    >
      <ParticleField />

      {/* subtle chrome vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="CE Empire"
          className="w-16 h-16 rounded-2xl mb-6 ring-1 ring-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.15)]"
        />

        {/* Title */}
        <h1
          className="font-heading font-bold tracking-[0.18em] text-4xl sm:text-6xl text-gradient-gold"
          style={{ letterSpacing: '0.16em' }}
        >
          CE EMPIRE
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-[#C0C0C0] tracking-wide font-medium">
          ศูนย์ปฏิบัติการการเงินอัจฉริยะ
        </p>

        {/* Rotating tagline */}
        <div className="h-7 mt-3 flex items-center justify-center overflow-hidden">
          <span
            key={taglineIdx}
            className="text-xs sm:text-sm text-[#8A8F98] animate-fade-up"
          >
            {TAGLINES[taglineIdx]}
          </span>
        </div>

        {/* Widgets */}
        <div className="mt-9 grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {widgets.map((w, i) => {
            const Icon = w.icon;
            return (
              <div
                key={w.label}
                className="glass-card rounded-2xl p-4 flex flex-col gap-2.5 animate-fade-up text-left"
                style={{
                  animationDelay: `${i * 80}ms`,
                  border: `1px solid ${w.color}22`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8A8F98]">
                    {w.label}
                  </span>
                  <span
                    className="p-1.5 rounded-lg"
                    style={{ background: `${w.color}18` }}
                  >
                    <Icon size={13} style={{ color: w.color }} />
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
                    <Counter value={w.value} decimals={w.decimals} />
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: w.color }}>
                    {w.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="group mt-10 inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-heading font-semibold text-sm tracking-[0.18em] uppercase transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8932E 100%)',
            color: '#0C0D10',
            boxShadow: '0 0 30px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          Enter Command Center
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>

        {!summary && (
          <p className="mt-4 text-[10px] text-[#5A5F68]">
            กำลังเชื่อมต่อข้อมูลสด — แสดงค่าเริ่มต้นชั่วคราว
          </p>
        )}
      </div>
    </div>
  );
}
