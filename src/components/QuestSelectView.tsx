import React, { useState } from 'react';
import {
  DifficultyType,
  BossType,
  SpecificZoneType,
  CompanionType,
  GameModeType,
} from '../types/index.ts';
import { COMPANIONS } from '../data/taskDatabase.ts';
import { SynthwaveHero } from './SynthwaveHero.tsx';
import { sfx } from '../utils/soundEngine.ts';
import { Flame, Sparkles, Zap, Shuffle, Compass, ShieldAlert, X } from 'lucide-react';

interface QuestSelectViewProps {
  difficulty: DifficultyType;
  setDifficulty: (d: DifficultyType) => void;
  bossType: BossType;
  setBossType: (b: BossType) => void;
  specificZone: SpecificZoneType;
  setSpecificZone: (z: SpecificZoneType) => void;
  companion: CompanionType;
  setCompanion: (c: CompanionType) => void;
  gameMode: GameModeType;
  setGameMode: (m: GameModeType) => void;
  onStartMission: () => void;
}

type ModalType = 'difficulty' | 'companion' | 'mode' | null;

export const QuestSelectView: React.FC<QuestSelectViewProps> = ({
  difficulty,
  setDifficulty,
  bossType,
  setBossType,
  specificZone,
  setSpecificZone,
  companion,
  setCompanion,
  gameMode,
  setGameMode,
  onStartMission,
}) => {
  const [modalType, setModalType] = useState<ModalType>(null);

  const handleDifficultySelect = (d: DifficultyType) => {
    sfx.playClick();
    setDifficulty(d);
  };

  const handleModeSelect = (m: GameModeType) => {
    sfx.playClick();
    setGameMode(m);
  };

  const handleCompanionSelect = (c: CompanionType) => {
    sfx.playClick();
    setCompanion(c);
    if (c === 'robot') sfx.playPipChirp();
    else if (c === 'bunny') sfx.playZenBell();
    else sfx.playCoin();
  };

  const openModal = (t: ModalType) => {
    sfx.playClick();
    setModalType(t);
  };

  const closeModal = () => {
    sfx.playClick();
    setModalType(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Synthwave Road Hero Header */}
      <SynthwaveHero />

      {/* LORE & CALL TO ACTION (CONCISE TEXT AS REQUESTED) */}
      <div className="text-center space-y-2">
        <h2 className="font-pixel text-xs sm:text-md md:text-xl lg:text-2xl max-w-screen text-synth-yellow blink-text">
          &gt; READY PLAYER ONE &lt;
        </h2>
        <p className="text-sm md:text-xl lg:text-2xl leading-none lg:leading-tight text-synth-cyan mx-auto font-vt">
          Select what you want to clean, how you want to do it, and who will keep you company.
        </p>
      </div>

      {/* OPTION 1: SELECT THE CLEANING MODE */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-base text-[10px] md:text-md lg:text-lg text-synth-magenta flex items-center gap-2">
            <span>SELECT THE CLEANING MODE</span>
          </h3>
          <button
            onClick={() => openModal('difficulty')}
            className="w-7 h-7 rounded-full border-2 border-synth-cyan text-synth-cyan bg-synth-gray flex items-center justify-center font-pixel text-xs hover:bg-synth-cyan hover:text-synth-dark transition-colors cursor-pointer"
            title="Cleaning Mode Explanation"
            aria-label="Explain Cleaning Modes"
          >
            ?
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Mission (formerly Quick Fix) */}
          <div
            onClick={() => handleDifficultySelect('maintenance')}
            className={`pixel-box selectable p-2 md:p-4 flex flex-col justify-between ${
              difficulty === 'maintenance' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-synth-cyan pb-1.5 max-w-screen">
                <h4 className="font-pixel text-[8px] text-synth-cyan flex items-center lg:gap-1 uppercase">
                  <span>&gt; DAILY MISSION</span>
                </h4>
                <span className="bg-synth-cyan text-synth-dark px-1.5 py-0.5 font-pixel text-[6px] shrink">
                  ~25 MIN
                </span>
              </div>
              <p className="text-lg text-gray-300 px-1 leading-none md:leading-tight">
                Great when you have guests incoming or as a daily maintenance.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[6px] text-right text-synth-yellow">
              XP VALUE: ~1,500 PTS
            </div>
          </div>

          {/* Main Quest */}
          <div
            onClick={() => handleDifficultySelect('standard')}
            className={`pixel-box selectable p-2 lg:p-4  flex flex-col justify-between ${
              difficulty === 'standard' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-synth-yellow pb-1.5">
                <h4 className="font-pixel text-[8px] text-synth-yellow flex items-center gap-1 uppercase">
                  <span>&gt; MAIN QUEST</span>
                </h4>
                <span className="bg-synth-yellow text-synth-dark px-1.5 py-0.5 font-pixel text-[6px] shrink">
                  ~140 MIN
                </span>
              </div>
              <p className="text-lg text-gray-300 px-1 leading-none md:leading-tight">
                Complete cleaning session that will make you wanna have guests.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[6px] text-right text-synth-yellow">
              XP VALUE: ~2,500 PTS
            </div>
          </div>

          {/* Boss Fight */}
          <div
            onClick={() => handleDifficultySelect('deep')}
            className={`pixel-box selectable p-2 lg:p-4  flex flex-col justify-between ${
              difficulty === 'deep' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-synth-magenta pb-1.5">
                <h4 className="font-pixel text-[8px] text-synth-magenta flex items-center gap-1 uppercase">
                  <Flame className="w-3.5 h-3.5 text-synth-magenta animate-pulse" />
                  <span>BOSS FIGHT</span>
                </h4>
                <span className="bg-synth-magenta text-white px-1.5 py-0.5 font-pixel text-[6px] uppercase shrink">
                  EPIC BATTLE
                </span>
              </div>
              <p className="text-lg text-gray-300 px-1 leading-none md:leading-tight">
                Combat the hardest enemies of tidy with the help of our intel and proven strategy.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[6px] text-right text-synth-magenta font-bold">
              MASSIVE XP: ~3,500+ PTS
            </div>
          </div>

          {/* Side Quests  */}
          <div
            onClick={() => handleDifficultySelect('specific')}
            className={`pixel-box selectable p-2 lg:p-4 flex flex-col justify-between ${
              difficulty === 'specific' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-white pb-1.5">
                <h4 className="font-pixel text-[8px] text-white flex items-center gap-1 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-synth-yellow" />
                  <span>SIDE QUESTS</span>
                </h4>
                <span className="bg-white text-synth-dark px-1.5 py-0.5 font-pixel text-[6px] uppercase shrink">
                  SANDBOX
                </span>
              </div>
              <p className="text-lg text-gray-300 px-1 leading-none md:leading-tight">
                Specialized tasks which get your stats high real fast.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[6px] text-right text-synth-cyan">
              XP VALUE: ~1,200 PTS
            </div>
          </div>
        </div>

        {/* BOSS FIGHT SUB-OPTIONS */}
        {difficulty === 'deep' && (
          <div className="border-4 border-dashed border-synth-magenta p-5 bg-synth-gray/70 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-synth-magenta animate-bounce" />
              <h4 className="font-pixel text-[8px] text-synth-yellow uppercase">
                CHOOSE YOUR ARCH-NEMESIS BOSS:
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'oven', label: 'BAKED OVEN GREMLIN', desc: 'Carbonized oil, oven door glass & rack bath' },
                { id: 'drainage', label: 'SLIME CORE & DRAIN TERROR', desc: 'Snake hair monsters, volcanic vinegar flush' },
                { id: 'grout', label: 'MOLD TITAN OF GROUT', desc: 'Peroxide oxygen lift & high-bristle grout purge' },
                { id: 'fridge', label: 'GLACIAL FRIDGE CHAOS', desc: 'Defrost, shelf disinfection & sticky jar audit' },
                { id: 'baseboards', label: 'BASEBOARDS & BLINDS DUNGEON', desc: 'Anti-static conditioning & slat wipe down' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    sfx.playBossHit();
                    setBossType(b.id as BossType);
                  }}
                  className={`text-left p-3 border-2 transition-all cursor-pointer ${
                    bossType === b.id
                      ? 'bg-synth-magenta text-white border-white shadow-[3px_3px_0_#05d9e8]'
                      : 'bg-synth-dark text-synth-cyan border-synth-cyan/60 hover:border-synth-magenta'
                  }`}
                >
                  <div className="font-pixel text-[10px] mb-1">{b.label}</div>
                  <div className="font-vt text-base leading-tight opacity-90">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SIDE QUESTS SUB-OPTIONS */}
        {difficulty === 'specific' && (
          <div className="border-4 border-dashed border-synth-cyan p-5 bg-synth-gray/70 space-y-3">
            <h4 className="font-pixel text-xs text-synth-yellow uppercase">
              SELECT SIDE QUEST TARGET ZONE:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {[
                { id: 'plants', emoji: '🌿', name: 'PLANT HERBALIST' },
                { id: 'socks', emoji: '🧦', name: 'SOCK MATRIX' },
                { id: 'spices', emoji: '🧂', name: 'PANTRY & SPICES' },
                { id: 'charity', emoji: '📦', name: 'CLOSET DONATION' },
                { id: 'appliances', emoji: '☕', name: 'APPLIANCE CORE' },
                { id: 'bedding', emoji: '🛏️', name: 'MATTRESS REFRESH' },
                { id: 'drapery', emoji: '🪟', name: 'WINDOW & DRAPES' },
              ].map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    sfx.playClick();
                    setSpecificZone(zone.id as SpecificZoneType);
                  }}
                  className={`p-2.5 border-2 text-center transition-all cursor-pointer ${
                    specificZone === zone.id
                      ? 'bg-synth-yellow text-synth-dark border-white font-bold shadow-[2px_2px_0_#ff2a6d]'
                      : 'bg-synth-dark text-synth-cyan border-synth-cyan/60 hover:border-synth-yellow'
                  }`}
                >
                  <div className="text-2xl mb-1">{zone.emoji}</div>
                  <div className="font-pixel text-[8px] leading-tight">{zone.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OPTION 2: SELECT THE CLEANING METHOD (PLACED SECOND AS REQUESTED) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-base text-[10px] md:text-md lg:text-lg text-synth-magenta flex items-center gap-2">
            <span>SELECT THE CLEANING METHOD</span>
          </h3>
          <button
            onClick={() => openModal('mode')}
            className="w-7 h-7 rounded-full border-2 border-synth-cyan text-synth-cyan bg-synth-gray flex items-center justify-center font-pixel text-xs hover:bg-synth-cyan hover:text-synth-dark transition-colors cursor-pointer"
            title="Cleaning Method Explanation"
            aria-label="Explain Cleaning Methods"
          >
            ?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleModeSelect('standard')}
            className={`pixel-box selectable p-2 md:p-4 flex items-center gap-4 ${
              gameMode === 'standard' ? 'active' : ''
            }`}
          >
            <Compass className="w-9 h-9 text-synth-cyan flex-shrink-0" />
            <div>
              <h4 className="font-pixel text-xs text-synth-cyan mb-1">CLASSIC FLOW</h4>
              <p className="text-lg text-gray-300 leading-none md:leading-tight lg:leading-snug">
                Logically structured path. All tasks and steps fully visible upfront.
              </p>
            </div>
          </div>

          <div
            onClick={() => handleModeSelect('shuffle')}
            className={`pixel-box selectable p-2 md:p-4 flex items-center gap-4 ${
              gameMode === 'shuffle' ? 'active' : ''
            }`}
          >
            <Shuffle className="w-9 h-9 text-synth-yellow flex-shrink-0" />
            <div>
              <h4 className="font-pixel text-xs text-synth-yellow mb-1">MYSTERY SHUFFLE</h4>
              <p className="text-lg text-gray-300 leading-none md:leading-tight lg:leading-snug">
                Surprise element! Tasks revealed 1-by-1. Prevents boredom &amp; overwhelm.
              </p>
            </div>
          </div>

          <div
            onClick={() => handleModeSelect('speedrun')}
            className={`pixel-box selectable p-2 md:p-4 flex items-center gap-4 ${
              gameMode === 'speedrun' ? 'active' : ''
            }`}
          >
            <Zap className="w-9 h-9 text-synth-magenta flex-shrink-0" />
            <div>
              <h4 className="font-pixel text-xs text-synth-magenta mb-1">SPEEDRUN CHALLENGE</h4>
              <p className="text-lg text-gray-300  leading-none md:leading-tight lg:leading-snug">
                Countdown timer! Score multipliers for fast clears. Double race vs Pip!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OPTION 3: SELECT THE CLEANING COMPANION (PLACED THIRD AS REQUESTED) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-base text-[10px] md:text-md lg:text-lg text-synth-magenta flex items-center gap-2">
            <span>SELECT THE CLEANING COMPANION</span>
          </h3>
          <button
            onClick={() => openModal('companion')}
            className="w-7 h-7 rounded-full border-2 border-synth-cyan text-synth-cyan bg-synth-gray flex items-center justify-center font-pixel text-xs hover:bg-synth-cyan hover:text-synth-dark transition-colors cursor-pointer"
            title="Cleaning Companion Explanation"
            aria-label="Explain Cleaning Companions"
          >
            ?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sparky */}
          <div
            onClick={() => handleCompanionSelect('sponge')}
            className={`pixel-box selectable p-2 md:p-5 text-center flex flex-col justify-between ${
              companion === 'sponge' ? 'active' : ''
            }`}
          >
            <div>
              <div className={`text-4xl md:text-6xl mb-3 hover:scale-110 transition-transform ${companion === 'sponge' ? 'animate-sponge-clean' : 'hover:animate-sponge-clean'}`}>🧽</div>
              <p className="text-[10px] sm:text-xs font-pixel text-synth-cyan mb-1 tracking-wider uppercase">THE HYPEMASTER</p>
              <h4 className="font-pixel text-sm sm:text-base text-white mb-2">SPARKY</h4>
              <p className="font-vt text-md md:text-xl text-gray-300  leading-none md:leading-tight lg:leading-snug">
                The best guide, ultimate cheerleader and cleaning expert with great advice!
              </p>
            </div>
            <div className="mt-2 pt-3 border-t border-gray-700 font-vt text-lg text-synth-cyan italic  leading-none md:leading-tight">
              "{COMPANIONS.sponge.quotes[0]}"
            </div>
          </div>

          {/* Pip */}
          <div
            onClick={() => handleCompanionSelect('robot')}
            className={`pixel-box selectable p-3 md:p-5 text-center flex flex-col justify-between ${
              companion === 'robot' ? 'active' : ''
            }`}
          >
            <div>
              <div className={`text-4xl md:text-6xl mb-3 hover:scale-110 transition-transform ${companion === 'robot' ? 'animate-robot-mimic' : 'hover:animate-robot-mimic'}`}>🤖</div>
              <p className="text-[10px] sm:text-xs font-pixel text-synth-yellow mb-1 tracking-wider uppercase">THE RIVAL COMPILER</p>
              <h4 className="font-pixel text-sm sm:text-base text-white mb-2">PIP</h4>
              <p className="font-vt text-md md:text-xl text-gray-300  leading-none md:leading-tight lg:leading-snug">
                Hyper-effiecient and goal-oriented rival will challenge you and push you to your highest performance!
              </p>
            </div>
            <div className="mt-2 pt-3 border-t border-gray-700 font-vt text-lg text-synth-yellow italic  leading-none md:leading-tight">
              "{COMPANIONS.robot.quotes[0]}"
            </div>
          </div>

          {/* Zen Bunny */}
          <div
            onClick={() => handleCompanionSelect('bunny')}
            className={`pixel-box selectable p-4 md:p-5 text-center flex flex-col justify-between ${
              companion === 'bunny' ? 'active' : ''
            }`}
          >
            <div>
              <div className={`text-4xl md:text-6xl mb-3 hover:scale-110 transition-transform ${companion === 'bunny' ? 'animate-bunny-wiggle' : 'hover:animate-bunny-wiggle'}`}>🐰</div>
              <p className="text-[10px] sm:text-xs font-pixel text-synth-magenta mb-1 tracking-wider uppercase">THE MINDFUL SAGE</p>
              <h4 className="font-pixel text-sm sm:text-base text-white mb-2">ZEN BUNNY</h4>
              <p className="font-vt text-md md:text-xl text-gray-300  leading-none md:leading-tight lg:leading-snug">
                This calm and collected co-player will bring you zero stress and so much healthy tips.
              </p>
            </div>
            <div className="mt-2 pt-3 border-t border-gray-700 font-vt text-lg text-synth-magenta italic leading-none md:leading-tight">
              "{COMPANIONS.bunny.quotes[0]}"
            </div>
          </div>
        </div>
      </div>

      {/* START BUTTON */}
      <div className="pt-4 text-center">
        <button
          onClick={() => {
            sfx.playLevelWin();
            onStartMission();
          }}
          className="pixel-btn text-md md:text-lg lg:text-xl font-pixel px-6 md:px-8 lg:px-12 py-3 md:py-6 uppercase blink-text w-full sm:w-auto hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[6px_6px_0_#ff2a6d]"
        >
          START
        </button>
      </div>

      {/* RETRO EXPLANATION MODAL */}
      {modalType && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-3 md:p-4 overflow-y-scroll">
          <div className="pixel-box p-2 sm:p-6 md:p-8 w-full md:max-w-lg lg:max-w-xl relative bg-synth-dark text-left space-y-2 md:space-y-4">
            <button
              onClick={closeModal}
              className="absolute -top-5 -right-3 bg-synth-magenta text-white border-2 border-white w-6 h-6 md:w-9 md:h-9 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {modalType === 'difficulty' && (
              <div className="space-y-2 md:space-y-3">
                <h3 className="font-pixel max-w-[80%] text-[6px] md:text-xs lg:text-lg  text-synth-yellow border-b-2 border-synth-yellow pb-2 uppercase">
                  &gt; CLEANING MODES GUIDE &lt;
                </h3>
                 <div className="space-y-2 font-vt text-xs md:text-md lg:text-lg text-gray-300 leading-none md:leading-tight lg:leading-snug">
                  <p>
                    <strong className="text-synth-cyan">DAILY MISSION (~25 min):</strong> Great when you have guests incoming or as a quick daily maintenance reset. Focuses on high-impact surface wins.
                  </p>
                  <p>
                    <strong className="text-synth-yellow">MAIN QUEST (~140 min):</strong> Complete cleaning session that will make you wanna have guests! Full 5-zone comprehensive reset of kitchen, bath, living, and bedrooms.
                  </p>
                  <p>
                    <strong className="text-synth-magenta">BOSS FIGHT (EPIC BATTLE):</strong> Combat the hardest enemies of tidy with the help of our intel and proven strategy! Multi-phase boss encounters against oven carbon, sewer pipes, or mold.
                  </p>
                  <p>
                    <strong className="text-white">SIDE QUESTS (SANDBOX):</strong> Specialized tasks which get your stats high real fast! Targeted maintenance like houseplant care, sock sorting, or appliance descaling.
                  </p>
                </div>
              </div>
            )}

            {modalType === 'mode' && (
              <div className="space-y-3">
                <h3 className="font-pixel max-w-[80%] text-[6px] md:text-xs text-synth-magenta border-b-2 border-synth-magenta pb-2 uppercase">
                  &gt; CLEANING METHODS GUIDE &lt;
                </h3>
                  <div className="space-y-2 font-vt text-xs md:text-md lg:text-lg text-gray-300 leading-none md:leading-tight lg:leading-snug">
                  <p>
                    <strong className="text-synth-cyan">CLASSIC FLOW:</strong> Standard logical sequence. See all quests and steps upfront for structured execution.
                  </p>
                  <p>
                    <strong className="text-synth-yellow">MYSTERY SHUFFLE:</strong> Keeps cleaning exciting! Tasks are randomized and revealed one at a time. Ideal for ADHD or defeating chore boredom.
                  </p>
                  <p>
                    <strong className="text-synth-magenta">SPEEDRUN CHALLENGE:</strong> Race against the clock! Fast clears earn massive time bonuses. Pick Pip for an intense double-speed race!
                  </p>
                </div>
              </div>
            )}

            {modalType === 'companion' && (
              <div className="space-y-3">
                <h3 className="font-pixel max-w-[80%] text-[6px] md:text-xs text-synth-cyan border-b-2 border-synth-cyan pb-2 uppercase">
                  &gt; CLEANING COMPANIONS GUIDE &lt;
                </h3>
                <div className="space-y-2 font-vt text-sm md:text-md lg:text-lg text-gray-300 leading-none md:leading-tight lg:leading-snug">
                  <p>
                    <strong className="text-synth-cyan">SPARKY (THE HYPEMASTER):</strong> The best guide, ultimate cheerleader and cleaning expert with great advice!
                  </p>
                  <p>
                    <strong className="text-synth-yellow">PIP (THE RIVAL COMPILER):</strong> Hyper-effiecient and goal-oriented rival will challenge you and push you to your highest performance!
                  </p>
                  <p>
                    <strong className="text-synth-magenta">ZEN BUNNY (THE MINDFUL SAGE):</strong> This calm and collected co-player will bring you zero stress and so much healthy tips.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={closeModal}
              className="pixel-btn w-full py-2 font-pixel text-[8px] md:text-sm text-center mt-4"
            >
              UNDERSTOOD!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
