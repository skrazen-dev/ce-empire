import { useMemo, useState } from 'react';
import { Search, Clock, Receipt, FileClock, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { money } from '@/lib/format';

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

const RANGE_CHIPS: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'วันนี้' },
  { key: 'yesterday', label: 'เมื่อวาน' },
  { key: '7d', label: '7 วัน' },
  { key: '30d', label: '30 วัน' },
  { key: 'custom', label: 'กำหนดเอง' },
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

interface TimelineItem {
  id: string | number;
  title: string;
  amount: number;
  status: string;
  date: Date;
  category?: string | null;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  paid: { label: 'จ่ายแล้ว', color: '#10B981' },
  pending: { label: 'ค้างจ่าย', color: '#F59E0B' },
  cancelled: { label: 'ยกเลิก', color: '#64748B' },
};

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<RangeKey>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Real data — expenses are the unified transaction record available via tRPC.
  const { data: expenses = [], isLoading } = trpc.expenses.list.useQuery();

  const items: TimelineItem[] = useMemo(() => {
    return (expenses as any[])
      .map((e) => ({
        id: e.id,
        title: e.title ?? e.description ?? 'รายการ',
        amount: parseFloat(e.amount ?? '0'),
        status: e.status ?? e.type ?? 'pending',
        category: e.category,
        date: new Date(e.paidAt ?? e.dueDate ?? e.createdAt ?? e.created_at ?? Date.now()),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    switch (range) {
      case 'today':
        return { rangeStart: todayStart, rangeEnd: now };
      case 'yesterday': {
        const ys = new Date(todayStart);
        ys.setDate(ys.getDate() - 1);
        return { rangeStart: ys, rangeEnd: todayStart };
      }
      case '7d': {
        const s = new Date(todayStart);
        s.setDate(s.getDate() - 6);
        return { rangeStart: s, rangeEnd: now };
      }
      case '30d': {
        const s = new Date(todayStart);
        s.setDate(s.getDate() - 29);
        return { rangeStart: s, rangeEnd: now };
      }
      case 'custom': {
        const s = customStart ? startOfDay(new Date(customStart)) : new Date(0);
        const e = customEnd ? new Date(new Date(customEnd).setHours(23, 59, 59, 999)) : now;
        return { rangeStart: s, rangeEnd: e };
      }
      default:
        return { rangeStart: new Date(0), rangeEnd: now };
    }
  }, [range, customStart, customEnd]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      const inRange = it.date >= rangeStart && it.date <= rangeEnd;
      if (!inRange) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        (it.category ?? '').toLowerCase().includes(q) ||
        String(it.amount).includes(q)
      );
    });
  }, [items, search, rangeStart, rangeEnd]);

  return (
    <div className="animate-fade-up space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/25">
          <Clock size={18} className="text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-heading tracking-tight">ประวัติทั้งหมด</h2>
          <p className="text-[11px] text-slate-400">ไทม์ไลน์ธุรกรรมและบันทึกการเปลี่ยนแปลง</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหารายการ, หมวดหมู่, จำนวนเงิน..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm bg-[#1A1F26] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/40 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {RANGE_CHIPS.map((c) => {
          const active = range === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setRange(c.key)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                active
                  ? {
                      background: 'rgba(212,175,55,0.14)',
                      border: '1px solid rgba(212,175,55,0.45)',
                      color: '#D4AF37',
                    }
                  : {
                      background: 'rgba(148,163,184,0.06)',
                      border: '1px solid rgba(148,163,184,0.12)',
                      color: '#94A3B8',
                    }
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Custom range inputs */}
      {range === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1A1F26] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
          />
          <span>ถึง</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1A1F26] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
          />
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
            <Receipt size={14} className="text-slate-400" /> ไทม์ไลน์ธุรกรรม
          </h3>
          <span className="text-[11px] text-slate-500">{filtered.length} รายการ</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-24 text-xs text-slate-500">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-center">
            <Clock size={22} className="text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">ไม่มีรายการในช่วงเวลานี้</p>
          </div>
        ) : (
          <ol className="relative border-l border-[rgba(148,163,184,0.15)] ml-2 space-y-3">
            {filtered.map((it) => {
              const meta = STATUS_META[it.status] ?? { label: it.status, color: '#94A3B8' };
              return (
                <li key={String(it.id)} className="ml-4">
                  <span
                    className="absolute -left-[5px] w-2.5 h-2.5 rounded-full mt-1.5"
                    style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}66` }}
                  />
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-[rgba(148,163,184,0.06)] hover:bg-slate-800/50 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{it.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {it.category && (
                          <span className="text-[9px] text-slate-500">{it.category}</span>
                        )}
                        <span className="text-[9px] text-slate-500">
                          {it.date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}{' '}
                          {it.date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-white">฿{money(it.amount)}</p>
                      <p className="text-[9px]" style={{ color: meta.color }}>{meta.label}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Audit Log */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
            <FileClock size={14} className="text-slate-400" /> บันทึกการเปลี่ยนแปลง (Audit Log)
          </h3>
        </div>

        {/* Column headers for the audit structure */}
        <div className="hidden sm:grid grid-cols-4 gap-2 px-3 pb-2 text-[9px] font-semibold uppercase tracking-widest text-slate-500 border-b border-[rgba(148,163,184,0.1)]">
          <span>สร้างโดย</span>
          <span>แก้ไขโดย</span>
          <span>ค่าเดิม</span>
          <span>ค่าใหม่</span>
        </div>

        <div className="flex flex-col items-center justify-center h-28 text-center">
          <FileClock size={22} className="text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">ยังไม่มีบันทึกการเปลี่ยนแปลง</p>
          <p className="text-[10px] text-slate-600 mt-1">
            ระบบ Audit Log จะแสดง ผู้สร้าง / ผู้แก้ไข / ค่าเดิม / ค่าใหม่ เมื่อมีข้อมูล
          </p>
        </div>
      </div>
    </div>
  );
}
