import { LayoutDashboard, CreditCard, Receipt, Users, CheckCircle2, Image, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { PageId } from '@/lib/types';

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accounts', label: 'บัญชี', icon: CreditCard },
  { id: 'expenses', label: 'ค่าใช้จ่าย', icon: Receipt },
  { id: 'agents', label: 'Agent', icon: Users },
  { id: 'status', label: 'สถานะ', icon: CheckCircle2 },
  { id: 'proof', label: 'หลักฐาน', icon: Image },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { currentPage, setPage } = useStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <nav className="absolute left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border p-5 animate-slide-right flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CE</span>
            </div>
            <span className="font-bold text-sm text-foreground">CE Empire</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent text-muted-foreground" aria-label="ปิดเมนู">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); onClose(); }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full',
                  active
                    ? 'bg-accent text-accent-foreground border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                )}
              >
                <Icon size={18} className={active ? 'text-primary' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
