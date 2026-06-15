import {
  TrendingUp, TrendingDown, DollarSign, Coins, Activity,
  AlertTriangle, FileWarning, ListChecks, ShieldAlert, Banknote,
  HandCoins, Receipt, ClipboardList, Building2, ArrowRight, CheckCircle2
} from 'lucide-react';
import { money } from '@/lib/format';
import { trpc } from '@/lib/trpc';
import { useStore } from '@/lib/store';
import { useSound } from '@/contexts/SoundContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { PageId } from '@/lib/types';
import { useMemo } from 'react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663690140697/LEwiJDTkxh7Zpu9QQSN3Ab/ce-empire-dashboard-hero-EsRJuHYLV27xj9LXu6NAhm.webp';

export default function DashboardPage() {
  const { setPage } = useStore();
  const { play } = useSound();

  // ── Real data via existing tRPC procedures ──
  const { data: summary, isLoading: summaryLoading } = trpc.analytics.getSummaryToday.useQuery(undefined, { retry: false });
  const { data: expenses = [] } = trpc.expenses.list.useQuery(undefined, { retry: false });
  const { data: accounts = [] } = trpc.accounts.list.useQuery(undefined, { retry: false });
  const { data: activeTasks = [] } = trpc.tasks.getMyActiveTasks.useQuery(undefined, { retry: false });
  const { data: riskAlerts = [] } = trpc.risk.listAlerts.useQuery({ limit: 20, offset: 0 }, { retry: false });

  // ── Today Overview ──
  const revenueToday = summary?.deposits.total ?? 0;
  const expenseToday = summary?.usdt.totalTHB ?? 0;
  const profitToday = summary?.profit.total ?? 0;
  const usdtToday = summary?.usdt.total ?? 0;
  const txCount = (summary?.deposits.count ?? 0) + (summary?.usdt.count ?? 0) + (summary?.profit.count ?? 0);

  const overview = [
    { label: 'รายรับวันนี้', value: revenueToday, unit: '฿', decimals: 0, icon: TrendingUp, color: '#D4AF37' },
    { label: 'รายจ่ายวันนี้', value: expenseToday, unit: '฿', decimals: 0, icon: TrendingDown, color: '#C0C0C0' },
    { label: 'กำไรวันนี้', value: profitToday, unit: '฿', decimals: 0, icon: DollarSign, color: '#D4AF37' },
    { label: 'USDT วันนี้', value: usdtToday, unit: 'USDT', decimals: 2, icon: Coins, color: '#C0C0C0' },
    { label: 'จำนวนธุรกรรม', value: txCount, unit: 'รายการ', decimals: 0, icon: Activity, color: '#C0C0C0' },
  ];

  // ── AI Alerts (derived from real data) ──
  const pendingExpenses = useMemo(
    () => (expenses as any[]).filter((e) => (e.status ?? e.type) === 'pending'),
    [expenses]
  );
  const missingSlips = useMemo(
    () => pendingExpenses.filter((e) => !e.proofUrl && !e.proofKey && !e.slipImage).length,
    [pendingExpenses]
  );
  // Bank limit warning: accounts marked inactive / dormant act as a proxy for limit issues.
  const bankLimitWarnings = useMemo(
    () => (accounts as any[]).filter((a) => a.isActive === 'no' || a.isDormant).length,
    [accounts]
  );
  const openTasks = (activeTasks as any[]).length;
  const riskWarnings = (riskAlerts as any[]).filter((a) => !a.isResolved).length;

  const alerts = [
    { label: 'สลิปที่หายไป', value: missingSlips, icon: FileWarning, color: '#F59E0B', page: 'proof' as PageId },
    { label: 'เตือนวงเงินธนาคาร', value: bankLimitWarnings, icon: AlertTriangle, color: '#EF4444', page: 'accounts' as PageId },
    { label: 'งานที่ค้างอยู่', value: openTasks, icon: ListChecks, color: '#D4AF37', page: 'tasks' as PageId },
    { label: 'เตือนความเสี่ยง', value: riskWarnings, icon: ShieldAlert, color: '#EF4444', page: 'risk-analysis' as PageId },
  ];

  // ── Activity Feed (from open tasks + recent expenses) ──
  const activity = useMemo(() => {
    const taskItems = (activeTasks as any[]).map((t) => ({
      id: `task-${t.id}`,
      title: t.title as string,
      sub: 'งานที่ต้องทำ',
      date: new Date(t.createdAt ?? Date.now()),
      color: '#D4AF37',
    }));
    const expenseItems = (expenses as any[]).map((e) => ({
      id: `exp-${e.id}`,
      title: (e.title ?? e.description ?? 'รายการ') as string,
      sub: `฿${money(parseFloat(e.amount ?? '0'))}`,
      date: new Date(e.createdAt ?? e.created_at ?? Date.now()),
      color: (e.status ?? e.type) === 'paid' ? '#10B981' : '#F59E0B',
    }));
    return [...taskItems, ...expenseItems]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [activeTasks, expenses]);

  // ── Quick Actions ──
  const quickActions = [
    { label: 'รับเงิน', icon: HandCoins, color: '#10B981', page: 'accounts' as PageId },
    { label: 'รายจ่าย', icon: Receipt, color: '#F59E0B', page: 'expenses' as PageId },
    { label: 'งาน', icon: ClipboardList, color: '#D4AF37', page: 'tasks' as PageId },
    { label: 'ธนาคาร', icon: Building2, color: '#C0C0C0', page: 'accounts' as PageId },
  ];

  const go = (page: PageId) => { play('click'); setPage(page); };

  return (
    <div className="animate-fade-up space-y-4 sm:space-y-5">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-[#D4AF37]/20"
        style={{ background: `linear-gradient(135deg, rgba(12,13,16,0.92), rgba(16,18,22,0.85)), url(${HERO_BG}) center/cover no-repeat` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0D10]/95 via-[#16181C]/75 to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-[#D4AF37] tracking-[0.22em] uppercase mb-1.5 font-heading">Command Center</p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">ภาพรวมวันนี้</h2>
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-pulse-green" />
            <span className="text-[10px] text-emerald-400 font-medium">ระบบทำงานปกติ</span>
          </div>
        </div>
      </section>

      {/* ── Today Overview ── */}
      <section>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-0.5">ภาพรวมวันนี้</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 stagger-children">
          {overview.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="glass-card rounded-2xl p-4 flex flex-col gap-2.5 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms`, border: `1px solid ${m.color}22` }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{m.label}</p>
                  <span className="p-1.5 rounded-lg" style={{ background: `${m.color}18` }}>
                    <Icon size={13} style={{ color: m.color }} />
                  </span>
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-7 w-20 bg-slate-700" />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
                      {m.value.toLocaleString('th-TH', { minimumFractionDigits: m.decimals, maximumFractionDigits: m.decimals })}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: m.color }}>{m.unit}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-0.5">ทางลัด</h3>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => go(a.page)}
                className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 hover:border-[#D4AF37]/30"
              >
                <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}18`, border: `1px solid ${a.color}33` }}>
                  <Icon size={18} style={{ color: a.color }} />
                </span>
                <span className="text-xs font-medium text-white">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── AI Alerts + Activity Feed ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Alerts */}
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-[#D4AF37]" /> AI Alerts
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {alerts.map((al) => {
              const Icon = al.icon;
              const has = al.value > 0;
              return (
                <button
                  key={al.label}
                  onClick={() => go(al.page)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/40 border text-left transition-all hover:bg-slate-800/60"
                  style={{ borderColor: has ? `${al.color}40` : 'rgba(148,163,184,0.08)' }}
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${al.color}18` }}>
                    <Icon size={14} style={{ color: al.color }} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white leading-none">{al.value}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{al.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
              <Activity size={14} className="text-[#D4AF37]" /> Activity Feed
            </h3>
            <button onClick={() => go('history')} className="text-[10px] text-[#D4AF37] flex items-center gap-1 hover:underline">
              ดูทั้งหมด <ArrowRight size={11} />
            </button>
          </div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 text-center">
              <CheckCircle2 size={22} className="text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">ยังไม่มีกิจกรรม</p>
            </div>
          ) : (
            <ol className="relative border-l border-[rgba(148,163,184,0.15)] ml-1.5 space-y-2.5">
              {activity.map((it) => (
                <li key={it.id} className="ml-3.5">
                  <span className="absolute -left-[5px] w-2 h-2 rounded-full mt-1.5" style={{ background: it.color }} />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{it.title}</p>
                      <p className="text-[9px] text-slate-500">{it.sub} · {it.date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
