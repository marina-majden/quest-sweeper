/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  DifficultyType,
  BossType,
  SpecificZoneType,
  CompanionType,
  GameModeType,
  CleaningTask,
} from './types/index.ts';
import { TASK_DATABASE } from './data/taskDatabase.ts';
import { Header, ActiveTab } from './components/Header.tsx';
import { QuestSelectView } from './components/QuestSelectView.tsx';
import { QuestActiveView } from './components/QuestActiveView.tsx';
import { QuestCelebrateView } from './components/QuestCelebrateView.tsx';
import { RitualPlannerView } from './components/RitualPlannerView.tsx';
import { HallOfFameView } from './components/HallOfFameView.tsx';
import { SoundstationView } from './components/SoundstationView.tsx';
import { musicEngine, sfx } from './utils/soundEngine.ts';
import { BookOpen, X, Sparkles, Compass, Shield, Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quest');
  const [questState, setQuestState] = useState<'select' | 'active' | 'celebrate'>('select');

  // Quest configurations
  const [difficulty, setDifficulty] = useState<DifficultyType>('standard');
  const [bossType, setBossType] = useState<BossType>('oven');
  const [specificZone, setSpecificZone] = useState<SpecificZoneType>('plants');
  const [companion, setCompanion] = useState<CompanionType>('sponge');
  const [gameMode, setGameMode] = useState<GameModeType>('standard');

  // Active mission state
  const [questTitle, setQuestTitle] = useState('Main Quest');
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(8400);
  const [isPlayingMusic, setIsPlayingMusic] = useState(musicEngine.isPlaying);
  const [showManualModal, setShowManualModal] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Sync music status
  useEffect(() => {
    const unsub = musicEngine.subscribe((playing) => {
      setIsPlayingMusic(playing);
    });
    return () => unsub();
  }, []);

  const handleToggleMusic = () => {
    musicEngine.togglePlay();
  };

  // Start mission logic
  const handleStartMission = () => {
    let sourceTasks: any[] = [];
    let title = 'Main Quest';
    let limitSecs = 8400; // ~140 mins for Main Quest (2-3 hours)

    if (difficulty === 'maintenance') {
      sourceTasks = TASK_DATABASE.maintenance;
      title = 'Daily Mission';
      limitSecs = 1500; // ~25 mins
    } else if (difficulty === 'standard') {
      sourceTasks = TASK_DATABASE.standard;
      title = 'Main Quest';
      limitSecs = 8400; // ~140 mins
    } else if (difficulty === 'deep') {
      const bossData = TASK_DATABASE.bossFights[bossType];
      sourceTasks = bossData.tasks;
      title = `Boss: ${bossData.name}`;
      limitSecs = 3600; // 60 mins epic battle
    } else if (difficulty === 'specific') {
      const miniData = TASK_DATABASE.miniQuests[specificZone];
      sourceTasks = miniData.tasks;
      title = `Side Quest: ${miniData.name}`;
      limitSecs = 1800; // 30 mins sandbox
    }

    // Clone tasks: all missions open with steps closed (showMicro: false) as requested
    let instantiatedTasks: CleaningTask[] = JSON.parse(JSON.stringify(sourceTasks)).map(
      (t: any, i: number) => ({
        ...t,
        id: `task-${Date.now()}-${i}`,
        completed: false,
        showMicro: false, // Closed per Request 7
        microSteps: (t.microSteps || []).map((m: any, mi: number) => ({
          ...m,
          id: `micro-${Date.now()}-${i}-${mi}`,
          completed: false,
        })),
      })
    );

    if (gameMode === 'shuffle') {
      instantiatedTasks.sort(() => Math.random() - 0.5);
    }

    setQuestTitle(title);
    setTasks(instantiatedTasks);
    setScore(0);
    setTimeElapsed(0);
    setTimeRemaining(limitSecs);

    setQuestState('active');
    setActiveTab('quest');

    // Start timer interval
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((e) => e + 1);
      setTimeRemaining((r) => Math.max(0, r - 1));
    }, 1000);
  };

  // Check ?autostart=1 query param on initial mount for verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleStartMission();
    }
  }, []);

  // Finish level
  const handleFinishMission = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuestState('celebrate');
  };

  // Abort mission
  const handleAbortMission = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuestState('select');
  };

  const handleReturnHome = () => {
    sfx.playClick();
    setQuestState('select');
  };

  const handleViewHallOfFame = () => {
    sfx.playClick();
    setActiveTab('hall-of-fame');
  };

  return (
    <div className="min-h-screen bg-[#0a0015] text-[#e0e0e0] flex flex-col justify-between selection:bg-synth-magenta selection:text-white">
      {/* CRT Scanline overlay effect */}
      <div className="scanlines" />

      {/* Retro 8-bit Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'quest' && questState === 'celebrate') {
            setQuestState('select');
          }
        }}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={handleToggleMusic}
        isMissionActive={questState === 'active'}
      />

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-6 flex-1">
        {activeTab === 'quest' && (
          <>
            {questState === 'select' && (
              <QuestSelectView
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                bossType={bossType}
                setBossType={setBossType}
                specificZone={specificZone}
                setSpecificZone={setSpecificZone}
                companion={companion}
                setCompanion={setCompanion}
                gameMode={gameMode}
                setGameMode={setGameMode}
                onStartMission={handleStartMission}
              />
            )}

            {questState === 'active' && (
              <QuestActiveView
                difficulty={difficulty}
                gameMode={gameMode}
                companion={companion}
                questName={questTitle}
                tasks={tasks}
                setTasks={setTasks}
                score={score}
                setScore={setScore}
                timeElapsed={timeElapsed}
                timeRemaining={timeRemaining}
                onAbort={handleAbortMission}
                onFinish={handleFinishMission}
              />
            )}

            {questState === 'celebrate' && (
              <QuestCelebrateView
                score={score}
                questName={questTitle}
                difficulty={difficulty}
                gameMode={gameMode}
                companion={companion}
                timeElapsed={timeElapsed}
                timeRemaining={timeRemaining}
                allTasksCompleted={tasks.length > 0 ? tasks.every((t) => t.completed) : true}
                tasksCompletedCount={tasks.filter((t) => t.completed).length}
                totalTasksCount={tasks.length}
                onReturnHome={handleReturnHome}
                onViewHallOfFame={handleViewHallOfFame}
              />
            )}
          </>
        )}

        {activeTab === 'rituals' && <RitualPlannerView />}

        {activeTab === 'hall-of-fame' && <HallOfFameView />}

        {activeTab === 'soundstation' && <SoundstationView />}
      </main>

      {/* Retro 8-bit Footer (Updated per Request 5) */}
      <footer className="border-t-4 border-synth-purple bg-synth-dark md:py-4 text-center text-[8px] md:text-xs font-pixel text-gray-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              sfx.playClick();
              setShowManualModal(true);
            }}
            className=" cursor-pointer font-pixel text-xs transition-colors bg-synth-magenta text-white hover:texr-grey px-1.5 py-0.5 font-pixel text-[6px] uppercase  tracking-wider"
            title="Read Complete Game Instructions"
          >
            MANUAL
          </button>
          <span>
            CleanQuest created by:{' '}
            <a
              href="https://marina-majden.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-synth-cyan hover:text-white underline hover:no-underline transition-colors"
            >
              WebMachine
            </a>
          </span>
          <div>
          <span className="text-synth-grey text-[5px]">OFFLINE GAME WITH LOCAL STORAGE</span><br/>
            <span className="text-synth-white text-[4px]">2026. © All rights reserved.</span></div>
        
        </div>
      </footer>

      {/* COMPREHENSIVE GAME MANUAL MODAL (REQUEST 5) */}
      {showManualModal && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-2 md:p-4">
          <div className="pixel-box p-2 sm:p-6 md:p-8 max-w-2xl w-full relative bg-synth-dark text-left space-y-4 shadow-[8px_8px_0_#ff2a6d] border-synth-magenta max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => {
                sfx.playClick();
                setShowManualModal(false);
              }}
              className="absolute top-4 right-4 bg-synth-magenta text-white border-2 border-white w-8 h-8 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
              title="Close Manual"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="border-b-2 border-synth-cyan pb-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 md:w-8 h-8 text-synth-cyan" />
                <span className="font-pixel mb-2 text-synth-yellow uppercase tracking-wide">
                  OFFICIAL OPERATING INSTRUCTIONS
                </span>
              </div>
              <h2 className="font-pixel text-base text-sm md:text-md sm:text-lg text-synth-cyan uppercase">
                CLEANQUEST: RETRO MANUAL &amp; FIELD GUIDE
              </h2>
            </div>

            {/* Content Sections */}
            <div className="space-y-2 md:space-y-4 font-vt text-xl text-gray-200">
              <div>
                <h3 className="font-pixel text-sm text-synth-yellow uppercase flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-synth-yellow" />
                  1. CORE MISSION LOOP
                </h3>
                <p>
                  CleanQuest gamifies household maintenance to eliminate executive dysfunction and ADHD inertia.
                  Select what you want to clean, how you want to do it, and who will keep you company. All tasks are broken down into bite-sized steps so you never feel lost.
                </p>
              </div>

              <div>
                <h3 className="font-pixel text-xs text-synth-magenta uppercase flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5 text-synth-magenta" />
                  2. THE FOUR CLEANING MODES
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong className="text-synth-cyan">Daily Mission (~25 min):</strong> High-impact rapid reset of trash, counters, sink, and clutter. Ideal when guests are incoming or for daily maintenance.
                  </li>
                  <li>
                    <strong className="text-synth-yellow">Main Quest (~140 min):</strong> Complete 5-zone deep reset (kitchen, bathroom, bedroom, living room, entryway) that takes 2-3 hours and transforms your home.
                  </li>
                  <li>
                    <strong className="text-synth-magenta">Boss Fight (Epic Battle):</strong> Heavy-duty encounters against the toughest dirt monsters: baked oven grease, hair-clogged sink traps, tile mold, or condenser coils. Carries the highest score!
                  </li>
                  <li>
                    <strong className="text-white">Side Quests (Sandbox):</strong> Specialized bite-sized tasks that boost your stats quickly: plant watering, sock drawer matching, pantry purge, or closet donation runs.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-pixel text-xs text-synth-cyan uppercase flex items-center gap-1.5 mb-1">
                  <Compass className="w-3.5 h-3.5 text-synth-cyan" />
                  3. THE THREE CLEANING METHODS
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>
                    <strong className="text-synth-cyan">Classic Flow:</strong> Transparent, logically structured sequence where all chores and steps are visible from the start.
                  </li>
                  <li>
                    <strong className="text-synth-yellow">Mystery Shuffle:</strong> Randomizes tasks and reveals them one by one. The element of surprise eliminates chore fatigue!
                  </li>
                  <li>
                    <strong className="text-synth-magenta">Speedrun Challenge:</strong> Race the countdown clock for highscore multiplier bonuses. If Pip the robot is your companion, you race neck-and-neck against an AI rival!
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-pixel text-xs text-synth-yellow uppercase flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-synth-yellow" />
                  4. CO-OP NPC COMPANIONS
                </h3>
                <p>
                  Click your companion at any time during a mission to receive motivation and cleaning science tips:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 mt-1">
                  <li><strong>Sparky the Sponge:</strong> Cheerful hype-artist packed with spray dwell times and chemical cleaning tips.</li>
                  <li><strong>Pip the Robot:</strong> High-efficiency rival that computes completion percentages and spurs you to beat his time.</li>
                  <li><strong>Zen Bunny:</strong> Calm, supportive mentor who offers mindfulness affirmations, deep breaths, and encouragement.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-pixel text-xs text-synth-magenta uppercase mb-1">
                  5. ROUTINE PLANNER &amp; 7-DAY HABIT TRACKER
                </h3>
                <p>
                  The Routine Planner provides a 7-day habit tracker with checkboxes (M T W T F S S).
                  Each Monday, the tracker automatically refreshes. Checking off your day unlocks a customized self-care reward advice (pampering baths, fresh air walks, cozy sock lounges).
                  Rare &amp; seasonal chores store permanent timestamp history logs completely offline in your local browser storage.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sfx.playClick();
                setShowManualModal(false);
              }}
              className="pixel-btn w-full py-2.5 font-pixel text-xs text-center mt-2 cursor-pointer"
            >
              CLOSE MANUAL [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
