import type { Streak } from '../types';

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function isFirstCompletionToday(streak: Streak, now: Date): boolean {
  return streak.lastActiveDay !== dateKey(now);
}

// Extends the streak if today follows yesterday's activity (or starts one),
// no-ops if today was already counted. Call once per task completion.
export function advanceStreak(streak: Streak, now: Date): Streak {
  const today = dateKey(now);
  if (streak.lastActiveDay === today) return streak;
  const yesterday = dateKey(addDays(now, -1));
  const count = streak.lastActiveDay === yesterday ? streak.count + 1 : 1;
  return { count, longest: Math.max(streak.longest, count), lastActiveDay: today };
}

export interface StreakDisplay {
  count: number;
  /** Streak is alive but today hasn't been logged yet — it'll break if the day ends untouched. */
  atRisk: boolean;
  /** The persisted count is stale (from 2+ days ago) — effectively already broken. */
  broken: boolean;
}

// Pure display projection — doesn't mutate storage, so opening the app on a
// missed day doesn't silently reset anything until a task is actually done.
export function displayStreak(streak: Streak, now: Date): StreakDisplay {
  const today = dateKey(now);
  if (streak.lastActiveDay === today) return { count: streak.count, atRisk: false, broken: false };
  const yesterday = dateKey(addDays(now, -1));
  if (streak.lastActiveDay === yesterday) return { count: streak.count, atRisk: true, broken: false };
  return { count: 0, atRisk: false, broken: streak.count > 0 };
}
