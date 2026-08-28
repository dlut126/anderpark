export type NeedType = 'food' | 'water' | 'shelter' | 'weather' | 'rest' | 'health';

export interface NeedDefinition {
  id: NeedType;
  label: string;
  needyLabel: string;
  emoji: string;
  blurb: string;
  decayPerMinute: number;
}

export interface GoalTask {
  id: string;
  label: string;
  restoreAmount: number;
}

export interface Goal {
  needType: NeedType;
  title: string;
  tasks: GoalTask[];
}

export interface NeedState {
  level: number;
  lastUpdatedAt: number;
}

export interface TaskLogEntry {
  id: string;
  needType: NeedType;
  taskLabel: string;
  /** What the user says they actually did — required at completion, for real accountability. */
  note: string;
  restored: number;
  completedAt: number;
}

export interface Streak {
  count: number;
  longest: number;
  /** YYYY-MM-DD local date of the last day a task was completed, '' if never. */
  lastActiveDay: string;
}

export interface Character {
  id: string;
  nickname: string;
  appearanceId: string;
  level: number;
  xp: number;
  needs: Partial<Record<NeedType, NeedState>>;
  goals: Partial<Record<NeedType, Goal>>;
  taskLog: TaskLogEntry[];
  streak: Streak;
  /** Slow-moving aggregate wellbeing (0-100) — drifts toward the needs' average over time, capped per hour. Hitting 0 is death. */
  vitality: number;
  /** Timestamp the current continuous Struggling-or-worse streak began, or null when Healthy+. Drives the grace period before coins/XP start draining. */
  strugglingSince: number | null;
  createdAt: number;
  lastUpdatedAt: number;
}
