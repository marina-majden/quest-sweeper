import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTaskPoints,
  calculateSpeedrunBonus,
  calculateRank,
  calculatePipProgress,
  filterVisibleTasksForMystery,
  resetRareChores,
  createChoreLogEntry,
  logChoreCompletion,
  removeChoreLog,
  getMondayOfCurrentWeek,
  shouldResetWeeklyHabits,
  WEEKLY_DAY_REWARDS,
} from './cleaningLogic.ts';

import type { CleaningTask, ChoreLogEntry, RitualTask } from '../types/index.ts';

test('calculateTaskPoints handles standard tasks and boss encounters', () => {
  assert.equal(calculateTaskPoints(false, 3), 300);
  assert.equal(calculateTaskPoints(false, 0), 500);
  // Boss multiplier
  assert.equal(calculateTaskPoints(true, 4), 1000 + 4 * 150);
});

test('calculateSpeedrunBonus rewards rapid completion and penalizes timeouts', () => {
  const win = calculateSpeedrunBonus(true, 120, 600);
  assert.equal(win.isPenalty, false);
  assert.equal(win.bonus, 1500 + 120 * 12);

  const timeout = calculateSpeedrunBonus(false, 0, 600);
  assert.equal(timeout.isPenalty, true);
  assert.equal(timeout.bonus, -1500);

  const neutral = calculateSpeedrunBonus(false, 50, 600);
  assert.equal(neutral.bonus, 0);
});

test('calculateRank properly ranks performance', () => {
  assert.equal(calculateRank(4500, 5, 5, true), 'S');
  assert.equal(calculateRank(2600, 4, 5, false), 'A');
  assert.equal(calculateRank(1600, 3, 5, false), 'B');
  assert.equal(calculateRank(400, 1, 5, false), 'C');
});

test('calculatePipProgress simulates competitive robot rival', () => {
  const initial = calculatePipProgress(2, 600, 0, 5);
  assert.ok(initial.progress <= 10);
  assert.ok(initial.statusText.length > 0);

  const midRace = calculatePipProgress(300, 600, 3, 5);
  assert.ok(midRace.progress >= 50);

  const finished = calculatePipProgress(600, 600, 5, 5);
  assert.equal(finished.progress, 100);
  assert.match(finished.statusText, /Pip finished/);
});

test('filterVisibleTasksForMystery reveals completed tasks and only the next pending task', () => {
  const mockTasks: CleaningTask[] = [
    { id: '1', title: 'Task 1', desc: '', type: 'wipe', points: 100, completed: true, microSteps: [] },
    { id: '2', title: 'Task 2', desc: '', type: 'wipe', points: 100, completed: false, microSteps: [] },
    { id: '3', title: 'Task 3', desc: '', type: 'wipe', points: 100, completed: false, microSteps: [] },
    { id: '4', title: 'Task 4', desc: '', type: 'wipe', points: 100, completed: false, microSteps: [] },
  ];

  const visible = filterVisibleTasksForMystery(mockTasks);
  // Should show Task 1 (completed) and Task 2 (first pending), hiding Tasks 3 and 4
  assert.equal(visible.length, 2);
  assert.equal(visible[0].id, '1');
  assert.equal(visible[1].id, '2');
});

test('resetRareChores creates a deep clone of default chores for restoration', () => {
  const defaults = [
    { id: '1', title: 'Default Chore 1' },
    { id: '2', title: 'Default Chore 2' }
  ];
  const restored = resetRareChores(defaults);
  assert.equal(restored.length, 2);
  assert.deepEqual(restored, defaults);
  // Mutating restored should not affect defaults
  restored[0].title = 'Changed';
  assert.equal(defaults[0].title, 'Default Chore 1');
});

test('logChoreCompletion prepends new timestamp log entry and updates lastCompleted', () => {
  const chore: RitualTask = {
    id: 'rc-1',
    title: 'Clean Dryer Vent',
    category: 'monthly',
    points: 300,
    lastCompleted: 'Never',
    historyLogs: [] as ChoreLogEntry[],
  };
  const testDate = new Date('2026-10-16T15:30:00Z');
  const updated = logChoreCompletion(chore, testDate, 'Vacuumed 10ft tube');


  assert.equal(updated.historyLogs.length, 1);
  assert.ok(updated.historyLogs[0].formattedDate.length > 0);
  assert.ok(updated.historyLogs[0].formattedTime.length > 0);
  assert.equal(updated.historyLogs[0].note, 'Vacuumed 10ft tube');
  assert.match(updated.lastCompleted, /at/);

  // Add a second log
  const laterDate = new Date('2026-11-20T10:00:00Z');
  const secondUpdate = logChoreCompletion(updated, laterDate);
  assert.equal(secondUpdate.historyLogs.length, 2);
  // Most recent log should be first
  assert.equal(secondUpdate.historyLogs[0].isoDate, laterDate.toISOString());

  // Test removing a log
  const afterRemoval = removeChoreLog(secondUpdate, secondUpdate.historyLogs[0].id);
  assert.equal(afterRemoval.historyLogs.length, 1);
  assert.equal(afterRemoval.historyLogs[0].isoDate, testDate.toISOString());
});

test('getMondayOfCurrentWeek returns ISO Monday date string', () => {
  // 2026-10-15 is Thursday -> Monday is 2026-10-12
  const thu = new Date('2026-10-15T12:00:00Z');
  assert.equal(getMondayOfCurrentWeek(thu), '2026-10-12');

  // 2026-10-18 is Sunday -> Monday is 2026-10-12
  const sun = new Date('2026-10-18T12:00:00Z');
  assert.equal(getMondayOfCurrentWeek(sun), '2026-10-12');

  // 2026-10-19 is Monday -> Monday is 2026-10-19
  const nextMon = new Date('2026-10-19T08:00:00Z');
  assert.equal(getMondayOfCurrentWeek(nextMon), '2026-10-19');
});

test('shouldResetWeeklyHabits detects transition to new week', () => {
  assert.equal(shouldResetWeeklyHabits('2026-10-12', '2026-10-12'), false);
  assert.equal(shouldResetWeeklyHabits('2026-10-12', '2026-10-19'), true);
  assert.equal(shouldResetWeeklyHabits('', '2026-10-12'), true);
});

test('WEEKLY_DAY_REWARDS contains 7 distinct daily self-care rewards', () => {
  assert.equal(WEEKLY_DAY_REWARDS.length, 7);
  const letters = WEEKLY_DAY_REWARDS.map(r => r.dayLetter).join('');
  assert.equal(letters, 'MTWTFSS');
  assert.ok(WEEKLY_DAY_REWARDS[0].rewardAdvice.includes('bath'));
  assert.ok(WEEKLY_DAY_REWARDS[1].rewardAdvice.includes('air'));
});



