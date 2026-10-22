import React, { useState, useEffect } from 'react';
import { HighscoreEntry, Achievement } from '../types/index.ts';
import { COMPANIONS } from '../data/taskDatabase.ts';
import { sfx } from '../utils/soundEngine.ts';
import { Trophy, Award, Medal, Trash2, Sparkles, Star } from 'lucide-react';
import { TrophyBadge } from './TrophyBadges.tsx';

const SEED_HIGHSCORES: HighscoreEntry[] = [
  { id: 'hs-seed-1', name: 'NEO', score: 6850, difficulty: 'deep', mode: 'speedrun', companion: 'robot', date: '10/12/2026', timeSeconds: 1420, rank: 'S', questName: 'Inferno Grease Fiend' },
  { id: 'hs-seed-2', name: 'ZEN', score: 5400, difficulty: 'standard', mode: 'standard', companion: 'bunny', date: '10/14/2026', timeSeconds: 1680, rank: 'S', questName: 'Standard Reset' },
  { id: 'hs-seed-3', name: 'SPK', score: 4950, difficulty: 'deep', mode: 'shuffle', companion: 'sponge', date: '10/13/2026', timeSeconds: 2100, rank: 'A', questName: 'Mold Titan of Grout' },
  { id: 'hs-seed-4', name: 'PIP', score: 3800, difficulty: 'standard', mode: 'speedrun', companion: 'robot', date: '10/15/2026', timeSeconds: 1250, rank: 'A', questName: 'Standard Reset' },
  { id: 'hs-seed-5', name: 'CAT', score: 2600, difficulty: 'maintenance', mode: 'standard', companion: 'sponge', date: '10/11/2026', timeSeconds: 580, rank: 'B', questName: 'Quick Maintenance' },
];

const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'ach-1', title: 'FIRST DUST BLOOD', desc: 'Completed your first cleaning mission in CleanQuest', icon: '🧽', unlocked: true },
  { id: 'ach-2', title: 'BOSS SLAYER', desc: 'Vanquished an Epic Boss (Oven, Drain, Grout, or Fridge)', icon: '🔥', unlocked: true },
  { id: 'ach-3', title: 'HYPER-DRIVE SPEEDRUN', desc: 'Won a speedrun challenge with time remaining', icon: '⚡', unlocked: false },
  { id: 'ach-4', title: 'PIP THE OVERCLOCKED', desc: 'Out-cleaned Pip the Rival Robot on a live mission', icon: '🤖', unlocked: true },
  { id: 'ach-5', title: 'ZEN BOTANICAL MASTER', desc: 'Nurtured houseplants and dusted foliage', icon: '🌿', unlocked: true },
  { id: 'ach-6', title: 'THE SOCK MATRIX REUNION', desc: 'Reunited separated twin socks from the drawer abyss', icon: '🧦', unlocked: false },
  { id: 'ach-7', title: 'S-RANK SUPREMACY', desc: 'Earned the coveted S-Rank on a deep cleaning quest', icon: '👑', unlocked: true },
  { id: 'ach-8', title: 'WEEKLY WARRIOR', desc: 'Completed all 7 days of the weekly rotation matrix', icon: '🛡️', unlocked: false },
];

export const HallOfFameView: React.FC = () => {
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'scores' | 'achievements'>('scores');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cleanquest_highscores');
      if (stored) {
        setHighscores(JSON.parse(stored));
      } else {
        setHighscores(SEED_HIGHSCORES);
        localStorage.setItem('cleanquest_highscores', JSON.stringify(SEED_HIGHSCORES));
      }
    } catch {
      setHighscores(SEED_HIGHSCORES);
    }
  }, []);

  const handleClearScores = () => {
    sfx.playClick();
    if (window.confirm('Reset Hall of Fame leaderboard to default arcade scores?')) {
      setHighscores(SEED_HIGHSCORES);
      localStorage.setItem('cleanquest_highscores', JSON.stringify(SEED_HIGHSCORES));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* TITLE BANNER */}
      <div className="pixel-box p-6 bg-synth-dark border-synth-yellow text-center space-y-2 shadow-[6px_6px_0_#ff2a6d]">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-synth-yellow animate-bounce" />
          <h2 className="font-pixel text-xl sm:text-2xl text-synth-yellow uppercase tracking-widest">
            &gt; HALL OF FAME &lt;
          </h2>
          <Trophy className="w-8 h-8 text-synth-yellow animate-bounce" />
        </div>
        <p className="font-vt text-2xl text-synth-cyan">
          The legendary highscores of housekeeping champions and unlocked retro trophies.
        </p>
      </div>

      {/* SUB TABS */}
      <div className="flex justify-between items-center border-b-4 border-synth-magenta pb-2">
        <div className="flex gap-3">
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('scores');
            }}
            className={`px-4 py-2 font-pixel text-xs transition-colors cursor-pointer ${
              activeTab === 'scores'
                ? 'bg-synth-yellow text-synth-dark font-bold shadow-[2px_2px_0_#ff2a6d]'
                : 'bg-synth-dark text-gray-400 hover:text-white'
            }`}
          >
            TOP SCORES LEADERBOARD
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('achievements');
            }}
            className={`px-4 py-2 font-pixel text-xs transition-colors cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-synth-magenta text-white shadow-[2px_2px_0_#05d9e8]'
                : 'bg-synth-dark text-gray-400 hover:text-white'
            }`}
          >
            TROPHIES &amp; BADGES ({ACHIEVEMENTS_LIST.filter((a) => a.unlocked).length}/{ACHIEVEMENTS_LIST.length})
          </button>
        </div>

        {activeTab === 'scores' && (
          <button
            onClick={handleClearScores}
            className="text-gray-500 hover:text-red-400 font-pixel text-[8px] flex items-center gap-1 cursor-pointer"
            title="Reset highscores"
          >
            <Trash2 className="w-3 h-3" />
            <span>RESET</span>
          </button>
        )}
      </div>

      {/* LEADERBOARD VIEW */}
      {activeTab === 'scores' && (
        <div className="pixel-box p-6 bg-synth-dark space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-pixel text-xs">
              <thead>
                <tr className="border-b-2 border-synth-cyan text-synth-cyan pb-2 text-[10px]">
                  <th className="py-2 px-2">RANK</th>
                  <th className="py-2 px-2">OPERATIVE</th>
                  <th className="py-2 px-2">SCORE</th>
                  <th className="py-2 px-2 hidden sm:table-cell">TIER</th>
                  <th className="py-2 px-2 hidden md:table-cell">MISSION</th>
                  <th className="py-2 px-2 hidden lg:table-cell">COMPANION</th>
                  <th className="py-2 px-2">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {highscores.map((entry, idx) => {
                  let rankColor =
                    idx === 0
                      ? 'text-synth-yellow font-bold'
                      : idx === 1
                      ? 'text-gray-200'
                      : idx === 2
                      ? 'text-amber-500'
                      : 'text-synth-cyan';

                  return (
                    <tr key={entry.id} className="hover:bg-synth-gray/40 transition-colors">
                      <td className={`py-3 px-2 ${rankColor}`}>
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-2 text-white font-bold tracking-widest">
                        {entry.name}
                      </td>
                      <td className={`py-3 px-2 text-sm ${rankColor}`}>
                        {entry.score.toLocaleString()} PTS
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="bg-synth-gray border border-synth-magenta text-synth-magenta px-1.5 py-0.5 text-[9px] font-bold">
                          {entry.rank.length <= 2 ? `${entry.rank}-RANK` : `[${entry.rank}]`}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-vt text-lg text-gray-300 hidden md:table-cell">
                        {entry.questName || entry.difficulty.toUpperCase()}
                      </td>
                      <td className="py-3 px-2 font-vt text-lg hidden lg:table-cell">
                        {COMPANIONS[entry.companion]?.emoji} {COMPANIONS[entry.companion]?.name}
                      </td>
                      <td className="py-3 px-2 text-[10px] text-gray-400">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TROPHIES & ACHIEVEMENTS VIEW */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* 5 TIER BADGE SHOWCASE */}
          <div className="pixel-box p-4 bg-synth-dark border-synth-cyan">
            <h3 className="font-pixel text-xs sm:text-sm text-synth-cyan mb-2 flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-synth-yellow" />
              <span>TIER BADGES &amp; MILITARY INSIGNIA</span>
            </h3>
            <p className="font-vt text-lg text-gray-300 text-center mb-4">
              Each mission tier awards its unique insignia. Flawless 100% completion of any tier unlocks the prestigious Double Ribbon Pinnacle Medallion!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* Badge 1 */}
              <div className="bg-synth-gray/40 border border-gray-700 p-3 flex flex-col items-center justify-between text-center rounded-sm">
                <TrophyBadge badgeIndex={1} letter="C" />
                <div className="mt-2">
                  <span className="font-pixel text-[8px] text-gray-300 block">GRADE C • PATROL</span>
                  <span className="font-vt text-sm text-gray-400">Daily Sorties</span>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="bg-synth-gray/40 border border-gray-700 p-3 flex flex-col items-center justify-between text-center rounded-sm">
                <TrophyBadge badgeIndex={2} letter="B" />
                <div className="mt-2">
                  <span className="font-pixel text-[8px] text-synth-cyan block">GRADE B • SPECIALIST</span>
                  <span className="font-vt text-sm text-gray-400">Side Target Zones</span>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="bg-synth-gray/40 border border-gray-700 p-3 flex flex-col items-center justify-between text-center rounded-sm">
                <TrophyBadge badgeIndex={3} letter="S" />
                <div className="mt-2">
                  <span className="font-pixel text-[8px] text-synth-magenta block">RANK S • SPECIAL OPS</span>
                  <span className="font-vt text-sm text-gray-400">Epic Boss Battles</span>
                </div>
              </div>

              {/* Badge 4 */}
              <div className="bg-synth-gray/40 border border-gray-700 p-3 flex flex-col items-center justify-between text-center rounded-sm">
                <TrophyBadge badgeIndex={4} letter="A" />
                <div className="mt-2">
                  <span className="font-pixel text-[8px] text-synth-yellow block">GRADE A • SUPREME</span>
                  <span className="font-vt text-sm text-gray-400">Main Quests</span>
                </div>
              </div>

              {/* Badge 5 (Double Ribbon) */}
              <div className="bg-synth-yellow/10 border-2 border-synth-yellow p-3 flex flex-col items-center justify-between text-center rounded-sm shadow-[0_0_12px_rgba(252,200,56,0.3)]">
                <TrophyBadge badgeIndex={5} letter="G" />
                <div className="mt-2">
                  <span className="font-pixel text-[8px] text-synth-yellow block font-bold">RANK G • PINNACLE</span>
                  <span className="font-vt text-sm text-synth-cyan">General 100% Cleared</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ACHIEVEMENTS_LIST.map((ach) => (
            <div
              key={ach.id}
              className={`pixel-box p-4 flex flex-col justify-between text-center transition-all ${
                ach.unlocked
                  ? 'bg-synth-dark border-synth-yellow shadow-[4px_4px_0_#ff2a6d]'
                  : 'bg-[#100b18] border-gray-700 opacity-50'
              }`}
            >
              <div>
                <div className="text-4xl mb-2">{ach.icon}</div>
                <h4
                  className={`font-pixel text-[10px] mb-1 ${
                    ach.unlocked ? 'text-synth-yellow' : 'text-gray-500'
                  }`}
                >
                  {ach.title}
                </h4>
                <p className="font-vt text-lg text-gray-300 leading-snug">{ach.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-800">
                <span
                  className={`font-pixel text-[8px] px-2 py-0.5 ${
                    ach.unlocked
                      ? 'bg-green-500 text-synth-dark font-bold'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {ach.unlocked ? 'UNLOCKED ★' : 'LOCKED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};
