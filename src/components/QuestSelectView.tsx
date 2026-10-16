import React, { useState } from 'react';
import {
  DifficultyType,
  BossType,
  SpecificZoneType,
  CompanionType,
  GameModeType,
} from '../types/index.ts';
import { COMPANIONS, TASK_DATABASE } from '../data/taskDatabase.ts';
import { SynthwaveHero } from './SynthwaveHero.tsx';
import { sfx } from '../utils/soundEngine.ts';
import { HelpCircle, Flame, Sparkles, Zap, Shuffle, Compass, ShieldAlert, X } from 'lucide-react';

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

  const handleCompanionSelect = (c: CompanionType) => {
    sfx.playClick();
    setCompanion(c);
    if (c === 'robot') sfx.playPipChirp();
    else if (c === 'bunny') sfx.playZenBell();
    else sfx.playCoin();
  };

  const handleModeSelect = (m: GameModeType) => {
    sfx.playClick();
    setGameMode(m);
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

      {/* LORE & CALL TO ACTION */}
      <div className="text-center space-y-3">
        <h2 className="font-pixel text-xl sm:text-2xl text-synth-yellow blink-text">
          &gt; READY PLAYER ONE &lt;
        </h2>
        <p className="text-xl sm:text-2xl leading-relaxed text-synth-cyan max-w-2xl mx-auto font-vt">
          Eliminate mental overwhelm. Select your battle parameters, recruit a body-doubling NPC companion, and transform household chores into an 8-bit synthwave arcade victory!
        </p>
      </div>

      {/* LEVEL 1: SELECT DIFFICULTY */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-base sm:text-lg text-synth-magenta flex items-center gap-2">
            <span>LEVEL 1: SELECT DIFFICULTY</span>
          </h3>
          <button
            onClick={() => openModal('difficulty')}
            className="w-7 h-7 rounded-full border-2 border-synth-cyan text-synth-cyan bg-synth-gray flex items-center justify-center font-pixel text-xs hover:bg-synth-cyan hover:text-synth-dark transition-colors cursor-pointer"
            title="Difficulty Explanation"
            aria-label="Explain Difficulty"
          >
            ?
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Maintenance */}
          <div
            onClick={() => handleDifficultySelect('maintenance')}
            className={`pixel-box selectable p-4 flex flex-col justify-between ${
              difficulty === 'maintenance' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-synth-cyan pb-1.5">
                <h4 className="font-pixel text-xs text-synth-cyan flex items-center gap-1">
                  <span>&gt; QUICK FIX</span>
                </h4>
                <span className="bg-synth-cyan text-synth-dark px-1.5 py-0.5 font-pixel text-[8px]">
                  10 MIN
                </span>
              </div>
              <p className="text-lg text-gray-300">
                Surface clutter, rapid dishwasher duty, sink shine, and trash loot run.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[8px] text-synth-yellow">
              XP VALUE: ~1,500 PTS
            </div>
          </div>

          {/* Standard Reset */}
          <div
            onClick={() => handleDifficultySelect('standard')}
            className={`pixel-box selectable p-4 flex flex-col justify-between ${
              difficulty === 'standard' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-synth-yellow pb-1.5">
                <h4 className="font-pixel text-xs text-synth-yellow flex items-center gap-1">
                  <span>&gt; MAIN RESET</span>
                </h4>
                <span className="bg-synth-yellow text-synth-dark px-1.5 py-0.5 font-pixel text-[8px]">
                  30 MIN
                </span>
              </div>
              <p className="text-lg text-gray-300">
                Full 5-zone hygiene quest: kitchen, bathroom, living room, bedroom, entry.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[8px] text-synth-yellow">
              XP VALUE: ~2,500 PTS
            </div>
          </div>

          {/* Boss Fight */}
          <div
            onClick={() => handleDifficultySelect('deep')}
            className={`pixel-box selectable p-4 flex flex-col justify-between ${
              difficulty === 'deep' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-synth-magenta pb-1.5">
                <h4 className="font-pixel text-xs text-synth-magenta flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-synth-magenta animate-pulse" />
                  <span>&gt; BOSS FIGHT</span>
                </h4>
                <span className="bg-synth-magenta text-white px-1.5 py-0.5 font-pixel text-[8px]">
                  EPIC (45-60M)
                </span>
              </div>
              <p className="text-lg text-gray-300">
                Multi-phase warfare against baked oven grease, blocked drains, or grout mold!
              </p>
            </div>
            <div className="mt-3 font-pixel text-[8px] text-synth-magenta font-bold">
              MASSIVE XP: ~3,500+ PTS
            </div>
          </div>

          {/* Mini Quest */}
          <div
            onClick={() => handleDifficultySelect('specific')}
            className={`pixel-box selectable p-4 flex flex-col justify-between ${
              difficulty === 'specific' ? 'active' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-white pb-1.5">
                <h4 className="font-pixel text-xs text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-synth-yellow" />
                  <span>&gt; MINI QUEST</span>
                </h4>
                <span className="bg-white text-synth-dark px-1.5 py-0.5 font-pixel text-[8px]">
                  TARGETED
                </span>
              </div>
              <p className="text-lg text-gray-300">
                Specialized tasks: plant care, sock pairing matrix, pantry expiry audit, drapes.
              </p>
            </div>
            <div className="mt-3 font-pixel text-[8px] text-synth-cyan">
              XP VALUE: ~1,200 PTS
            </div>
          </div>
        </div>

        {/* BOSS FIGHT SUB-OPTIONS */}
        {difficulty === 'deep' && (
          <div className="border-4 border-dashed border-synth-magenta p-5 bg-synth-gray/70 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-synth-magenta animate-bounce" />
              <h4 className="font-pixel text-xs text-synth-yellow uppercase">
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

        {/* MINI QUEST SUB-OPTIONS */}
        {difficulty === 'specific' && (
          <div className="border-4 border-dashed border-synth-cyan p-5 bg-synth-gray/70 space-y-3">
            <h4 className="font-pixel text-xs text-synth-yellow uppercase">
              SELECT MINI QUEST TARGET ZONE:
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

      {/* LEVEL 2: CHOOSE COMPANION (BODY DOUBLING) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-base sm:text-lg text-synth-magenta">
            LEVEL 2: RECRUIT BODY-DOUBLING COMPANION
          </h3>
          <button
            onClick={() => openModal('companion')}
            className="w-7 h-7 rounded-full border-2 border-synth-cyan text-synth-cyan bg-synth-gray flex items-center justify-center font-pixel text-xs hover:bg-synth-cyan hover:text-synth-dark transition-colors cursor-pointer"
            title="Companion Body-Doubling Explanation"
            aria-label="Explain Companions"
          >
            ?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sparky */}
          <div
            onClick={() => handleCompanionSelect('sponge')}
            className={`pixel-box selectable p-5 text-center flex flex-col justify-between ${
              companion === 'sponge' ? 'active' : ''
            }`}
          >
            <div>
              <div className="text-6xl mb-3 hover:scale-110 transition-transform">🧽</div>
              <h4 className="font-pixel text-xs text-synth-cyan mb-1">SPARKY (HYPE & TIPS)</h4>
              <p className="text-sm font-pixel text-synth-yellow mb-2">"THE HYPEMASTER"</p>
              <p className="font-vt text-xl text-gray-300">
                {COMPANIONS.sponge.tagline}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700 font-vt text-lg text-synth-cyan italic">
              "{COMPANIONS.sponge.quotes[0]}"
            </div>
          </div>

          {/* Pip */}
          <div
            onClick={() => handleCompanionSelect('robot')}
            className={`pixel-box selectable p-5 text-center flex flex-col justify-between ${
              companion === 'robot' ? 'active' : ''
            }`}
          >
            <div>
              <div className="text-6xl mb-3 hover:scale-110 transition-transform animate-pulse">🤖</div>
              <h4 className="font-pixel text-xs text-synth-yellow mb-1">PIP (RIVAL BOT)</h4>
              <p className="text-sm font-pixel text-synth-magenta mb-2">"COMPETITIVE CLOCK"</p>
              <p className="font-vt text-xl text-gray-300">
                {COMPANIONS.robot.tagline}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700 font-vt text-lg text-synth-yellow italic">
              "{COMPANIONS.robot.quotes[0]}"
            </div>
          </div>

          {/* Zen Bunny */}
          <div
            onClick={() => handleCompanionSelect('bunny')}
            className={`pixel-box selectable p-5 text-center flex flex-col justify-between ${
              companion === 'bunny' ? 'active' : ''
            }`}
          >
            <div>
              <div className="text-6xl mb-3 hover:scale-110 transition-transform">🐰</div>
              <h4 className="font-pixel text-xs text-synth-magenta mb-1">ZEN BUNNY (CHILL)</h4>
              <p className="text-sm font-pixel text-synth-cyan mb-2">"MINDFUL SAGE"</p>
              <p className="font-vt text-xl text-gray-300">
                {COMPANIONS.bunny.tagline}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700 font-vt text-lg text-synth-magenta italic">
              "{COMPANIONS.bunny.quotes[0]}"
            </div>
          </div>
        </div>
      </div>

      {/* LEVEL 3: GAME MODE */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-base sm:text-lg text-synth-magenta">
            LEVEL 3: MISSION STRUCTURE & TEMPO
          </h3>
          <button
            onClick={() => openModal('mode')}
            className="w-7 h-7 rounded-full border-2 border-synth-cyan text-synth-cyan bg-synth-gray flex items-center justify-center font-pixel text-xs hover:bg-synth-cyan hover:text-synth-dark transition-colors cursor-pointer"
            title="Game Mode Explanation"
            aria-label="Explain Modes"
          >
            ?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleModeSelect('standard')}
            className={`pixel-box selectable p-4 flex items-center gap-4 ${
              gameMode === 'standard' ? 'active' : ''
            }`}
          >
            <Compass className="w-9 h-9 text-synth-cyan flex-shrink-0" />
            <div>
              <h4 className="font-pixel text-xs text-synth-cyan mb-1">CLASSIC FLOW</h4>
              <p className="text-lg text-gray-300 leading-tight">
                Logically structured path. All tasks and microsteps fully visible upfront.
              </p>
            </div>
          </div>

          <div
            onClick={() => handleModeSelect('shuffle')}
            className={`pixel-box selectable p-4 flex items-center gap-4 ${
              gameMode === 'shuffle' ? 'active' : ''
            }`}
          >
            <Shuffle className="w-9 h-9 text-synth-yellow flex-shrink-0" />
            <div>
              <h4 className="font-pixel text-xs text-synth-yellow mb-1">MYSTERY SHUFFLE</h4>
              <p className="text-lg text-gray-300 leading-tight">
                Surprise element! Tasks revealed 1-by-1. Prevents boredom & overwhelm.
              </p>
            </div>
          </div>

          <div
            onClick={() => handleModeSelect('speedrun')}
            className={`pixel-box selectable p-4 flex items-center gap-4 ${
              gameMode === 'speedrun' ? 'active' : ''
            }`}
          >
            <Zap className="w-9 h-9 text-synth-magenta flex-shrink-0" />
            <div>
              <h4 className="font-pixel text-xs text-synth-magenta mb-1">SPEEDRUN CHALLENGE</h4>
              <p className="text-lg text-gray-300 leading-tight">
                Countdown timer! Score multipliers for fast clears. Double race vs Pip!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* START MISSION BIG BUTTON */}
      <div className="pt-4 text-center">
        <button
          onClick={() => {
            sfx.playLevelWin();
            onStartMission();
          }}
          className="pixel-btn text-xl sm:text-2xl font-pixel px-10 py-5 uppercase blink-text w-full sm:w-auto hover:scale-105 active:scale-95 transition-transform"
        >
          &gt; INITIATE CLEANING MISSION &lt;
        </button>
      </div>

      {/* RETRO EXPLANATION MODAL */}
      {modalType && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 sm:p-8 max-w-lg w-full relative bg-synth-dark text-left space-y-4">
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 bg-synth-magenta text-white border-2 border-white w-9 h-9 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'difficulty' && (
              <>
                <h3 className="font-pixel text-sm sm:text-base text-synth-yellow border-b-2 border-synth-yellow pb-2">
                  &gt; DIFFICULTY &amp; QUEST SCALING &lt;
                </h3>
                <div className="font-vt text-xl text-gray-300 space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-synth-cyan">QUICK MAINTENANCE (10 MIN):</strong> Low-friction loot gathering for when energy is low. Clear tables, load dishes, take out trash.
                  </p>
                  <p>
                    <strong className="text-synth-yellow">STANDARD RESET (30 MIN):</strong> The balanced Clean Mama daily hygiene cycle covering all 5 core home zones.
                  </p>
                  <p>
                    <strong className="text-synth-magenta">BOSS FIGHT (45-60 MIN):</strong> High difficulty, high rewards! Slay deep targets like baked oven carbon, clogged sink drain slime, or bathroom tile mold.
                  </p>
                  <p>
                    <strong className="text-white">MINI QUEST:</strong> Surgical strikes on targeted areas like sock pairing, watering & dusting plants, or pantry expiry sweeps!
                  </p>
                </div>
              </>
            )}

            {modalType === 'companion' && (
              <>
                <h3 className="font-pixel text-sm sm:text-base text-synth-magenta border-b-2 border-synth-magenta pb-2">
                  &gt; BODY DOUBLING COMPANIONS &lt;
                </h3>
                <div className="font-vt text-xl text-gray-300 space-y-3 leading-relaxed">
                  <p>
                    <strong>Body Doubling</strong> is a proven neurodiversity technique where the simulated presence of another entity keeps focus high and removes executive paralysis.
                  </p>
                  <p>
                    <strong className="text-synth-cyan">SPARKY THE SPONGE:</strong> Offers real cleaning science tips (dwell time, acid neutralization, microfiber mechanics) and loud cheerful hype.
                  </p>
                  <p>
                    <strong className="text-synth-yellow">PIP THE RIVAL ROBOT:</strong> Cleans alongside you on a live progress bar. Try to finish your tasks before Pip completes his simulated sector!
                  </p>
                  <p>
                    <strong className="text-synth-magenta">ZEN BUNNY:</strong> Anti-stress guardian. Zero judgment, calming breathing advice, and gentle permission to take breaks.
                  </p>
                </div>
              </>
            )}

            {modalType === 'mode' && (
              <>
                <h3 className="font-pixel text-sm sm:text-base text-synth-cyan border-b-2 border-synth-cyan pb-2">
                  &gt; GAME MODES &amp; TEMPO &lt;
                </h3>
                <div className="font-vt text-xl text-gray-300 space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-synth-cyan">CLASSIC:</strong> View every single quest and microstep from start to finish. Ideal for planners.
                  </p>
                  <p>
                    <strong className="text-synth-yellow">MYSTERY (SHUFFLE):</strong> Keeps ADHD brains engaged! The app presents only one mystery task at a time. Finish it to unlock the next!
                  </p>
                  <p>
                    <strong className="text-synth-magenta">SPEEDRUN:</strong> A ticking countdown clock with score bonuses for beating the timer. If Pip is chosen, it becomes an intense Rival Showdown!
                  </p>
                </div>
              </>
            )}

            <button
              onClick={closeModal}
              className="pixel-btn w-full py-2.5 font-pixel text-xs text-center mt-4"
            >
              AFFIRMATIVE, RETURN TO HUD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
