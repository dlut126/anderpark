import type { Character, NeedState, NeedType } from '../types';

// Vitality can move at most this many points per real hour, in either
// direction. A full 100->0 swing takes ~96 hours of the needs sitting at
// rock bottom the entire time — so death is never a surprise from one bad
// day, only from days of real abandonment. The flip side is symmetric:
// sustained excellent care raises vitality into Thriving just as slowly and
// deliberately.
export const VITALITY_DRIFT_PER_HOUR = 100 / 96;

export const THRIVING_THRESHOLD = 80;
export const HEALTHY_THRESHOLD = 50;
export const STRUGGLING_THRESHOLD = 20;
// Below STRUGGLING_THRESHOLD is Critical; vitality reaching 0 is death.

export type VitalityStage = 'thriving' | 'healthy' | 'struggling' | 'critical';

export function vitalityStage(vitality: number): VitalityStage {
  if (vitality >= THRIVING_THRESHOLD) return 'thriving';
  if (vitality >= HEALTHY_THRESHOLD) return 'healthy';
  if (vitality >= STRUGGLING_THRESHOLD) return 'struggling';
  return 'critical';
}

export function averageNeedLevel(needs: Partial<Record<NeedType, NeedState>>): number {
  const levels = Object.values(needs) as NeedState[];
  if (levels.length === 0) return 100;
  return levels.reduce((sum, n) => sum + n.level, 0) / levels.length;
}

export function driftVitality(vitality: number, targetLevel: number, hoursElapsed: number): number {
  if (hoursElapsed <= 0) return vitality;
  const maxDelta = VITALITY_DRIFT_PER_HOUR * hoursElapsed;
  const delta = Math.max(-maxDelta, Math.min(maxDelta, targetLevel - vitality));
  return Math.max(0, Math.min(100, vitality + delta));
}

// Thriving characters visibly do better — a real reward for sustained care,
// not just a label. Stacks with (multiplies) the Lucky Task bonus.
export function thrivingMultiplier(character: Pick<Character, 'vitality'>): number {
  return vitalityStage(character.vitality) === 'thriving' ? 1.1 : 1;
}

// Symmetric to thrivingMultiplier: sustained neglect has a real cost too, not
// just a label. A short grace period means a brief dip never costs anything —
// only staying below Healthy for a while does. A long streak is a real
// buffer against a bad patch, not just a badge, so it halves the rate.
export const STRUGGLE_GRACE_HOURS = 2;
export const STRUGGLE_DRAIN_COINS_PER_HOUR = 1;
export const STRUGGLE_DRAIN_XP_PER_HOUR = 0.5;
export const CRITICAL_DRAIN_MULTIPLIER = 2;
export const STREAK_MITIGATION_DAYS = 7;
export const STREAK_MITIGATION_FACTOR = 0.5;

export interface StruggleDrainResult {
  /** Carry this forward onto the character — null once Healthy+ again. */
  strugglingSince: number | null;
  drainedCoins: number;
  drainedXp: number;
}

function struggleRateMultiplier(stage: VitalityStage, streakCount: number): number {
  const stageMultiplier = stage === 'critical' ? CRITICAL_DRAIN_MULTIPLIER : 1;
  const streakMultiplier = streakCount >= STREAK_MITIGATION_DAYS ? STREAK_MITIGATION_FACTOR : 1;
  return stageMultiplier * streakMultiplier;
}

// Computes how much coins/XP should drain for the [lastUpdatedAt, now] window,
// given whichever continuous Struggling-or-worse streak was already tracked.
// Uses the vitality *at the end* of the window to decide the rate — same
// simplification the away-report already makes for which mood emoji to show.
export function computeStruggleDrain(
  strugglingSince: number | null,
  lastUpdatedAt: number,
  now: number,
  newVitality: number,
  streakCount: number,
): StruggleDrainResult {
  const stage = vitalityStage(newVitality);
  if (stage !== 'struggling' && stage !== 'critical') {
    return { strugglingSince: null, drainedCoins: 0, drainedXp: 0 };
  }

  // If we weren't already tracking a struggling streak, assume it started at
  // the beginning of this check window rather than trying to pinpoint the
  // exact crossing moment — simple, and errs toward the player's favor.
  const since = strugglingSince ?? lastUpdatedAt;
  const graceMs = STRUGGLE_GRACE_HOURS * 3_600_000;
  const drainableMsAt = (t: number) => Math.max(0, t - since - graceMs);
  const drainableHours = (drainableMsAt(now) - drainableMsAt(lastUpdatedAt)) / 3_600_000;

  if (drainableHours <= 0) {
    return { strugglingSince: since, drainedCoins: 0, drainedXp: 0 };
  }

  const rate = struggleRateMultiplier(stage, streakCount);
  return {
    strugglingSince: since,
    drainedCoins: drainableHours * STRUGGLE_DRAIN_COINS_PER_HOUR * rate,
    drainedXp: drainableHours * STRUGGLE_DRAIN_XP_PER_HOUR * rate,
  };
}

// For the live "you're losing X/hr" indicator — the steady-state rate once
// past the grace period, given the current stage and streak.
export function struggleDrainRatePerHour(stage: VitalityStage, streakCount: number): { coins: number; xp: number } {
  if (stage !== 'struggling' && stage !== 'critical') return { coins: 0, xp: 0 };
  const rate = struggleRateMultiplier(stage, streakCount);
  return { coins: STRUGGLE_DRAIN_COINS_PER_HOUR * rate, xp: STRUGGLE_DRAIN_XP_PER_HOUR * rate };
}
