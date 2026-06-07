import { useState } from 'react';
import {
  LayoutDashboard, CreditCard, Receipt, Users, MoreHorizontal,
  CheckCircle2, Image, DollarSign, Settings, Calculator, ShieldAlert,
  ClipboardList, X
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { PageId } from '@/lib/types';
import { useSound } from '@/contexts/SoundContext';

// 5 primary tabs shown always
const PRIMARY_TABS: { id: PageId; label: string; icon: typeof LayoutDashboard; color: string }[] = [
  { id: 'dashboard',  label: 'หน้าหลัก', icon: LayoutDashboard, color: '#00D4FF' },
  { id: 'accounts',   label: 'บัญชี',    icon: CreditCard,       color: '#FF8C42' },
  { id: 'expenses',   label: 'รายจ่าย',  icon: Receipt,          color: '#10B981' },
  { id: 'agents',     label: 'Agent',    icon: Users,            color: '#A855F7' },
  { id: 'tasks',      label: 'งาน',      icon: ClipboardList,    color: '#EC4899' },
];

// Extra items in "More" drawer
const MORE_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard; color: string }[] = [
  { id: 'status',        label: 'สถานะ',      icon: CheckCircle2, color: '#06B6D4' },
  { id: 'proof',         label: 'หลักฐาน',    icon: Image,        color: '#F59E0B' },
  { id: 'usdt-calc',     label: 'USDT',       icon: DollarSign,   color: '#14B8A6' },
  { id: 'bulk-calc',     label: 'Bulk',       icon: Calculator,   color: '#8B5CF6' },
  { id: 'risk-analysis', label: 'ความเสี่ยง', icon: ShieldAlert,  color: '#EF4444' },
  { id: 'settings',      label: 'ตั้งค่า',    icon: Settings,     color: '#64748B' },
];

export function BottomNav() {
  const { currentPage, setPage } = useStore();
  const { play } = useSound();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_ITEMS.some(i => i.id === currentPage);

  const handleNav = (id: PageId) => {
    play('click');
    setPage(id);
    setShowMore(false);
  };

  return (
    <>
      {/* More Drawer Backdrop */}
      {showMore && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Drawer */}
      {showMore && (
        <div className="lg:hidden fixed bottom-[72px] left-3 right-3 z-50 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(15,20,30,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 -8px 32px rgba(0,0,0,0.6)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">เมนูเพิ่มเติม</span>
            <button onClick={() => setShowMore(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-0.5 p-2">
            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95',
                    active ? 'bg-white/8' : 'hover:bg-white/5'
                  )}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: active ? `${item.color}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? item.color + '44' : 'rgba(255,255,255,0.06)'}` }}
                  >
                    <Icon size={17} style={{ color: active ? item.color : '#94A3B8' }} strokeWidth={active ? 2.2 : 1.8} />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: active ? item.color : '#94A3B8' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div style={{ background: 'rgba(10,14,23,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          className="px-2 py-2 safe-area-bottom"
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {PRIMARY_TABS.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-90 relative min-w-[56px]"
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                >
                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                    />
                  )}
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all', active ? '' : '')}
                    style={active ? { background: `${item.color}18`, border: `1px solid ${item.color}33` } : {}}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8}
                      style={{ color: active ? item.color : '#64748B' }}
                    />
                  </div>
                  <span className="text-[9px] font-medium leading-none"
                    style={{ color: active ? item.color : '#64748B' }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => { play('click'); setShowMore(!showMore); }}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-90 relative min-w-[56px]"
              aria-label="เมนูเพิ่มเติม"
            >
              {isMoreActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-400"
                  style={{ boxShadow: '0 0 6px #94A3B8' }}
                />
              )}
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all')}
                style={showMore || isMoreActive ? { background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.2)' } : {}}
              >
                <MoreHorizontal size={18} strokeWidth={showMore ? 2.2 : 1.8}
                  style={{ color: showMore || isMoreActive ? '#94A3B8' : '#64748B' }}
                />
              </div>
              <span className="text-[9px] font-medium leading-none"
                style={{ color: showMore || isMoreActive ? '#94A3B8' : '#64748B' }}
              >
                เพิ่มเติม
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
