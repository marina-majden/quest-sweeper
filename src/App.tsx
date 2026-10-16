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
  const [questTitle, setQuestTitle] = useState('Standard Reset');
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [isPlayingMusic, setIsPlayingMusic] = useState(musicEngine.isPlaying);

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
    let title = 'Standard Reset';

    if (difficulty === 'maintenance') {
      sourceTasks = TASK_DATABASE.maintenance;
      title = 'Quick Maintenance Protocol';
    } else if (difficulty === 'standard') {
      sourceTasks = TASK_DATABASE.standard;
      title = 'Standard 5-Zone Reset';
    } else if (difficulty === 'deep') {
      const bossData = TASK_DATABASE.bossFights[bossType];
      sourceTasks = bossData.tasks;
      title = `Boss: ${bossData.name}`;
    } else if (difficulty === 'specific') {
      const miniData = TASK_DATABASE.miniQuests[specificZone];
      sourceTasks = miniData.tasks;
      title = `Mini Quest: ${miniData.name}`;
    }

    // Clone deep tasks
    let instantiatedTasks: CleaningTask[] = JSON.parse(JSON.stringify(sourceTasks)).map(
      (t: any, i: number) => ({
        ...t,
        id: `task-${Date.now()}-${i}`,
        completed: false,
        showMicro: true,
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

    // Speedrun limit setup
    let limitSecs = 1200; // 20 mins
    if (difficulty === 'maintenance') limitSecs = 600; // 10 mins
    if (difficulty === 'deep') limitSecs = 2700; // 45 mins
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

  // Check ?autostart=1 query param on initial mount for ultra mode verification
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

      {/* Main App Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={handleToggleMusic}
        isMissionActive={questState === 'active'}
      />

      {/* View Container */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex-1">
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
                allTasksCompleted={tasks.every((t) => t.completed)}
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

      {/* Retro 8-bit Footer */}
      <footer className="border-t-4 border-synth-purple bg-synth-dark py-4 text-center text-xs font-pixel text-gray-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CLEANQUEST: 8-BIT SYNTHWAVE EDITION</span>
          <span className="text-synth-cyan">100% OFFLINE LOCAL ARCHIVAL</span>
          <span className="text-synth-magenta">PRESS START TO HYGIENE</span>
        </div>
      </footer>
    </div>
  );
}
