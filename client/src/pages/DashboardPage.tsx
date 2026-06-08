import { CreditCard, TrendingUp, TrendingDown, Receipt, DollarSign, Zap, BarChart3, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money } from '@/lib/format';
import PinnedAccountsWidget from '@/components/PinnedAccountsWidget';
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663690140697/LEwiJDTkxh7Zpu9QQSN3Ab/ce-empire-dashboard-hero-EsRJuHYLV27xj9LXu6NAhm.webp';

// Fallback static data (shown when no real data yet)
const FALLBACK_CHART = Array.from({ length: 7 }, (_, i) => ({
  date: `0${i + 1}`,
  deposits: 0, usdt: 0, fee: 0, profit: 0,
}));

// Mini sparkline bar chart
function MiniBarChart({ data, color, valueKey = 'amount' }: { data: any[]; color: string; valueKey?: string }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="flex items-end gap-[3px]" style={{ height: '40px' }}>
      {data.map((d, i) => {
        const h = (d[valueKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div
              className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
              style={{ height: `${h}%`, background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`, boxShadow: `0 0 4px ${color}44` }}
            />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1E293B] text-[8px] text-white px-1.5 py-0.5 rounded whitespace-nowrap z-10">
              {d[valueKey].toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { accounts, expenses } = useStore();
  const { data: summary, isLoading } = trpc.analytics.getSummaryToday.useQuery();
  const { data: chartData } = trpc.analytics.getDailyChart.useQuery({ days: 7 });
  const chart = chartData ?? FALLBACK_CHART;

  const totalAccounts = accounts.length;
  const totalPaid = accounts.reduce((s, a) => s + a.paidAmount, 0);
  const totalDue = accounts.reduce((s, a) => s + a.dueAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Account status stats (accountType is now an array)
  const skrillCount = accounts.filter(a => a.accountType?.includes('skrill')).length;
  const netellerCount = accounts.filter(a => a.accountType?.includes('neteller')).length;
  const bigpayCount = accounts.filter(a => a.accountType?.includes('bigpay')).length;
  const completeCount = accounts.filter(a => a.accountType?.includes('complete')).length;
  const limit50k = accounts.filter(a => a.creditLimit === '50k').length;
  const limit200k = accounts.filter(a => a.creditLimit === '200k').length;
  const limit500k = accounts.filter(a => a.creditLimit === '500k').length;

  // Big 4 headline metrics
  const depositTotal = summary?.deposits.total ?? chart.reduce((s, d) => s + d.deposits, 0);
  const usdtTotal = summary?.usdt.total ?? chart.reduce((s, d) => s + d.usdt, 0);
  const feeTotal = summary?.usdt.totalTHB ?? chart.reduce((s, d) => s + d.fee, 0);
  const profitTotal = summary?.profit.total ?? chart.reduce((s, d) => s + d.profit, 0);

  // Transform chart data for each metric
  const depData = chart.map(d => ({ date: d.date, amount: d.deposits }));
  const usdtData = chart.map(d => ({ date: d.date, amount: d.usdt }));
  const feeData = chart.map(d => ({ date: d.date, amount: d.fee }));
  const profData = chart.map(d => ({ date: d.date, profit: d.profit }));

  const BIG_METRICS = [
    { label: 'ยอดฝาก', value: depositTotal, unit: '฿', icon: DollarSign, color: '#00D9FF', glow: 'rgba(0,217,255,0.35)', data: depData, valueKey: 'amount' },
    { label: 'ยอด USDT', value: usdtTotal, unit: 'USDT', icon: Zap, color: '#FF8C42', glow: 'rgba(255,140,66,0.35)', data: usdtData, valueKey: 'amount' },
    { label: 'ค่าธรรมเนียม', value: feeTotal, unit: '฿', icon: BarChart3, color: '#EC4899', glow: 'rgba(236,72,153,0.35)', data: feeData, valueKey: 'amount' },
    { label: 'กำไร', value: profitTotal, unit: '฿', icon: TrendingUp, color: '#10B981', glow: 'rgba(16,185,129,0.35)', data: profData, valueKey: 'profit' },
  ];

  return (
    <div className="animate-fade-up space-y-4 sm:space-y-5">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-cyan-500/20" style={{ background: `linear-gradient(135deg, rgba(10, 14, 39, 0.9), rgba(15, 21, 53, 0.8)), url(${HERO_BG}) center/cover no-repeat` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E27]/95 via-[#0F1535]/75 to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-8 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl" />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-cyan-400 tracking-[0.22em] uppercase mb-1.5 font-heading">Overview</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-cyan-100 font-heading">CE Empire</h2>
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="status-pulse-green w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-400 font-medium">ระบบทำงานปกติ</span>
            </div>
          </div>
          {/* Mini secondary stats in hero */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">จ่ายแล้ว</p>
              <p className="text-xs font-semibold text-emerald-400">฿{money(totalPaid)}</p>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">ค้างจ่าย</p>
              <p className="text-xs font-semibold text-red-400">฿{money(totalDue)}</p>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">ค่าใช้จ่าย</p>
              <p className="text-xs font-semibold text-amber-400">฿{money(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIG 4 Headline Metrics ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {BIG_METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="glass-card rounded-2xl p-4 animate-fade-up flex flex-col gap-3 card-hover"
              style={{ animationDelay: `${i * 60}ms`, border: `1px solid ${m.color}22`, boxShadow: `0 0 20px ${m.glow}` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: m.color }}>{m.label}</p>
                <div className="p-1.5 rounded-lg" style={{ background: `${m.color}18` }}>
                  <Icon size={13} style={{ color: m.color }} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-slate-700" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
                    {m.value.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs font-medium" style={{ color: m.color }}>{m.unit}</span>
                </div>
              )}
              {/* Sparkline */}
              <MiniBarChart data={m.data} color={m.color} valueKey={m.valueKey} />
              {/* Bottom accent */}
              <div className="h-[1.5px] rounded-full" style={{ background: `linear-gradient(90deg, ${m.color}88, transparent)` }} />
            </div>
          );
        })}
      </section>

      {/* ── Secondary row: small stats + Account Status ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Small stats (paid/pending/expense/accounts) */}
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ภาพรวมบัญชี</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'บัญชีทั้งหมด', value: totalAccounts.toString(), color: '#2563EB', icon: CreditCard },
              { label: 'จ่ายแล้ว', value: `฿${money(totalPaid)}`, color: '#10B981', icon: TrendingUp },
              { label: 'ค้างจ่าย', value: `฿${money(totalDue)}`, color: '#EF4444', icon: TrendingDown },
              { label: 'ค่าใช้จ่ายรวม', value: `฿${money(totalExpenses)}`, color: '#F59E0B', icon: Receipt },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40">
                  <Icon size={11} style={{ color: s.color }} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] text-slate-500 truncate">{s.label}</p>
                    <p className="text-xs font-bold text-white truncate">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Status Widget */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">สถานะบัญชี</p>
            <span className="text-[10px] text-slate-500">{accounts.length} บัญชี</span>
          </div>
          {accounts.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-slate-500">ยังไม่มีบัญชี</div>
          ) : (
            <div className="space-y-3">
              {/* Account Type row */}
              <div>
                <p className="text-[9px] text-slate-500 mb-1.5 uppercase tracking-wider">ประเภทบัญชี</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'แอคตัดครบ', count: completeCount, color: '#10B981' },
                    { label: 'Skrill', count: skrillCount, color: '#A855F7' },
                    { label: 'Neteller', count: netellerCount, color: '#06B6D4' },
                    { label: 'BigPay', count: bigpayCount, color: '#F59E0B' },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: `${t.color}12`, border: `1px solid ${t.color}30` }}>
                      <CheckCircle2 size={10} style={{ color: t.color }} />
                      <span className="text-[10px] font-medium text-white">{t.label}</span>
                      <span className="text-[10px] font-bold px-1 rounded" style={{ background: `${t.color}25`, color: t.color }}>{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Credit Limit row */}
              <div>
                <p className="text-[9px] text-slate-500 mb-1.5 uppercase tracking-wider">วงเงิน</p>
                <div className="flex gap-2">
                  {[
                    { label: '50k', count: limit50k, color: '#64748B' },
                    { label: '200k', count: limit200k, color: '#2563EB' },
                    { label: '500k', count: limit500k, color: '#EC4899' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-1 justify-center" style={{ background: `${l.color}12`, border: `1px solid ${l.color}30` }}>
                      <span className="text-[10px] text-slate-400">{l.label}</span>
                      <span className="text-sm font-bold" style={{ color: l.color }}>{l.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Progress bar for account distribution */}
              {accounts.length > 0 && (
                <div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px">
                    {completeCount > 0 && <div className="bg-[#10B981] transition-all" style={{ width: `${(completeCount / accounts.length) * 100}%` }} />}
                    {skrillCount > 0 && <div className="bg-[#A855F7] transition-all" style={{ width: `${(skrillCount / accounts.length) * 100}%` }} />}
                    {netellerCount > 0 && <div className="bg-[#06B6D4] transition-all" style={{ width: `${(netellerCount / accounts.length) * 100}%` }} />}
                    {bigpayCount > 0 && <div className="bg-[#F59E0B] transition-all" style={{ width: `${(bigpayCount / accounts.length) * 100}%` }} />}
                    {(accounts.length - completeCount - skrillCount - netellerCount - bigpayCount) > 0 && (
                      <div className="bg-slate-700 flex-1" />
                    )}
                  </div>
                  <p className="text-[8px] text-slate-600 mt-1">การกระจายประเภทบัญชี</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Pinned Accounts Widget ── */}
      <section className="animate-fade-up delay-200">
        <PinnedAccountsWidget />
      </section>

      {/* ── Recent Transactions ── */}
      <div className="glass-card rounded-2xl animate-fade-up delay-300">
        <div className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white font-heading mb-3">รายการล่าสุด</h3>
          <div className="space-y-1.5">
            {[
              { id: '1', desc: 'ค่าโฆษณา Facebook', amount: 5500, type: 'paid', date: '04/06', bank: 'กสิกร' },
              { id: '2', desc: 'ค่าจ้าง Agent สมชาย', amount: 8200, type: 'pending', date: '03/06', bank: 'SCB' },
              { id: '3', desc: 'ค่า Server รายเดือน', amount: 2990, type: 'paid', date: '02/06', bank: 'กรุงไทย' },
              { id: '4', desc: 'ค่าโฆษณา TikTok', amount: 12000, type: 'pending', date: '01/06', bank: 'กสิกร' },
              { id: '5', desc: 'ค่าขนส่ง Flash', amount: 3450, type: 'paid', date: '31/05', bank: 'PromptPay' },
            ].map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/30 border border-[rgba(148,163,184,0.05)] hover:bg-slate-800/50 transition-all duration-150 animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tx.type === 'paid' ? '#10B981' : '#F59E0B' }} />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-xs font-medium text-white truncate">{tx.desc}</p>
                  <span className="text-[9px] text-slate-500 shrink-0">{tx.bank} · {tx.date}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">฿{tx.amount.toLocaleString()}</p>
                  <p className="text-[8px]" style={{ color: tx.type === 'paid' ? '#10B981' : '#F59E0B' }}>
                    {tx.type === 'paid' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
