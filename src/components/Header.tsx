import React from 'react';
import { Music, Calendar, Trophy, Gamepad2, Radio, WifiOff } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { useOnlineStatus } from '../hooks/usePWAInstall.ts';
import { musicEngine } from '../utils/soundEngine.ts';
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
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* LOGO & TITLE */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
          onClick={() => {
            sfx.playClick();
            onTabChange('quest');
          }}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-synth-gray border-2 sm:border-3 border-synth-cyan flex items-center justify-center shadow-[2px_2px_0_#ff2a6d]">
            {/* Pixel Vacuum Sprite Icon */}
            <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
              <rect x="2" y="6" width="28" height="20" rx="4" fill="#05d9e8" stroke="#ff2a6d" strokeWidth="2" />
              <rect x="7" y="10" width="18" height="8" fill="#0a0015" />
              <circle cx="11" cy="14" r="2" fill="#05d9e8" />
              <circle cx="21" cy="14" r="2" fill="#05d9e8" />
              <rect x="4" y="24" width="24" height="4" fill="#ff2a6d" />
              <circle cx="7" cy="28" r="3" fill="#fbe54f" stroke="#0a0015" strokeWidth="1" />
              <circle cx="25" cy="28" r="3" fill="#fbe54f" stroke="#0a0015" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-pixel text-xs sm:text-base text-synth-cyan neon-text tracking-wider uppercase">
                CleanQuest
              </h1>
              <span className="bg-synth-magenta text-white font-pixel text-[7px] sm:text-[8px] px-1 py-0.2 rounded-sm">
                8-BIT
              </span>
            </div>
            <p className="text-synth-magenta text-[10px] sm:text-xs tracking-wider hidden xs:block">
              SYNTHWAVE HOUSEKEEPING RPG
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('quest');
            }}
            className={`px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5 transition-all border-2 ${
              activeTab === 'quest'
                ? 'bg-synth-magenta text-white border-white shadow-[2px_2px_0_#05d9e8]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-synth-cyan hover:border-synth-cyan'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{isMissionActive ? 'QUEST (ACTIVE)' : 'START QUEST'}</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('rituals');
            }}
            className={`px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5 transition-all border-2 ${
              activeTab === 'rituals'
                ? 'bg-synth-cyan text-synth-dark border-white shadow-[2px_2px_0_#ff2a6d]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-synth-cyan hover:border-synth-cyan'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>RITUAL PLANNER</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('hall-of-fame');
            }}
            className={`px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5 transition-all border-2 ${
              activeTab === 'hall-of-fame'
                ? 'bg-synth-yellow text-synth-dark border-white shadow-[2px_2px_0_#05d9e8]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-synth-yellow hover:border-synth-yellow'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>HALL OF FAME</span>
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('soundstation');
            }}
            className={`px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5 transition-all border-2 ${
              activeTab === 'soundstation'
                ? 'bg-purple-600 text-white border-white shadow-[2px_2px_0_#05d9e8]'
                : 'bg-synth-dark text-gray-400 border-gray-700 hover:text-purple-300 hover:border-purple-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>WINAMP RIG</span>
          </button>
        </nav>

        {/* RIGHT CONTROLS: AUDIO TOGGLE & PWA */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span
              className="bg-amber-600 text-white font-pixel text-[8px] px-2 py-1 flex items-center gap-1"
              title="CleanQuest is operating 100% locally in offline mode"
            >
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE</span>
            </span>
          )}

          <PWAInstallButton />

          <button
            onClick={onToggleMusic}
            className={`pixel-btn px-3 py-1.5 font-pixel text-[9px] uppercase flex items-center gap-1.5 ${
              isPlayingMusic ? 'text-synth-yellow border-synth-yellow' : ''
            }`}
            title="Toggle Retro Chiptune Music"
          >
            <Music className={`w-3.5 h-3.5 ${isPlayingMusic ? 'animate-bounce' : ''}`} />
            <span>{isPlayingMusic ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
