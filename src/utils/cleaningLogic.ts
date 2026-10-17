import type { CleaningTask, DifficultyType, GameModeType, ChoreLogEntry, DayReward, WeeklyHabitState } from '../types/index.ts';



/**
 * Calculates score for completing a task or microstep
 */
export function calculateTaskPoints(isBoss: boolean, microCount: number): number {
  if (isBoss) {
    return 1000 + (microCount * 150);
  }
  return microCount > 0 ? microCount * 100 : 500;
}

/**
 * Computes speedrun bonus or penalty
 */
export function calculateSpeedrunBonus(
  allCompleted: boolean,
  timeRemainingSeconds: number,
  limitSeconds: number
): { bonus: number; label: string; isPenalty: boolean } {
  if (allCompleted && timeRemainingSeconds > 0) {
    const timeRatioBonus = Math.floor(timeRemainingSeconds * 12);
    const speedScore = 1500 + timeRatioBonus;
    return {
      bonus: speedScore,
      label: `TIME BONUS (+${timeRemainingSeconds}s remaining)`,
      isPenalty: false,
    };
  }
  if (!allCompleted && timeRemainingSeconds <= 0) {
    return {
      bonus: -1500,
      label: 'TIME OUT PENALTY',
      isPenalty: true,
    };
  }
  return {
    bonus: 0,
    label: 'NO TIME BONUS',
    isPenalty: false,
  };
}

/**
 * Calculates rank (S, A, B, C) based on score and completion ratio
 */
export function calculateRank(
  score: number,
  completedTasks: number,
  totalTasks: number,
  isSpeedrunWin: boolean
): 'S' | 'A' | 'B' | 'C' {
  const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  if (completionRatio === 1 && (score >= 4000 || isSpeedrunWin)) {
    return 'S';
  }
  if (completionRatio >= 0.85 || score >= 2500) {
    return 'A';
  }
  if (completionRatio >= 0.6 || score >= 1500) {
    return 'B';
  }
  return 'C';
}

export interface MilitaryRankResult {
  tierName: string;
  rankTitle: string;
  rankAbbr: string;
  completionPercent: number;
  statusBadge: string;
  isSpeedrun: boolean;
  isSuccess: boolean;
  isOvertime: boolean;
  certificateTitle: string;
  certificateSubtitle: string;
  description: string;
}

/**
 * Calculates military rank certifications based on mode tiers and task completion percentage.
 * - Speedrun: mission success or mission failed (with completion certificate even if timing failed)
 * - Main Quest: Highest Tier (Supreme Command - General, Colonel, Major, Captain, Lieutenant)
 * - Boss Fight: Special Tier (Special Ops - Apex Commander, Strike Chief, Heavy Vanguard, Combat Specialist)
 * - Side Quests: Different Tier (Specialist Corps - Master Chief Specialist, Warrant Officer, Staff Sergeant)
 * - Quick Mission: Lesser Tier (Patrol Corps - First Sergeant, Sergeant, Corporal, Private First Class, Recruit)
 */
export function calculateMilitaryRank(params: {
  difficulty: DifficultyType;
  gameMode: GameModeType;
  completedTasks: number;
  totalTasks: number;
  timeRemainingSeconds: number;
}): MilitaryRankResult {
  const { difficulty, gameMode, completedTasks, totalTasks, timeRemainingSeconds } = params;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const allTasksDone = totalTasks > 0 && completedTasks >= totalTasks;

  if (gameMode === 'speedrun') {
    const isTimingSuccessful = timeRemainingSeconds > 0;
    if (allTasksDone && isTimingSuccessful) {
      return {
        tierName: 'SPEEDRUN DIVISION',
        rankTitle: 'SPEEDRUN FLEET ADMIRAL',
        rankAbbr: 'ACE',
        completionPercent: 100,
        statusBadge: 'MISSION SUCCESS',
        isSpeedrun: true,
        isSuccess: true,
        isOvertime: false,
        certificateTitle: 'Cleanquest certificate',
        certificateSubtitle: 'Mission accomplished',
        description: `Speedrun flawless victory! All ${completedTasks}/${totalTasks} objectives secured under time limit!`,
      };
    }

    if (allTasksDone && !isTimingSuccessful) {
      return {
        tierName: 'SPEEDRUN DIVISION',
        rankTitle: 'OVERTIME VETERAN',
        rankAbbr: 'VET',
        completionPercent: 100,
        statusBadge: 'OVERTIME VICTORY',
        isSpeedrun: true,
        isSuccess: false,
        isOvertime: true,
        certificateTitle: 'Cleanquest certificate',
        certificateSubtitle: 'Mission accomplished (Overtime)',
        description: `Timer expired, but all ${completedTasks}/${totalTasks} tasks were cleared! Certificate of completion granted.`,
      };
    }

    return {
      tierName: 'SPEEDRUN DIVISION',
      rankTitle: 'HONORABLE CADET',
      rankAbbr: 'MIA',
      completionPercent: pct,
      statusBadge: 'MISSION FAILED',
      isSpeedrun: true,
      isSuccess: false,
      isOvertime: false,
      certificateTitle: 'Cleanquest certificate',
      certificateSubtitle: 'Mission timed out',
      description: `Time expired with ${completedTasks}/${totalTasks} (${pct}%) tasks completed. Tactical retreat executed.`,
    };
  }

  // Tier 1: Main Quest (Highest tier - Supreme Command)
  if (difficulty === 'standard') {
    let rankTitle = 'SECOND LIEUTENANT';
    let rankAbbr = '2LT';
    let desc = 'Forward outpost cleared, perimeter established.';

    if (pct === 100) {
      rankTitle = 'SUPREME COMMANDER';
      rankAbbr = 'GEN';
      desc = '5-Star General of Hygiene! Flawless total liberation of the home sanctuary.';
    } else if (pct >= 80) {
      rankTitle = 'COLONEL OF SANCTUARY';
      rankAbbr = 'COL';
      desc = 'Exemplary command. 80%+ of dust forces completely routed.';
    } else if (pct >= 60) {
      rankTitle = 'MAJOR OF BATTALION';
      rankAbbr = 'MAJ';
      desc = 'Solid strategic offensive across all core quarters.';
    } else if (pct >= 40) {
      rankTitle = 'CAPTAIN OF THE GUARD';
      rankAbbr = 'CPT';
      desc = 'Formidable sweep. Crucial high-traffic sectors reclaimed.';
    } else if (pct >= 20) {
      rankTitle = 'FIRST LIEUTENANT';
      rankAbbr = '1LT';
      desc = 'Initial sector secured, defensive lines holding.';
    }

    return {
      tierName: 'MAIN QUEST (SUPREME TIER)',
      rankTitle,
      rankAbbr,
      completionPercent: pct,
      statusBadge: pct === 100 ? 'MISSION ACCOMPLISHED' : `${pct}% COMPLETED`,
      isSpeedrun: false,
      isSuccess: pct >= 50,
      isOvertime: false,
      certificateTitle: 'Cleanquest certificate',
      certificateSubtitle: 'Mission accomplished',
      description: desc,
    };
  }

  // Tier 2: Boss Fights (Special tier - Special Operations)
  if (difficulty === 'deep') {
    let rankTitle = 'SPECIAL OPS RECRUIT';
    let rankAbbr = 'SOR';
    let desc = 'Engaged the boss encounter and survived the initial shockwave.';

    if (pct === 100) {
      rankTitle = 'SPECIAL OPS APEX COMMANDER';
      rankAbbr = 'APEX';
      desc = 'The epic boss was totally pulverized and sanitized down to the molecular level!';
    } else if (pct >= 80) {
      rankTitle = 'STRIKE FORCE CHIEF';
      rankAbbr = 'SFC';
      desc = 'Critical structural boss grime neutralized with heavy tactical force.';
    } else if (pct >= 60) {
      rankTitle = 'HEAVY VANGUARD CAPTAIN';
      rankAbbr = 'HVC';
      desc = 'Major boss defenses stripped through tenacious scrubbing.';
    } else if (pct >= 40) {
      rankTitle = 'COMBAT SPECIALIST';
      rankAbbr = 'CS';
      desc = 'Significant breakthrough against deeply entrenched grease and grime.';
    } else if (pct >= 20) {
      rankTitle = 'SHOCK TROOPER';
      rankAbbr = 'ST';
      desc = 'Breached boss territory and cleared first defensive layers.';
    }

    return {
      tierName: 'BOSS FIGHT (SPECIAL OPS TIER)',
      rankTitle,
      rankAbbr,
      completionPercent: pct,
      statusBadge: pct === 100 ? 'MISSION ACCOMPLISHED' : `${pct}% COMPLETED`,
      isSpeedrun: false,
      isSuccess: pct >= 50,
      isOvertime: false,
      certificateTitle: 'Cleanquest certificate',
      certificateSubtitle: 'Mission accomplished',
      description: desc,
    };
  }

  // Tier 3: Side Quests (Different tier - Specialist Corps)
  if (difficulty === 'specific') {
    let rankTitle = 'RECON APPRENTICE';
    let rankAbbr = 'REC';
    let desc = 'Targeted side sector recon initiated.';

    if (pct === 100) {
      rankTitle = 'MASTER CHIEF SPECIALIST';
      rankAbbr = 'MCS';
      desc = 'Precision mastery! Specialized micro-zone purged to absolute perfection.';
    } else if (pct >= 80) {
      rankTitle = 'CHIEF WARRANT OFFICER';
      rankAbbr = 'CWO';
      desc = 'High-order execution on specialized target zones.';
    } else if (pct >= 60) {
      rankTitle = 'STAFF SERGEANT SPECIALIST';
      rankAbbr = 'SSG';
      desc = 'Niche chaos brought under firm operational discipline.';
    } else if (pct >= 40) {
      rankTitle = 'TECHNICAL SPECIALIST';
      rankAbbr = 'SPC';
      desc = 'Methodical cataloging and deep sanitization underway.';
    } else if (pct >= 20) {
      rankTitle = 'FIELD OPERATIVE';
      rankAbbr = 'OPR';
      desc = 'Initial side objectives successfully tackled.';
    }

    return {
      tierName: 'SIDE QUESTS (SPECIALIST TIER)',
      rankTitle,
      rankAbbr,
      completionPercent: pct,
      statusBadge: pct === 100 ? 'MISSION ACCOMPLISHED' : `${pct}% COMPLETED`,
      isSpeedrun: false,
      isSuccess: pct >= 50,
      isOvertime: false,
      certificateTitle: 'Cleanquest certificate',
      certificateSubtitle: 'Mission accomplished',
      description: desc,
    };
  }

  // Tier 4: Quick Mission / Daily Maintenance (Lesser than Main Quest - Patrol Tier)
  let rankTitle = 'RECRUIT';
  let rankAbbr = 'RCT';
  let desc = 'First step of daily hygiene discipline taken.';

  if (pct === 100) {
    rankTitle = 'FIRST SERGEANT';
    rankAbbr = '1SG';
    desc = 'Flawless daily maintenance sortie! Rapid reaction forces victorious.';
  } else if (pct >= 80) {
    rankTitle = 'SERGEANT OF PATROL';
    rankAbbr = 'SGT';
    desc = 'Swift patrol completed. Perimeter stabilized against dirt encroachment.';
  } else if (pct >= 60) {
    rankTitle = 'CORPORAL';
    rankAbbr = 'CPL';
    desc = 'Frontline clutter cleared with high turnaround speed.';
  } else if (pct >= 40) {
    rankTitle = 'PRIVATE FIRST CLASS';
    rankAbbr = 'PFC';
    desc = 'Vital hot spots refreshed and trash depots cleared.';
  } else if (pct >= 20) {
    rankTitle = 'PRIVATE';
    rankAbbr = 'PVT';
    desc = 'Initial maintenance motions conducted with discipline.';
  }

  return {
    tierName: 'DAILY MISSION (PATROL TIER)',
    rankTitle,
    rankAbbr,
    completionPercent: pct,
    statusBadge: pct === 100 ? 'MISSION ACCOMPLISHED' : `${pct}% COMPLETED`,
    isSpeedrun: false,
    isSuccess: pct >= 50,
    isOvertime: false,
    certificateTitle: 'Cleanquest certificate',
    certificateSubtitle: 'Mission accomplished',
    description: desc,
  };
}

/**
 * Calculates Pip's simulated robot cleaning progress (0 to 100)
 * Pip races against the user with pseudo-human jitter and acceleration!
 */
export function calculatePipProgress(
  elapsedSeconds: number,
  targetDurationSeconds: number,
  userCompletedCount: number,
  totalTasks: number
): { progress: number; statusText: string; isAhead: boolean } {
  if (targetDurationSeconds <= 0) targetDurationSeconds = 600;

  // Base progress from time: Pip aims to finish right around 90% of target duration
  const timeProgress = Math.min(100, Math.floor((elapsedSeconds / (targetDurationSeconds * 0.9)) * 100));
  
  // User progress
  const userRatio = totalTasks > 0 ? Math.floor((userCompletedCount / totalTasks) * 100) : 0;

  // Pip tries to stay competitive within 10-15% of user
  let pipProgress = Math.max(timeProgress, Math.min(95, userRatio + 5));
  if (elapsedSeconds < 10) pipProgress = Math.min(pipProgress, 8);
  if (pipProgress > 100) pipProgress = 100;

  let statusText = "Pip is calibrating vacuum lasers...";
  let isAhead = pipProgress > userRatio;

  if (pipProgress >= 100) {
    statusText = "Pip finished his sector! 'Did you get lost in the broom closet?'";
  } else if (isAhead) {
    statusText = `Pip is at ${pipProgress}%! 'My microfibers move faster than your WiFi!'`;
  } else if (pipProgress === userRatio) {
    statusText = `Pip is tied with you at ${pipProgress}%! 'Overclocking CPU now!'`;
  } else {
    statusText = `You're leading Pip (${userRatio}% vs ${pipProgress}%)! Pip: 'Improbable!'`;
  }

  return { progress: pipProgress, statusText, isAhead };
}

/**
 * Shuffles tasks for mystery mode, keeping completed ones visible at top
 * and revealing the next uncompleted task one-by-one.
 */
export function filterVisibleTasksForMystery(tasks: CleaningTask[]): CleaningTask[] {
  let firstPendingFound = false;
  return tasks.filter((task) => {
    if (task.completed) return true;
    if (!firstPendingFound) {
      firstPendingFound = true;
      return true; // Reveal only the next active uncompleted task
    }
    return false;
  });
}

/**
 * Restores or resets rare & seasonal chores back to defaults
 */
export function resetRareChores<T>(defaultChores: T[]): T[] {
  return JSON.parse(JSON.stringify(defaultChores));
}

/**
 * Creates a formatted log entry for a completed chore
 */
export function createChoreLogEntry(
  date: Date = new Date(),
  note?: string
): { id: string; isoDate: string; formattedDate: string; formattedTime: string; note?: string } {
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    id: `log-${date.getTime()}-${Math.random().toString(36).substring(2, 6)}`,
    isoDate: date.toISOString(),
    formattedDate,
    formattedTime,
    note,
  };
}

/**
 * Logs a new completion for a chore, updating lastCompleted and historyLogs (newest first)
 */
export function logChoreCompletion<T extends { lastCompleted?: string; historyLogs?: any[] }>(
  chore: T,
  date: Date = new Date(),
  note?: string
): T & { lastCompleted: string; historyLogs: ChoreLogEntry[] } {
  const newEntry = createChoreLogEntry(date, note);
  const updatedLogs = [newEntry, ...(chore.historyLogs || [])];
  return {
    ...chore,
    lastCompleted: `${newEntry.formattedDate} at ${newEntry.formattedTime}`,
    historyLogs: updatedLogs,
  };
}

/**
 * Removes a single history log entry from a chore and updates lastCompleted
 */
export function removeChoreLog<T extends { lastCompleted?: string; historyLogs?: any[] }>(
  chore: T,
  logId: string
): T & { lastCompleted: string; historyLogs: ChoreLogEntry[] } {
  const updatedLogs = (chore.historyLogs || []).filter((l) => l.id !== logId);
  const latestLog = updatedLogs[0];
  return {
    ...chore,
    lastCompleted: latestLog ? `${latestLog.formattedDate} at ${latestLog.formattedTime}` : 'Never',
    historyLogs: updatedLogs,
  };
}

/**
 * Returns ISO date string (YYYY-MM-DD) of the Monday for the week containing the given date
 */
export function getMondayOfCurrentWeek(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // In Monday-first week: Mon=1 -> diff 0, Tue=2 -> diff -1 ... Sun=0 -> diff -6
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

/**
 * Determines if weekly habit checkboxes should be refreshed back to unchecked
 * when transitioning into a new Monday.
 */
export function shouldResetWeeklyHabits(storedWeekMonday: string, currentMonday: string): boolean {
  if (!storedWeekMonday) return true;
  return storedWeekMonday !== currentMonday;
}

/**
 * 7 Days Habit Rewards tailored to each day's chore theme
 */
export const WEEKLY_DAY_REWARDS: DayReward[] = [
  {
    dayIndex: 0,
    dayLetter: 'M',
    dayName: 'Monday',
    taskTheme: 'Sanitizing Bathroom & Mirrors',
    rewardTitle: 'Sanctuary Spa & Aromatherapy Bath',
    rewardAdvice: 'Pamper yourself! Light a calming candle, pour soothing essential oils or epsom salts into the tub, and take a long, warm, restorative soak in your freshly sparkling bathroom sanctuary.',
    icon: '🛁',
  },
  {
    dayIndex: 1,
    dayLetter: 'T',
    dayName: 'Tuesday',
    taskTheme: 'High-Dusting & Surface Clear',
    rewardTitle: 'Sunlight & Fresh Air Lung Flush',
    rewardAdvice: 'Step outside into the sunlight and open air! Go for a mindful walk or sunbathe in the fresh breeze. It is healthy to breathe pure oxygen and soak in natural Vitamin D after wiping down dusty particles.',
    icon: '☀️',
  },
  {
    dayIndex: 2,
    dayLetter: 'W',
    dayName: 'Wednesday',
    taskTheme: 'Floor Vacuum & Damp Mopping',
    rewardTitle: 'Cozy Plush Sock Lounge & Warm Brew',
    rewardAdvice: 'Kick off your outdoor shoes! Slip into your softest, fluffiest socks or walk barefoot across your silky-clean floors, brew a warm cup of soothing tea or cocoa, and relax to retro synthwave beats.',
    icon: '🧦',
  },
  {
    dayIndex: 3,
    dayLetter: 'T',
    dayName: 'Thursday',
    taskTheme: 'Bed Linens & Towels Laundry',
    rewardTitle: '5-Star Hotel Bedtime Retreat',
    rewardAdvice: 'Total hotel luxury tonight! Slide between crisp, warm, fresh-scented sheets with your favorite book or comfort movie. Treat yourself to an extra hour of guilt-free, restorative deep sleep.',
    icon: '🛏️',
  },
  {
    dayIndex: 4,
    dayLetter: 'F',
    dayName: 'Friday',
    taskTheme: 'Kitchen Reset & Fridge Purge',
    rewardTitle: 'Guilt-Free Takeout or Smoothie Feast',
    rewardAdvice: 'The kitchen is officially closed! Order your favorite Friday takeout or blend a vibrant tropical smoothie. Zero pots or pans to scrub tonight—kick back and celebrate the clean weekend ahead!',
    icon: '🍕',
  },
  {
    dayIndex: 5,
    dayLetter: 'S',
    dayName: 'Saturday',
    taskTheme: 'Epic Boss Project Encounter',
    rewardTitle: 'Champion’s Pastry & Gaming Marathon',
    rewardAdvice: 'You conquered the toughest housekeeping enemy of the week! Treat yourself to a decadent pastry, dive into a gaming or movie marathon, or indulge in a creative hobby with zero chores hanging over you.',
    icon: '👑',
  },
  {
    dayIndex: 6,
    dayLetter: 'S',
    dayName: 'Sunday',
    taskTheme: 'Zen Plant Care & Gentle Reset',
    rewardTitle: 'Mindful Herbal Tea & Plant Gazing',
    rewardAdvice: 'Deep peaceful rest. Sip an aromatic chamomile tea, gaze at your happy green botanical companions thriving in their clean space, and feel proud of completing your 7-day hygiene rotation matrix!',
    icon: '🌿',
  },
];




