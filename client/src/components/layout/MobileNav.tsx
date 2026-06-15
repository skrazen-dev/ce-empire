import {
  LayoutDashboard, Receipt, Users, X,
  DollarSign, Calculator, Settings, ClipboardList,
  Home, BarChart2, FileText, Building2, Clock, Sparkles
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { PageId } from '@/lib/types';
import { useSound } from '@/contexts/SoundContext';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663690140697/LEwiJDTkxh7Zpu9QQSN3Ab/ce-empire-favicon-huVwYnigudxF9CKVaHQtCS.webp';

interface NavGroup {
  group: string;
  color: string;
  items: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard; color: string }>;
}

const GOLD = '#D4AF37';
const SILVER = '#C0C0C0';

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Main',
    color: GOLD,
    items: [
      { id: 'dashboard',     label: 'หน้าหลัก', icon: Home,      color: GOLD },
      { id: 'expenses',      label: 'ธุรกรรม',  icon: Receipt,   color: GOLD },
      { id: 'history',       label: 'ประวัติ',   icon: Clock,     color: GOLD },
      { id: 'accounts',      label: 'ธนาคาร',   icon: Building2,  color: GOLD },
      { id: 'risk-analysis', label: 'AI',        icon: Sparkles,  color: GOLD },
    ]
  },
  {
    group: 'More',
    color: SILVER,
    items: [
      { id: 'agents',        label: 'ทีม',         icon: Users,         color: SILVER },
      { id: 'status',        label: 'วิเคราะห์',   icon: BarChart2,     color: SILVER },
      { id: 'proof',         label: 'เอกสาร',      icon: FileText,      color: SILVER },
      { id: 'tasks',         label: 'จัดการงาน',  icon: ClipboardList, color: SILVER },
      { id: 'usdt-calc',     label: 'คำนวณ USDT',  icon: DollarSign,    color: SILVER },
      { id: 'bulk-calc',     label: 'Bulk คำนวณ',  icon: Calculator,    color: SILVER },
      { id: 'settings',      label: 'ตั้งค่า',     icon: Settings,      color: SILVER },
    ]
  },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { currentPage, setPage } = useStore();
  const { play } = useSound();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <nav className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0F1419] border-r border-[rgba(255,255,255,0.08)] p-4 animate-slide-right flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="CE Empire" className="w-9 h-9 rounded-xl" />
            <div>
              <span className="font-bold text-sm text-white block">CE Empire</span>
              <span className="text-[10px] text-[#A0A0A0]">Banking Dashboard</span>
            </div>
          </div>
          <button
            onClick={() => { play('click'); onClose(); }}
            className="p-2 rounded-lg hover:bg-[#1E2730] text-[#A0A0A0] active:scale-95 transition-transform"
            aria-label="ปิดเมนู"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Groups */}
        <div className="flex flex-col gap-4 flex-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-[9px] font-bold uppercase tracking-widest px-2 mb-1.5" style={{ color: group.color + '80' }}>
                {group.group}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { play('click'); setPage(item.id); onClose(); }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full active:scale-[0.97]',
                        active
                          ? 'text-white'
                          : 'text-[#A0A0A0] hover:text-white hover:bg-[#1E2730]/50'
                      )}
                      style={active ? {
                        background: `${item.color}12`,
                        border: `1px solid ${item.color}40`,
                        boxShadow: `0 0 10px ${item.color}20`,
                      } : { border: '1px solid transparent' }}
                    >
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                        style={active ? { background: `${item.color}20` } : {}}
                      >
                        <Icon size={15} style={{ color: active ? item.color : 'currentColor' }} />
                      </span>
                      <span className="text-[13px]">{item.label}</span>
                      {active && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
