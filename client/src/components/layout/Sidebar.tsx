import {
  LayoutDashboard, Receipt, Users,
  DollarSign, Settings, Calculator, ShieldAlert,
  Home, BarChart2, FileText, Building2, Clock, ClipboardList, Sparkles
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { PageId } from '@/lib/types';
import { useSound } from '@/contexts/SoundContext';

// Nav items grouped by category with distinct colors
interface NavGroup {
  group: string;
  items: Array<{
    id: PageId;
    label: string;
    icon: typeof LayoutDashboard;
    neonColor: string;
    neonGlow: string;
  }>;
}

// Chrome / gold luxury palette — primary nav uses gold accent, secondary uses chrome silver.
const GOLD = '#D4AF37';
const GOLD_GLOW = 'rgba(212,175,55,0.5)';
const SILVER = '#C0C0C0';
const SILVER_GLOW = 'rgba(192,192,192,0.35)';

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Main',
    items: [
      { id: 'dashboard',     label: 'หน้าหลัก',     icon: Home,          neonColor: GOLD, neonGlow: GOLD_GLOW },
      { id: 'expenses',      label: 'ธุรกรรม',      icon: Receipt,       neonColor: GOLD, neonGlow: GOLD_GLOW },
      { id: 'history',       label: 'ประวัติ',       icon: Clock,         neonColor: GOLD, neonGlow: GOLD_GLOW },
      { id: 'accounts',      label: 'ธนาคาร',       icon: Building2,     neonColor: GOLD, neonGlow: GOLD_GLOW },
      { id: 'risk-analysis', label: 'AI',            icon: Sparkles,      neonColor: GOLD, neonGlow: GOLD_GLOW },
    ]
  },
  {
    group: 'More',
    items: [
      { id: 'agents',        label: 'ทีม',           icon: Users,        neonColor: SILVER, neonGlow: SILVER_GLOW },
      { id: 'status',        label: 'วิเคราะห์',     icon: BarChart2,    neonColor: SILVER, neonGlow: SILVER_GLOW },
      { id: 'proof',         label: 'เอกสาร',        icon: FileText,     neonColor: SILVER, neonGlow: SILVER_GLOW },
      { id: 'tasks',         label: 'จัดการงาน',    icon: ClipboardList, neonColor: SILVER, neonGlow: SILVER_GLOW },
      { id: 'usdt-calc',     label: 'คำนวณ USDT',    icon: DollarSign,   neonColor: SILVER, neonGlow: SILVER_GLOW },
      { id: 'bulk-calc',     label: 'Bulk คำนวณ',    icon: Calculator,   neonColor: SILVER, neonGlow: SILVER_GLOW },
      { id: 'settings',      label: 'ตั้งค่า',       icon: Settings,     neonColor: SILVER, neonGlow: SILVER_GLOW },
    ]
  },
];

export function Sidebar() {
  const { currentPage, setPage } = useStore();
  const { play } = useSound();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] py-4 pr-2 overflow-y-auto">
      <nav className="flex flex-col gap-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="flex flex-col gap-1">
            <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 opacity-70">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { play('click'); setPage(item.id); }}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full relative overflow-hidden',
                    active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                  style={active ? {
                    background: `linear-gradient(135deg, rgba(13,24,41,0.95) 0%, rgba(10,16,32,0.9) 100%)`,
                    border: `1.5px solid ${item.neonColor}55`,
                    boxShadow: `0 0 12px ${item.neonGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  } : {
                    border: '1.5px solid transparent',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active: left accent bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                      style={{ background: item.neonColor, boxShadow: `0 0 8px ${item.neonGlow}` }}
                    />
                  )}

                  {/* Icon wrapper with neon glow on active */}
                  <span
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 shrink-0',
                      active ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
                    )}
                    style={active ? {
                      background: `${item.neonColor}18`,
                      boxShadow: `0 0 8px ${item.neonGlow}`,
                    } : {}}
                  >
                    <Icon
                      size={15}
                      style={{ color: active ? item.neonColor : 'currentColor' }}
                    />
                  </span>

                  <span className={cn(
                    'font-heading text-[13px] tracking-tight transition-colors',
                    active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  )}>
                    {item.label}
                  </span>

                  {/* Active: right glow dot */}
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: item.neonColor,
                        boxShadow: `0 0 6px ${item.neonGlow}`,
                        animation: 'pulse-blue 2s ease-out infinite',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>


    </aside>
  );
}
