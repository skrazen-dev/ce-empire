import { Search, Bell, Menu } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { MobileNav } from './MobileNav';

export function TopBar() {
  const { searchQuery, setSearchQuery } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full">
        <div className="glass rounded-2xl mx-3 mt-2 px-4 py-3 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground"
            onClick={() => setMobileNavOpen(true)}
            aria-label="เปิดเมนู"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-sm">CE</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight">CE Empire</h1>
              <p className="text-[10px] text-muted-foreground font-medium">Banking Dashboard</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาบัญชี, รายการ, Agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                aria-label="ค้นหา"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label="การแจ้งเตือน"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
