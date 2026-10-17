import React from 'react';
import { Music, Calendar, Trophy, Gamepad2, WifiOff } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { useOnlineStatus } from '../hooks/usePWAInstall.ts';
import { sfx } from '../utils/soundEngine.ts';

export type ActiveTab = 'quest' | 'rituals' | 'hall-of-fame' | 'soundstation';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  isMissionActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isPlayingMusic,
  onToggleMusic,
  isMissionActive,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="bg-synth-dark border-b-2 sm:border-b-4 border-synth-cyan sticky top-0 z-40 shadow-[0_2px_0_#ff2a6d] sm:shadow-[0_4px_0_#ff2a6d]">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* 1. LOGO SQUARED BOX */}
        <div
          className="flex items-center cursor-pointer select-none flex-shrink-0"
          onClick={() => {
            sfx.playClick();
            onTabChange('quest');
          }}
          title="Home"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-synth-gray border-2 sm:border-3 border-synth-cyan flex items-center justify-center shadow-[2px_2px_0_#ff2a6d] overflow-hidden rounded-sm hover:scale-105 transition-transform ">
            <img
              src="/pwa-192.png"
              alt="CleanQuest Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        {/* NAVIGATION TABS: 2. HOME, 3. ROUTINE PLANNER, 4. HALL OF FAME */}
        <nav className="flex items-center gap-1.5 sm:gap-2 justify-center">
          {/* 2. HOME (ICON ONLY ON MOBILE, SQUARED BOX) */}
          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('quest');
            }}
            title="Home"
            aria-label="Home"
            className={`w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 font-pixel text-[9px] flex items-center justify-center gap-1.5 transition-all border-2 cursor-pointer rounded-sm flex-shrink-0 ${
              activeTab === 'quest'
                ? 'bg-synth-magenta text-white border-white shadow-[2px_2px_0_#05d9e8]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-synth-cyan hover:border-synth-cyan'
            }`}
          >
            <Gamepad2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">HOME</span>
          </button>

          {/* 3. ROUTINE PLANNER (ICON ONLY ON MOBILE, SQUARED BOX) */}
          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('rituals');
            }}
            title="Routine Planner"
            aria-label="Routine Planner"
            className={`w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 font-pixel text-[9px] flex items-center justify-center gap-1.5 transition-all border-2 cursor-pointer rounded-sm flex-shrink-0 ${
              activeTab === 'rituals'
                ? 'bg-synth-cyan text-synth-dark font-bold border-white shadow-[2px_2px_0_#ff2a6d]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-synth-cyan hover:border-synth-cyan'
            }`}
          >
            <Calendar className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">ROUTINE PLANNER</span>
          </button>

          {/* 4. HALL OF FAME (ICON ONLY ON MOBILE, SQUARED BOX) */}
          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('hall-of-fame');
            }}
            title="Hall of Fame"
            aria-label="Hall of Fame"
            className={`w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 font-pixel text-[9px] flex items-center justify-center gap-1.5 transition-all border-2 cursor-pointer rounded-sm flex-shrink-0 ${
              activeTab === 'hall-of-fame'
                ? 'bg-synth-yellow text-synth-dark font-bold border-white shadow-[2px_2px_0_#05d9e8]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-synth-yellow hover:border-synth-yellow'
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">HALL OF FAME</span>
          </button>
        </nav>

        {/* 5. RIGHT CONTROLS: AUDIO BUTTON (AS IS, SQUARED BOX) & DESKTOP UTILITIES */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {!isOnline && (
            <span
              className="hidden sm:flex bg-amber-600 text-white font-pixel text-[8px] px-2 py-1 items-center gap-1"
              title="CleanQuest is operating 100% locally in offline mode"
            >
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE</span>
            </span>
          )}

          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* 5. AUDIO BUTTON: SQUARED BOX */}
          <button
            onClick={onToggleMusic}
            className={`w-10 h-10 sm:w-auto sm:h-auto pixel-btn p-0 sm:px-2.5 sm:py-2 font-pixel text-xs flex items-center justify-center cursor-pointer rounded-sm flex-shrink-0 ${
              isPlayingMusic ? 'text-synth-yellow border-synth-yellow shadow-[0_0_8px_#fbe54f]' : 'text-gray-400'
            }`}
            title={isPlayingMusic ? 'Mute Chiptune Audio' : 'Play Chiptune Audio'}
            aria-label={isPlayingMusic ? 'Mute Music' : 'Play Music'}
          >
            <Music className={`w-4 h-4 ${isPlayingMusic ? 'animate-bounce text-synth-yellow' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
