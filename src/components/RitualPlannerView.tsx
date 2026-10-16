import React, { useState, useEffect } from 'react';
import { RitualTask, WeeklyHabitState, DayReward } from '../types/index.ts';
import { sfx } from '../utils/soundEngine.ts';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  PlusCircle,
  Sparkles,
  Shield,
  Trash2,
  RotateCcw,
  History,
  X,
  Gift,
  Pencil,
  Check,
} from 'lucide-react';
import {
  resetRareChores,
  logChoreCompletion,
  removeChoreLog,
  getMondayOfCurrentWeek,
  shouldResetWeeklyHabits,
  WEEKLY_DAY_REWARDS,
} from '../utils/cleaningLogic.ts';

const DEFAULT_WEEKLY_RITUALS: RitualTask[] = [
  { id: 'wr-1', title: 'Monday: Bathroom Swish & Disinfect', category: 'weekly', dayOfWeek: 1, completedToday: false, points: 250, notes: 'Mirrors, vanity sink, toilet swish, fresh towels' },
  { id: 'wr-2', title: 'Tuesday: High-Dusting & Surface Clear', category: 'weekly', dayOfWeek: 2, completedToday: false, points: 250, notes: 'Shelves, blinds, ceiling fans, coffee table' },
  { id: 'wr-3', title: 'Wednesday: Floor Highway Vacuum & Mop', category: 'weekly', dayOfWeek: 3, completedToday: false, points: 250, notes: 'Vacuum baseboards, damp mop kitchen & bathroom tiles' },
  { id: 'wr-4', title: 'Thursday: Bed Linens & Towels Laundry', category: 'weekly', dayOfWeek: 4, completedToday: false, points: 250, notes: 'Strip sheets, hot 60°C wash, fresh pillowcases' },
  { id: 'wr-5', title: 'Friday: Kitchen Reset & Fridge Purge', category: 'weekly', dayOfWeek: 5, completedToday: false, points: 250, notes: 'Discard leftovers, wipe stovetop, empty trash bin' },
  { id: 'wr-6', title: 'Saturday: Epic Boss Encounter (Deep Project)', category: 'weekly', dayOfWeek: 6, completedToday: false, points: 500, notes: 'Oven carbon degrease, drain snaking, or baseboards' },
  { id: 'wr-7', title: 'Sunday: Zen Plant Care & Sock Reunion', category: 'weekly', dayOfWeek: 0, completedToday: false, points: 200, notes: 'Water botanical companions, pair stray socks, relax' },
];

const DEFAULT_RARE_CHORES: RitualTask[] = [
  { id: 'rc-1', title: 'Wash & Sanitize Dishwasher Filter', category: 'monthly', frequencyDays: 30, points: 300, lastCompleted: 'Never', notes: 'Unscrew cylindrical filter at bottom of tub, rinse food slime with warm soapy water' },
  { id: 'rc-2', title: 'Inspect & Vacuum Dryer Vent Duct', category: 'monthly', frequencyDays: 45, points: 350, lastCompleted: 'Never', notes: 'Disconnect flexible silver duct, vacuum lint trap tube to prevent thermal fire risks' },
  { id: 'rc-3', title: 'Descale Coffee Machine & Electric Kettle', category: 'monthly', frequencyDays: 30, points: 250, lastCompleted: 'Never', notes: 'Run cycle with white vinegar or citric acid to dissolve white chalky calcium buildup' },
  { id: 'rc-4', title: 'Rotate & Flip Mattress 180°', category: 'seasonal', frequencyDays: 90, points: 300, lastCompleted: 'Never', notes: 'Rotate head-to-toe to maintain even spring tension and foam longevity' },
  { id: 'rc-5', title: 'Replace HVAC Furnace / Air Conditioner Filter', category: 'seasonal', frequencyDays: 90, points: 350, lastCompleted: 'Never', notes: 'Slide in fresh MERV 11 filter to trap pollen and keep indoor air pristine' },
  { id: 'rc-6', title: 'Vacuum Refrigerator Condenser Coils', category: 'seasonal', frequencyDays: 120, points: 400, lastCompleted: 'Never', notes: 'Dust back or bottom black coils to boost cooling efficiency by 25%' },
  { id: 'rc-7', title: 'Clean Window Tracks & Slats', category: 'monthly', frequencyDays: 45, points: 300, lastCompleted: 'Never', notes: 'Loosen track dirt with vinegar spray and toothbrush scrub' },
];

export const RitualPlannerView: React.FC = () => {
  const [weeklyRituals, setWeeklyRituals] = useState<RitualTask[]>([]);
  const [rareChores, setRareChores] = useState<RitualTask[]>([]);
  const [stats, setStats] = useState({
    totalCleanedMinutes: 0,
    sessionsCompleted: 0,
    bunniesVanished: 0,
    streakDays: 1,
  });

  // Weekly Habit Tracker 7-day state
  const [weeklyHabitState, setWeeklyHabitState] = useState<WeeklyHabitState>({
    weekMondayDate: '',
    completedDays: [false, false, false, false, false, false, false],
  });

  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'rare'>('weekly');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'weekly' | 'monthly' | 'seasonal'>('weekly');
  const [newNotes, setNewNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Rare chores logs modal state
  const [activeLogChore, setActiveLogChore] = useState<RitualTask | null>(null);
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);
  const [manualNote, setManualNote] = useState('');

  // Edit weekly task modal state
  const [editingWeeklyTask, setEditingWeeklyTask] = useState<RitualTask | null>(null);
  const [editWeeklyTitle, setEditWeeklyTitle] = useState('');
  const [editWeeklyNotes, setEditWeeklyNotes] = useState('');

  // Daily reward advice modal state
  const [activeReward, setActiveReward] = useState<DayReward | null>(null);

  // In-app confirmation for rare chores reset
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedWeekly = localStorage.getItem('cleanquest_rituals_weekly');
      if (savedWeekly) {
        setWeeklyRituals(JSON.parse(savedWeekly));
      } else {
        setWeeklyRituals(DEFAULT_WEEKLY_RITUALS);
        localStorage.setItem('cleanquest_rituals_weekly', JSON.stringify(DEFAULT_WEEKLY_RITUALS));
      }

      const savedRare = localStorage.getItem('cleanquest_rituals_rare');
      if (savedRare) {
        setRareChores(JSON.parse(savedRare));
      } else {
        setRareChores(DEFAULT_RARE_CHORES);
        localStorage.setItem('cleanquest_rituals_rare', JSON.stringify(DEFAULT_RARE_CHORES));
      }

      const savedStats = localStorage.getItem('cleanquest_stats');
      if (savedStats) {
        setStats((prev) => ({ ...prev, ...JSON.parse(savedStats) }));
      }

      // Load Weekly Habit Tracker state with automatic Monday refresh
      const currentMonday = getMondayOfCurrentWeek(new Date());
      const savedHabits = localStorage.getItem('cleanquest_weekly_habits');
      if (savedHabits) {
        const parsed: WeeklyHabitState = JSON.parse(savedHabits);
        if (shouldResetWeeklyHabits(parsed.weekMondayDate, currentMonday)) {
          // New Monday! Refresh all checkboxes to unchecked state
          const refreshed: WeeklyHabitState = {
            weekMondayDate: currentMonday,
            completedDays: [false, false, false, false, false, false, false],
          };
          setWeeklyHabitState(refreshed);
          localStorage.setItem('cleanquest_weekly_habits', JSON.stringify(refreshed));
        } else {
          setWeeklyHabitState(parsed);
        }
      } else {
        const initialHabits: WeeklyHabitState = {
          weekMondayDate: currentMonday,
          completedDays: [false, false, false, false, false, false, false],
        };
        setWeeklyHabitState(initialHabits);
        localStorage.setItem('cleanquest_weekly_habits', JSON.stringify(initialHabits));
      }
    } catch {}
  }, []);

  // Save changes
  const saveWeekly = (tasks: RitualTask[]) => {
    setWeeklyRituals(tasks);
    localStorage.setItem('cleanquest_rituals_weekly', JSON.stringify(tasks));
  };

  const saveRare = (tasks: RitualTask[]) => {
    setRareChores(tasks);
    localStorage.setItem('cleanquest_rituals_rare', JSON.stringify(tasks));
  };

  // Toggle habit checkbox for a given day (0 = Mon, 1 = Tue, ... 6 = Sun)
  const handleToggleHabitDay = (dayIndex: number) => {
    const currentCompleted = [...weeklyHabitState.completedDays];
    const willBeChecked = !currentCompleted[dayIndex];
    currentCompleted[dayIndex] = willBeChecked;

    if (willBeChecked) {
      sfx.playCoin();
      // Update last completed date for the corresponding weekly task
      const targetDayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1;
      const todayFormatted = new Date().toLocaleDateString();
      const updatedWeekly = weeklyRituals.map((r) => {
        if (r.dayOfWeek === targetDayOfWeek) {
          return {
            ...r,
            lastCompleted: todayFormatted,
          };
        }
        return r;
      });
      saveWeekly(updatedWeekly);
    } else {
      sfx.playClick();
    }

    const updatedState: WeeklyHabitState = {
      ...weeklyHabitState,
      completedDays: currentCompleted,
    };
    setWeeklyHabitState(updatedState);
    localStorage.setItem('cleanquest_weekly_habits', JSON.stringify(updatedState));
  };

  // Open reward modal for a given day
  const handleOpenReward = (dayIndex: number) => {
    if (!weeklyHabitState.completedDays[dayIndex]) {
      sfx.playError();
      return;
    }
    sfx.playPowerup();
    const reward = WEEKLY_DAY_REWARDS[dayIndex];
    setActiveReward(reward);
  };

  // Open edit modal for weekly task
  const handleOpenEditWeekly = (task: RitualTask) => {
    sfx.playClick();
    setEditingWeeklyTask(task);
    setEditWeeklyTitle(task.title);
    setEditWeeklyNotes(task.notes || '');
  };

  // Save edited weekly task
  const handleSaveEditWeekly = () => {
    if (!editingWeeklyTask || !editWeeklyTitle.trim()) {
      sfx.playError();
      return;
    }
    sfx.playCoin();
    const updated = weeklyRituals.map((task) => {
      if (task.id !== editingWeeklyTask.id) return task;
      return {
        ...task,
        title: editWeeklyTitle.trim(),
        notes: editWeeklyNotes.trim() || undefined,
      };
    });
    saveWeekly(updated);
    setEditingWeeklyTask(null);
  };

  // Mark Rare Chore done today -> saves timestamp log and opens the logs window
  const handleCompleteRareChore = (id: string) => {
    sfx.playCoin();
    let targetChore: RitualTask | null = null;
    const updated = rareChores.map((r) => {
      if (r.id !== id) return r;
      const logged = logChoreCompletion(r, new Date());
      targetChore = logged;
      return logged;
    });
    saveRare(updated);
    if (targetChore) {
      setActiveLogChore(targetChore);
      if ((targetChore as RitualTask).historyLogs?.[0]) {
        setJustLoggedId((targetChore as RitualTask).historyLogs![0].id);
      }
    }
  };

  // Delete a specific timestamp log from a chore
  const handleDeleteChoreLog = (choreId: string, logId: string) => {
    sfx.playClick();
    let targetChore: RitualTask | null = null;
    const updated = rareChores.map((r) => {
      if (r.id !== choreId) return r;
      const modified = removeChoreLog(r, logId);
      targetChore = modified;
      return modified;
    });
    saveRare(updated);
    if (targetChore) {
      setActiveLogChore(targetChore);
    }
  };

  // Manually add a completion timestamp log with optional note
  const handleAddManualLog = (choreId: string) => {
    sfx.playCoin();
    let targetChore: RitualTask | null = null;
    const updated = rareChores.map((r) => {
      if (r.id !== choreId) return r;
      const logged = logChoreCompletion(r, new Date(), manualNote.trim() || undefined);
      targetChore = logged;
      return logged;
    });
    saveRare(updated);
    setManualNote('');
    if (targetChore) {
      setActiveLogChore(targetChore);
      if ((targetChore as RitualTask).historyLogs?.[0]) {
        setJustLoggedId((targetChore as RitualTask).historyLogs![0].id);
      }
    }
  };

  // Add custom ritual
  const handleAddRitual = () => {
    if (!newTitle.trim()) {
      sfx.playError();
      return;
    }
    sfx.playCoin();
    const newTask: RitualTask = {
      id: `custom-r-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      completedToday: false,
      lastCompleted: 'Never',
      points: 250,
      notes: newNotes.trim() || undefined,
    };

    if (newCategory === 'weekly') {
      saveWeekly([...weeklyRituals, newTask]);
    } else {
      saveRare([...rareChores, newTask]);
    }

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  // Delete rare task
  const handleDeleteRareTask = (id: string) => {
    sfx.playClick();
    saveRare(rareChores.filter((t) => t.id !== id));
  };

  // Execute restore of default rare & seasonal chores
  const executeResetRareChores = () => {
    const restored = resetRareChores(DEFAULT_RARE_CHORES);
    saveRare(restored);
    setShowResetConfirmModal(false);
    sfx.playCoin();
  };

  // Current day index (0 = Sun, 1 = Mon, ... 6 = Sat)
  const currentDayOfWeek = new Date().getDay();
  // Monday-based index: 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
  const todayMondayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  // Day letters M T W T F S S
  const HABIT_DAYS: Array<{ index: number; letter: 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S'; name: string }> = [
    { index: 0, letter: 'M', name: 'Mon' },
    { index: 1, letter: 'T', name: 'Tue' },
    { index: 2, letter: 'W', name: 'Wed' },
    { index: 3, letter: 'T', name: 'Thu' },
    { index: 4, letter: 'F', name: 'Fri' },
    { index: 5, letter: 'S', name: 'Sat' },
    { index: 6, letter: 'S', name: 'Sun' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="pixel-box p-6 bg-synth-dark border-synth-cyan">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-6 h-6 text-synth-cyan" />
              <h2 className="font-pixel text-lg sm:text-xl text-synth-cyan uppercase">
                RITUAL &amp; ROUTINE COMMAND HUB
              </h2>
            </div>
            <p className="font-vt text-xl text-gray-300">
              Manage weekly rhythms and rare seasonal household maintenance completely offline with local storage.
            </p>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddModal(true);
            }}
            className="pixel-btn px-4 py-2 font-pixel text-xs flex items-center gap-2 self-stretch md:self-auto justify-center"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>ADD RITUAL</span>
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="pixel-box p-4 bg-synth-dark text-center">
          <div className="flex items-center justify-center gap-1.5 text-synth-magenta mb-1">
            <Flame className="w-4 h-4 animate-bounce" />
            <span className="font-pixel text-[9px]">CLEANING STREAK</span>
          </div>
          <div className="font-pixel text-2xl text-white">
            {stats.streakDays} <span className="text-xs text-synth-magenta">DAYS</span>
          </div>
        </div>

        <div className="pixel-box p-4 bg-synth-dark text-center">
          <div className="flex items-center justify-center gap-1.5 text-synth-cyan mb-1">
            <Clock className="w-4 h-4" />
            <span className="font-pixel text-[9px]">MINUTES CLEANED</span>
          </div>
          <div className="font-pixel text-2xl text-synth-cyan">
            {stats.totalCleanedMinutes} <span className="text-xs text-synth-cyan">MIN</span>
          </div>
        </div>

        <div className="pixel-box p-4 bg-synth-dark text-center">
          <div className="flex items-center justify-center gap-1.5 text-synth-yellow mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="font-pixel text-[9px]">BUNNIES VANQUISHED</span>
          </div>
          <div className="font-pixel text-2xl text-synth-yellow">
            {stats.bunniesVanished}
          </div>
        </div>

        <div className="pixel-box p-4 bg-synth-dark text-center">
          <div className="flex items-center justify-center gap-1.5 text-green-400 mb-1">
            <Shield className="w-4 h-4" />
            <span className="font-pixel text-[9px]">MISSIONS DONE</span>
          </div>
          <div className="font-pixel text-2xl text-green-400">
            {stats.sessionsCompleted}
          </div>
        </div>
      </div>

      {/* SUB-TABS: WEEKLY MATRIX VS RARE / SEASONAL CHORES */}
      <div className="flex gap-3 border-b-4 border-synth-magenta pb-2">
        <button
          onClick={() => {
            sfx.playClick();
            setActiveSubTab('weekly');
          }}
          className={`px-4 py-2 font-pixel text-xs transition-colors cursor-pointer ${
            activeSubTab === 'weekly'
              ? 'bg-synth-magenta text-white shadow-[2px_2px_0_#05d9e8]'
              : 'bg-synth-dark text-gray-400 hover:text-white'
          }`}
        >
          WEEKLY ROTATION MATRIX
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setActiveSubTab('rare');
          }}
          className={`px-4 py-2 font-pixel text-xs transition-colors cursor-pointer ${
            activeSubTab === 'rare'
              ? 'bg-synth-cyan text-synth-dark font-bold shadow-[2px_2px_0_#ff2a6d]'
              : 'bg-synth-dark text-gray-400 hover:text-white'
          }`}
        >
          RARE &amp; SEASONAL CHORES
        </button>
      </div>

      {/* TAB 1: WEEKLY ROTATION MATRIX */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-6">
          <p className="font-vt text-xl text-synth-cyan">
            Dedicate each day to one clear focal area to eliminate mental friction. Check the day box to record your habit and unlock your customized reward!
          </p>

          {/* 7-DAYS HABIT TRACKER BOXES */}
          <div className="pixel-box p-4 sm:p-5 bg-synth-dark border-synth-magenta shadow-[4px_4px_0_#05d9e8]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-synth-yellow animate-pulse" />
                <span className="font-pixel text-xs text-synth-yellow uppercase">
                  WEEKLY HABIT TRACKER (M T W T F S S)
                </span>
              </div>
              <span className="font-pixel text-[8px] text-gray-400 bg-synth-gray px-2 py-1">
                REFRESHES EVERY MONDAY AUTOMATICALLY
              </span>
            </div>

            {/* 7 DAY BOXES GRID */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
              {HABIT_DAYS.map((day) => {
                const isChecked = Boolean(weeklyHabitState.completedDays[day.index]);
                const isToday = todayMondayIndex === day.index;

                return (
                  <div
                    key={day.index}
                    className={`pixel-box p-2 sm:p-3 flex flex-col items-center justify-between text-center transition-all min-h-[110px] sm:min-h-[125px] ${
                      isToday
                        ? 'border-synth-yellow bg-synth-purple/40 shadow-[0_0_12px_rgba(255,221,0,0.4)]'
                        : isChecked
                        ? 'border-synth-cyan bg-synth-cyan/10'
                        : 'border-gray-700 bg-synth-dark/80'
                    }`}
                  >
                    {/* Top Day Header / Today Badge */}
                    <div className="w-full text-center">
                      {isToday ? (
                        <span className="bg-synth-yellow text-synth-dark font-pixel text-[7px] sm:text-[8px] px-1 py-0.2 uppercase block truncate font-bold">
                          TODAY
                        </span>
                      ) : (
                        <span className="font-pixel text-[8px] sm:text-[9px] text-gray-400 uppercase block truncate">
                          {day.name}
                        </span>
                      )}
                    </div>

                    {/* Checkbox marked with first letter of the day */}
                    <button
                      onClick={() => handleToggleHabitDay(day.index)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 border-2 flex items-center justify-center font-pixel text-xs sm:text-sm font-black transition-all cursor-pointer select-none my-1.5 ${
                        isChecked
                          ? 'bg-synth-cyan border-synth-cyan text-synth-dark shadow-[2px_2px_0_#ff2a6d] scale-105'
                          : 'bg-synth-dark border-gray-600 text-gray-300 hover:border-synth-cyan hover:text-white'
                      }`}
                      aria-label={`Toggle habit for ${day.name} (${day.letter})`}
                      title={`Click to mark ${day.name} complete or incomplete`}
                    >
                      {isChecked ? (
                        <div className="flex flex-col items-center justify-center leading-none">
                          <Check className="w-4 h-4 stroke-[3.5] text-synth-dark" />
                          <span className="text-[9px] leading-tight font-black">{day.letter}</span>
                        </div>
                      ) : (
                        <span>{day.letter}</span>
                      )}
                    </button>

                    {/* Gift Icon Button: Disabled per default, enables when user checks the box */}
                    <button
                      onClick={() => handleOpenReward(day.index)}
                      disabled={!isChecked}
                      className={`w-full py-1 px-1 flex items-center justify-center gap-1 font-pixel text-[8px] transition-all rounded-sm ${
                        isChecked
                          ? 'bg-synth-yellow text-synth-dark font-black hover:bg-white cursor-pointer shadow-[1px_1px_0_#ff2a6d] animate-pulse'
                          : 'bg-synth-gray/40 border border-gray-800 text-gray-600 cursor-not-allowed opacity-40'
                      }`}
                      title={
                        isChecked
                          ? `Claim your earned ${day.name} reward advice!`
                          : `Check ${day.letter} above to unlock your reward!`
                      }
                      aria-label={`Gift reward for ${day.name}`}
                    >
                      <Gift
                        className={`w-3.5 h-3.5 ${
                          isChecked ? 'text-synth-dark stroke-[2.5]' : 'text-gray-600'
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {isChecked ? 'REWARD' : 'LOCKED'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SINGLE CONTAINER FOR WEEKLY TASKS */}
          <div className="pixel-box p-5 bg-synth-dark border-synth-cyan space-y-4 shadow-[6px_6px_0_#2d1b4e]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-700 pb-3 gap-2">
              <div>
                <h3 className="font-pixel text-xs sm:text-sm text-synth-yellow uppercase tracking-wide">
                  WEEKLY ROTATION SCHEDULE
                </h3>
                <p className="font-vt text-lg text-gray-400">
                  Tasks are fixed weekly focal areas. Track daily completions via the 7-day checkboxes above.
                </p>
              </div>
              <div className="font-pixel text-[9px] text-synth-cyan bg-synth-purple px-2 py-1 border border-synth-cyan/50 self-start sm:self-auto">
                TODAY: {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][currentDayOfWeek]}
              </div>
            </div>

            {/* List with weekly tasks in single container (cannot be checked, unchecked, or deleted; points removed; edit icon replaces delete) */}
            <div className="divide-y divide-gray-800">
              {weeklyRituals.map((ritual, idx) => {
                const isToday = ritual.dayOfWeek === currentDayOfWeek;
                const habitIdx = ritual.dayOfWeek === 0 ? 6 : (ritual.dayOfWeek ? ritual.dayOfWeek - 1 : idx % 7);
                const isDayChecked = Boolean(weeklyHabitState.completedDays[habitIdx]);

                return (
                  <div
                    key={ritual.id}
                    className={`py-3.5 px-3 flex items-start justify-between gap-4 transition-colors ${
                      isToday ? 'bg-synth-purple/30 border-l-4 border-synth-yellow' : 'hover:bg-synth-gray/20'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isToday && (
                          <span className="bg-synth-yellow text-synth-dark font-pixel text-[8px] px-1.5 py-0.5 font-bold">
                            TODAY'S FOCUS
                          </span>
                        )}
                        {isDayChecked && (
                          <span className="bg-synth-cyan/20 border border-synth-cyan text-synth-cyan font-pixel text-[8px] px-1.5 py-0.5">
                            COMPLETED THIS WEEK
                          </span>
                        )}
                        <h4
                          className={`font-pixel text-xs ${
                            isDayChecked
                              ? 'text-synth-cyan'
                              : isToday
                              ? 'text-synth-yellow font-bold'
                              : 'text-white'
                          }`}
                        >
                          {ritual.title}
                        </h4>
                      </div>

                      {ritual.notes && (
                        <p className="font-vt text-lg text-gray-300 mt-1">{ritual.notes}</p>
                      )}

                      <div className="font-pixel text-[9px] text-gray-400 mt-1.5">
                        <span>LAST COMPLETED: {ritual.lastCompleted || 'Never'}</span>
                      </div>
                    </div>

                    {/* Edit Icon Button replaces delete button */}
                    <button
                      onClick={() => handleOpenEditWeekly(ritual)}
                      className="pixel-btn-cyan p-2 font-pixel text-xs text-synth-cyan hover:text-white cursor-pointer flex-shrink-0"
                      title="Edit Weekly Task"
                      aria-label={`Edit ${ritual.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RARE & SEASONAL CHORES */}
      {activeSubTab === 'rare' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="font-vt text-xl text-synth-cyan">
              Vital preventive maintenance tasks done monthly or seasonally to prevent catastrophic appliance failures and fire hazards.
            </p>

            {/* RESET BUTTON FOR RARE & SEASONAL CHORES */}
            <button
              onClick={() => {
                sfx.playClick();
                setShowResetConfirmModal(true);
              }}
              className="pixel-btn px-3 py-1.5 font-pixel text-[9px] bg-synth-yellow text-synth-dark hover:bg-white flex items-center gap-1.5 shadow-[2px_2px_0_#ff2a6d] flex-shrink-0 cursor-pointer"
              title="Reset all default rare & seasonal chores"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>RESET DEFAULTS</span>
            </button>
          </div>

          {rareChores.length === 0 ? (
            <div className="pixel-box p-8 bg-synth-dark border-synth-magenta text-center space-y-4 shadow-[6px_6px_0_#05d9e8]">
              <div className="text-5xl animate-bounce">🧹</div>
              <h4 className="font-pixel text-sm sm:text-base text-synth-yellow">
                &gt; NO RARE CHORES RECORDED IN ARCHIVES &lt;
              </h4>
              <p className="font-vt text-2xl text-gray-300 max-w-lg mx-auto">
                All rare and seasonal chores have been erased from your local checklist. Click below to instantly restore the complete default seasonal maintenance arsenal!
              </p>
              <div className="pt-2">
                <button
                  onClick={executeResetRareChores}
                  className="pixel-btn px-6 py-3 font-pixel text-xs bg-synth-yellow text-synth-dark hover:bg-white inline-flex items-center gap-2 shadow-[4px_4px_0_#ff2a6d] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>RESTORE ALL DEFAULT RARE CHORES</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {rareChores.map((chore) => (
                <div
                  key={chore.id}
                  className="pixel-box p-4 bg-synth-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-synth-purple border border-synth-cyan text-synth-cyan font-pixel text-[8px] px-1.5 py-0.5">
                        {chore.category.toUpperCase()} (EVERY {chore.frequencyDays || 30} DAYS)
                      </span>
                      <h4 className="font-pixel text-xs text-white">{chore.title}</h4>
                    </div>
                    {chore.notes && (
                      <p className="font-vt text-lg text-gray-300">{chore.notes}</p>
                    )}
                    <div className="font-pixel text-[9px] text-gray-400 mt-1 flex items-center gap-3">
                      <span className="text-synth-yellow">+{chore.points} XP</span>
                      <span>LAST COMPLETED: {chore.lastCompleted || 'Never'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        sfx.playClick();
                        setActiveLogChore(chore);
                        setJustLoggedId(null);
                      }}
                      className="pixel-btn-cyan px-2.5 py-1.5 font-pixel text-[8px] flex items-center gap-1 cursor-pointer"
                      title="View historical completion logs"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>LOGS ({chore.historyLogs?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => handleCompleteRareChore(chore.id)}
                      className="pixel-btn px-3 py-1.5 font-pixel text-[9px] bg-synth-cyan text-synth-dark hover:bg-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>MARK DONE TODAY</span>
                    </button>

                    <button
                      onClick={() => handleDeleteRareTask(chore.id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 cursor-pointer"
                      title="Delete Chore"
                      aria-label="Delete chore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM RESET RARE CHORES MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-md w-full relative bg-synth-dark space-y-4 shadow-[8px_8px_0_#ff2a6d] border-synth-yellow">
            <h3 className="font-pixel text-xs text-synth-yellow border-b-2 border-synth-yellow pb-2 uppercase">
              &gt; RESTORE DEFAULT RARE CHORES? &lt;
            </h3>
            <p className="font-vt text-xl text-gray-300">
              This will restore all default rare and seasonal maintenance chores (dishwasher filter, dryer vent, kettle descaling, condenser coils, etc.) to your local checklist.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="pixel-btn bg-gray-700 text-gray-300 w-1/2 py-2 font-pixel text-xs cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={executeResetRareChores}
                className="pixel-btn bg-synth-yellow text-synth-dark hover:bg-white w-1/2 py-2 font-pixel text-xs cursor-pointer"
              >
                RESTORE DEFAULTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WEEKLY TASK MODAL */}
      {editingWeeklyTask && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-md w-full relative bg-synth-dark space-y-4 shadow-[8px_8px_0_#05d9e8] border-synth-cyan">
            <div className="flex justify-between items-center border-b-2 border-synth-cyan pb-2">
              <h3 className="font-pixel text-xs text-synth-yellow uppercase">
                &gt; EDIT WEEKLY TASK &lt;
              </h3>
              <button
                onClick={() => setEditingWeeklyTask(null)}
                className="text-gray-400 hover:text-white font-pixel text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-pixel text-[9px] text-synth-cyan block mb-1">
                  TASK TITLE:
                </label>
                <input
                  type="text"
                  value={editWeeklyTitle}
                  onChange={(e) => setEditWeeklyTitle(e.target.value)}
                  className="w-full bg-synth-gray border-2 border-synth-cyan text-white font-vt text-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-pixel text-[9px] text-gray-400 block mb-1">
                  GUIDELINES &amp; NOTES:
                </label>
                <textarea
                  rows={3}
                  value={editWeeklyNotes}
                  onChange={(e) => setEditWeeklyNotes(e.target.value)}
                  className="w-full bg-synth-gray border-2 border-gray-600 text-white font-vt text-lg p-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingWeeklyTask(null)}
                  className="pixel-btn bg-gray-700 text-gray-300 w-1/2 py-2 font-pixel text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveEditWeekly}
                  className="pixel-btn w-1/2 py-2 font-pixel text-xs cursor-pointer"
                >
                  SAVE CHANGES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAILY REWARD ADVICE MODAL (REQUEST 5) */}
      {activeReward && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-lg w-full relative bg-synth-dark space-y-4 shadow-[8px_8px_0_#ffdd00] border-synth-yellow animate-fadeIn">
            <button
              onClick={() => {
                sfx.playClick();
                setActiveReward(null);
              }}
              className="absolute -top-3 -right-3 bg-synth-magenta text-white border-2 border-white w-8 h-8 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 border-b-2 border-synth-yellow pb-3">
              <div className="text-5xl animate-bounce">{activeReward.icon}</div>
              <div className="font-pixel text-[9px] text-synth-cyan uppercase tracking-wider">
                ★ {activeReward.dayName.toUpperCase()} REWARD UNLOCKED ★
              </div>
              <h3 className="font-pixel text-sm sm:text-base text-synth-yellow uppercase">
                {activeReward.rewardTitle}
              </h3>
              <p className="font-pixel text-[8px] text-synth-magenta">
                CHORE COMPLETED: {activeReward.taskTheme}
              </p>
            </div>

            <div className="p-4 bg-synth-purple/50 border-2 border-synth-magenta/70 rounded">
              <p className="font-pixel text-[9px] text-synth-yellow mb-2 uppercase">
                &gt; YOUR EARNED REWARD ADVICE:
              </p>
              <p className="font-vt text-2xl text-white leading-relaxed">
                "{activeReward.rewardAdvice}"
              </p>
            </div>

            <div className="text-center">
              <p className="font-vt text-lg text-gray-300">
                You earned this reward by taking care of your living sanctuary. Take time to relax and recharge!
              </p>
            </div>

            <button
              onClick={() => {
                sfx.playPowerup();
                setActiveReward(null);
              }}
              className="pixel-btn w-full py-3 font-pixel text-xs bg-synth-yellow text-synth-dark hover:bg-white shadow-[4px_4px_0_#ff2a6d] cursor-pointer"
            >
              CLAIM &amp; ENJOY REWARD
            </button>
          </div>
        </div>
      )}

      {/* ADD RITUAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-md w-full relative bg-synth-dark space-y-4">
            <h3 className="font-pixel text-xs text-synth-yellow border-b-2 border-synth-yellow pb-2">
              &gt; ADD CUSTOM CLEANING RITUAL &lt;
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-pixel text-[9px] text-synth-cyan block mb-1">
                  RITUAL TITLE (REQUIRED):
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wash pet food bowls, Descale showerhead"
                  className="w-full bg-synth-gray border-2 border-synth-cyan text-white font-vt text-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-pixel text-[9px] text-synth-magenta block mb-1">
                  FREQUENCY CATEGORY:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-synth-gray border-2 border-synth-magenta text-white font-pixel text-xs p-2.5 focus:outline-none"
                >
                  <option value="weekly">Weekly Rotation (Daily rhythm)</option>
                  <option value="monthly">Monthly Deep Task</option>
                  <option value="seasonal">Seasonal / Rare Maintenance</option>
                </select>
              </div>

              <div>
                <label className="font-pixel text-[9px] text-gray-400 block mb-1">
                  ACTION NOTES / SCIENTIFIC METHOD (OPTIONAL):
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Brief step-by-step instructions or tips..."
                  className="w-full bg-synth-gray border-2 border-gray-600 text-white font-vt text-xl p-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="pixel-btn bg-gray-700 text-gray-300 w-1/2 py-2 font-pixel text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAddRitual}
                  className="pixel-btn w-1/2 py-2 font-pixel text-xs cursor-pointer"
                >
                  SAVE RITUAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE HISTORY LOG MODAL FOR RARE & SEASONAL CHORES (REQUEST 4) */}
      {activeLogChore && (
        <div className="fixed inset-0 retro-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="pixel-box p-6 max-w-lg w-full relative bg-synth-dark space-y-4 shadow-[8px_8px_0_#ff2a6d]">
            <button
              onClick={() => {
                sfx.playClick();
                setActiveLogChore(null);
                setJustLoggedId(null);
              }}
              className="absolute -top-3 -right-3 bg-synth-magenta text-white border-2 border-white w-8 h-8 font-pixel flex items-center justify-center hover:bg-white hover:text-synth-magenta cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="border-b-2 border-synth-cyan pb-2">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-5 h-5 text-synth-cyan animate-spin" />
                <span className="font-pixel text-[9px] text-synth-magenta uppercase tracking-wider">
                  TASK COMPLETION ARCHIVE &amp; TIMESTAMPS
                </span>
              </div>
              <h3 className="font-pixel text-sm sm:text-base text-synth-yellow uppercase">
                {activeLogChore.title}
              </h3>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-pixel bg-synth-gray/70 p-3 border border-gray-700">
              <div>
                <span className="text-gray-400 block mb-0.5">TARGET FREQUENCY:</span>
                <span className="text-synth-cyan">Every {activeLogChore.frequencyDays || 30} Days</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">TOTAL LOGGED RUNS:</span>
                <span className="text-synth-yellow">
                  {activeLogChore.historyLogs?.length || 0} Cleans Recorded
                </span>
              </div>
            </div>

            {/* Timestamps Log List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {!activeLogChore.historyLogs || activeLogChore.historyLogs.length === 0 ? (
                <div className="p-5 bg-synth-gray/30 border border-gray-700 text-center font-vt text-xl text-gray-400">
                  No service logs recorded yet. Click "MARK DONE TODAY" to register your first timestamp!
                </div>
              ) : (
                activeLogChore.historyLogs.map((log, index) => {
                  const isJustLogged = justLoggedId === log.id;
                  return (
                    <div
                      key={log.id}
                      className={`p-3 border flex justify-between items-center transition-all ${
                        isJustLogged
                          ? 'bg-synth-purple/70 border-synth-yellow shadow-[2px_2px_0_#05d9e8]'
                          : 'bg-synth-gray/40 border-gray-700 hover:border-synth-cyan'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-pixel text-[8px] bg-synth-dark text-synth-cyan px-1.5 py-0.5 border border-synth-cyan/50">
                            RUN #{activeLogChore.historyLogs!.length - index}
                          </span>
                          <span className="font-pixel text-xs text-white">
                            {log.formattedDate} • {log.formattedTime}
                          </span>
                          {isJustLogged && (
                            <span className="bg-synth-magenta text-white font-pixel text-[7px] px-1.5 py-0.5 animate-pulse">
                              JUST SAVED!
                            </span>
                          )}
                        </div>
                        {log.note && (
                          <p className="font-vt text-lg text-synth-yellow mt-1">{log.note}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteChoreLog(activeLogChore.id, log.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 cursor-pointer ml-2 flex-shrink-0"
                        title="Delete this timestamp entry"
                        aria-label="Delete timestamp entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Manual or Optional Note */}
            <div className="pt-2 border-t border-gray-700 space-y-2">
              <label className="font-pixel text-[8px] text-gray-400 block">
                LOG ANOTHER SERVICE TIMESTAMP WITH NOTE:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. Swapped filter, flushed with citric acid..."
                  className="flex-1 bg-synth-gray border border-synth-cyan text-white font-vt text-lg px-2.5 py-1.5 focus:outline-none focus:border-synth-yellow"
                />
                <button
                  onClick={() => handleAddManualLog(activeLogChore.id)}
                  className="pixel-btn px-3 py-1.5 font-pixel text-[9px] bg-synth-magenta text-white flex-shrink-0 cursor-pointer"
                >
                  + LOG RUN
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sfx.playClick();
                setActiveLogChore(null);
                setJustLoggedId(null);
              }}
              className="pixel-btn w-full py-2.5 font-pixel text-xs text-center mt-2 cursor-pointer"
            >
              CLOSE LOG ARCHIVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
