import { Search, Bell, Menu, X, BellOff } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { MobileNav } from './MobileNav';
import { useSound } from '@/contexts/SoundContext';
import { toast } from 'sonner';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663690140697/LEwiJDTkxh7Zpu9QQSN3Ab/ce-empire-favicon-huVwYnigudxF9CKVaHQtCS.webp';

export function TopBar() {
  const { searchQuery, setSearchQuery, expenses } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { play, soundEnabled, toggleSound } = useSound();

  // Count pending expenses as notifications
  const pendingCount = expenses.filter((e) => e.type === 'pending').length;

  const handleBellClick = () => {
    play('click');
    if (pendingCount > 0) {
      toast.info(`มีรายการค้างจ่าย ${pendingCount} รายการ`, {
        description: 'กดที่เมนู "ค่าใช้จ่าย" เพื่อดูรายละเอียด',
        duration: 4000,
      });
    } else {
      toast.success('ไม่มีการแจ้งเตือนใหม่', { duration: 2000 });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full px-3 pt-2">
        <div className="glass rounded-2xl px-3 sm:px-4 py-2.5 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[#1E2730] text-[#A0A0A0] active:scale-95 transition-transform"
            onClick={() => { play('click'); setMobileNavOpen(true); }}
            aria-label="เปิดเมนู"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={LOGO_URL} alt="CE Empire" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-white leading-tight">CE Empire</h1>
              <p className="text-[10px] text-[#A0A0A0] font-medium">Banking Dashboard</p>
            </div>
          </div>

          {/* Search - desktop */}
          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="ค้นหาบัญชี, รายการ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[#1A1F26] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF]/50 transition-all"
                aria-label="ค้นหา"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile search input (expandable) */}
          {mobileSearchOpen && (
            <div className="flex-1 sm:hidden">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 rounded-xl text-sm bg-[#1A1F26] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/30"
                />
              </div>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Mobile search toggle */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-[#1E2730] text-[#A0A0A0] active:scale-95 transition-transform"
              aria-label="ค้นหา"
              onClick={() => {
                play('click');
                setMobileSearchOpen((v) => !v);
                if (mobileSearchOpen) setSearchQuery('');
              }}
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Sound toggle */}
            <button
              className="hidden sm:flex p-2 rounded-xl hover:bg-[#1E2730] text-[#A0A0A0] hover:text-white transition-colors"
              aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
              onClick={() => { play('click'); toggleSound(); }}
            >
              {soundEnabled ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>

            {/* Notification bell */}
            <button
              className="p-2 rounded-xl hover:bg-[#1E2730] text-[#A0A0A0] hover:text-white transition-colors relative active:scale-95"
              aria-label="การแจ้งเตือน"
              onClick={handleBellClick}
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-[#EF4444] flex items-center justify-center text-[8px] font-bold text-white px-0.5 animate-pulse">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0099CC] flex items-center justify-center text-[#0F1419] text-xs font-bold select-none">
              CE
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
