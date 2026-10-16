export type DifficultyType = 'maintenance' | 'standard' | 'deep' | 'specific';

export type BossType = 'oven' | 'drainage' | 'grout' | 'fridge' | 'baseboards';

export type SpecificZoneType = 'plants' | 'socks' | 'spices' | 'charity' | 'appliances' | 'bedding' | 'drapery';

export type CompanionType = 'sponge' | 'robot' | 'bunny';

export type GameModeType = 'standard' | 'shuffle' | 'speedrun';

export type TaskType = 'wipe' | 'vacuum' | 'dust' | 'laundry' | 'organize' | 'scrub';

export interface MicroStep {
  id: string;
  title: string;
  completed: boolean;
  points: number;
}

export interface CleaningTask {
  id: string;
  title: string;
  desc: string;
  type: TaskType;
  points: number;
  completed: boolean;
  showMicro?: boolean;
  microSteps: MicroStep[];
  isBoss?: boolean;
  isOptionalBonus?: boolean;
  proTip?: string;
  bossPhase?: number;
}

export interface HighscoreEntry {
  id: string;
  name: string;
  score: number;
  difficulty: DifficultyType;
  mode: GameModeType;
  companion: CompanionType;
  date: string;
  timeSeconds: number;
  rank: 'S' | 'A' | 'B' | 'C';
  questName: string;
}

export interface ChoreLogEntry {
  id: string;
  isoDate: string;
  formattedDate: string;
  formattedTime: string;
  note?: string;
}

export interface RitualTask {
  id: string;
  title: string;
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday ...
  frequencyDays?: number;
  lastCompleted?: string;
  completedToday?: boolean;
  points: number;
  notes?: string;
  historyLogs?: ChoreLogEntry[];
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface WeeklyHabitState {
  weekMondayDate: string; // ISO date YYYY-MM-DD of Monday for the active week
  completedDays: boolean[]; // Array of 7 booleans for [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export interface DayReward {
  dayIndex: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  dayLetter: 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S';
  dayName: string;
  taskTheme: string;
  rewardTitle: string;
  rewardAdvice: string;
  icon: string;
}

