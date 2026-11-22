import { Volume2, VolumeX, Search } from 'lucide-react';
import { AppView } from '../types/game';

interface TopBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function TopBar({
  currentView,
  onNavigate,
  isMuted,
  onToggleMute,
}: TopBarProps) {
  const navItems: { view: AppView; label: string }[] = [
    { view: 'home', label: 'Ana ekran' },
    { view: 'wordbook', label: 'Söz lüğəti' },
    { view: 'progress', label: 'İrəliləyiş' },
    { view: 'rules', label: 'Qaydalar' },
  ];

  const isGameActive = currentView === 'playing';

  return (
    <header className="w-full bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#E5DEC9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left text-[#162A45] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-lg"
        >
          <span className="w-8 h-8 rounded-lg bg-[#162A45] text-[#FACC15] flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight whitespace-nowrap">
            İngilis dili detektiv klubu
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Əsas naviqasiya"
          className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#475569]"
        >
          {navItems.map((item) => {
            const active =
              currentView === item.view ||
              (item.view === 'home' && (currentView === 'playing' || currentView === 'summary'));
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] ${
                  active
                    ? 'border-[#2563EB] text-[#162A45]'
                    : 'border-transparent hover:text-[#162A45] hover:border-[#CBD5E1]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary utility action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Səsi aç' : 'Səsi bağla'}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] hover:bg-[#F3EDE0] text-[#162A45] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                <span>Səssiz</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                <span>Səs açıq</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile compact navigation row (only when not actively mid-question so sticky/top height stays minimal) */}
      {!isGameActive && (
        <nav
          aria-label="Mobil naviqasiya"
          className="flex md:hidden items-center justify-around border-t border-[#EFE9D8] px-2 py-1.5 bg-[#FAF7F0]"
        >
          {navItems.map((item) => {
            const active =
              currentView === item.view ||
              (item.view === 'home' && currentView === 'summary');
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`px-2.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-[#2563EB] bg-white shadow-xs'
                    : 'text-[#475569] hover:text-[#162A45]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
