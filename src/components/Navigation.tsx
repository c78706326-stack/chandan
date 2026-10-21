import React from 'react';
import { Search, Volume2, VolumeX, TrendingUp, SlidersHorizontal, Sparkles } from 'lucide-react';

import { User } from 'firebase/auth';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenConfigurator: () => void;
  onToggleMarket: () => void;
  isMarketOpen: boolean;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  currentPrice: number;
  currentUser: User | null;
  onOpenDrive: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenConfigurator,
  onToggleMarket,
  isMarketOpen,
  isAudioActive,
  onToggleAudio,
  currentPrice,
  currentUser,
  onOpenDrive,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-5 transition-all duration-300">
      <div className="max-w-[1580px] mx-auto flex items-center justify-between">
        {/* Zone 1: Iconic PORSCHE wordmark */}
        <button
          onClick={() => onSelectTab('models')}
          className="text-left group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-sm"
        >
          <span className="porsche-font text-lg md:text-xl text-neutral-900 tracking-[0.32em] font-extrabold group-hover:text-black transition-colors">
            PORSCHE
          </span>
        </button>

        {/* Zone 2: Navigation Links (Models, Configurator, Heritage, Live Market) */}
        <nav className="flex items-center gap-6 md:gap-10 text-[12px] md:text-[13px] font-semibold tracking-[0.16em] uppercase">
          <button
            onClick={() => onSelectTab('models')}
            className={`relative py-1 transition-colors ${
              activeTab === 'models'
                ? 'text-[#C86D51]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            MODELS
            {activeTab === 'models' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8A588] rounded-full" />
            )}
          </button>

          <button
            onClick={onOpenConfigurator}
            className={`relative py-1 transition-colors ${
              activeTab === 'configurator'
                ? 'text-[#C86D51]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            CONFIGURATOR
          </button>

          <button
            onClick={() => onSelectTab('heritage')}
            className={`relative py-1 transition-colors ${
              activeTab === 'heritage'
                ? 'text-[#C86D51]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            HERITAGE
          </button>

          <button
            onClick={onToggleMarket}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              isMarketOpen
                ? 'text-[#C86D51]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LIVE MARKET</span>
            <span className="sm:hidden">MARKET</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Search, Drive Vault, Real-Time Telemetry & Audio) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Google Drive Vault Trigger */}
          <button
            onClick={onOpenDrive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs text-xs font-semibold transition-all ${
              currentUser
                ? 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-white/80 hover:bg-white border-neutral-300/80 text-neutral-700 hover:text-neutral-900'
            }`}
            title={currentUser ? `Connected to Drive (${currentUser.email})` : 'Connect Google Drive'}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
            <span className="hidden sm:inline font-mono text-[11px]">
              {currentUser ? 'DRIVE VAULT' : 'CONNECT DRIVE'}
            </span>
          </button>

          {/* Quick Real-Time Value Pill */}
          <button
            onClick={onToggleMarket}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-neutral-300/80 shadow-xs text-xs font-mono tabular-nums text-neutral-800 transition-all hover:border-[#E8A588]"
            title="Click to view full Live Market Trends Dashboard"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-neutral-900">${currentPrice.toLocaleString()}</span>
            <span className="text-emerald-600 font-medium">+4.2%</span>
          </button>

          {/* Engine Audio Rev Button */}
          <button
            onClick={onToggleAudio}
            aria-label={isAudioActive ? 'Mute engine audio' : 'Enable 9000 RPM Flat-Six sound'}
            title={isAudioActive ? 'Sound On (Click to mute)' : 'Experience 9,000 RPM Flat-Six Audio'}
            className={`p-2 rounded-full border transition-all ${
              isAudioActive
                ? 'bg-[#E8A588]/15 border-[#E8A588] text-[#C86D51]'
                : 'bg-white/70 hover:bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold tracking-[0.12em] text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-white/60 transition-colors uppercase"
          >
            <span className="hidden sm:inline">SEARCH</span>
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
