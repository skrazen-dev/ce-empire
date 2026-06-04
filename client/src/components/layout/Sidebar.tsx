import { LayoutDashboard, CreditCard, Receipt, Users, CheckCircle2, Image, Sparkles } from 'lucide-react';
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

export function Sidebar() {
  const { currentPage, setPage } = useStore();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] py-4 pr-2">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full',
                active
                  ? 'bg-accent text-accent-foreground border border-border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} className={active ? 'text-primary' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-xs font-medium text-purple-300">Grok AI</span>
        </div>
      </div>
    </aside>
  );
}
