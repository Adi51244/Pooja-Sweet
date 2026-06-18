import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatDate, isToday } from '../api';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';

export default function Header({ date, onDateChange, title, subtitle }) {
  const { settings } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const goPrev = () => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange?.(d.toISOString().split('T')[0]);
  };

  const goNext = () => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (next <= today) onDateChange?.(next);
  };

  const isFuture = date > new Date().toISOString().split('T')[0];

  return (
    <>
      <header className="safe-top sticky top-0 z-20 bg-gradient-to-b from-cream-100/95 to-cream-50/90 backdrop-blur-md border-b border-cream-200/60">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-honey-600 mb-0.5">
                🍬 {settings.shop_name || 'Pooja Sweets'}
              </p>
              <h1 className="font-display text-2xl font-bold text-cocoa-800 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-cocoa-600/70 mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-xl bg-white/80 border border-cream-200 flex items-center justify-center text-cocoa-600 shadow-sm active:scale-95"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-honey-400 to-rose-400 flex items-center justify-center text-xl shadow-glow">
                🧁
              </div>
            </div>
          </div>

          {onDateChange && (
            <div className="mt-4 flex items-center justify-between bg-white/70 rounded-2xl p-2 shadow-card border border-cream-200">
              <button
                onClick={goPrev}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-cream-100 text-cocoa-700 active:scale-95 transition-transform"
                aria-label="Previous day"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2 text-cocoa-800">
                <CalendarDays size={16} className="text-honey-500" />
                <div className="text-center">
                  <p className="font-semibold text-sm">
                    {isToday(date) ? 'Today' : formatDate(date)}
                  </p>
                  {isToday(date) && (
                    <p className="text-xs text-cocoa-600/60">{formatDate(date)}</p>
                  )}
                </div>
              </div>

              <button
                onClick={goNext}
                disabled={isFuture}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-cream-100 text-cocoa-700 active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Next day"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
