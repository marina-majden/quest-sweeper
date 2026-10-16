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




