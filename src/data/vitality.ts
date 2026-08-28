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
