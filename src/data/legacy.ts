import type { Character } from '../types';

export interface LegacyEntry {
  id: string;
  nickname: string;
  appearanceId: string;
  level: number;
  daysAlive: number;
  diedAt: number;
}

const STORAGE_KEY = 'anderpark-legacy';

export function loadLegacy(): LegacyEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LegacyEntry[];
  } catch {
    return [];
  }
}

// Called the moment a character's vitality hits 0 — keeps a small memorial
// record so a lost character isn't erased without a trace.
export function recordLegacyEntry(character: Character): LegacyEntry {
  const entry: LegacyEntry = {
    id: crypto.randomUUID(),
    nickname: character.nickname,
    appearanceId: character.appearanceId,
    level: character.level,
    daysAlive: Math.max(0, Math.round((character.lastUpdatedAt - character.createdAt) / 86_400_000)),
    diedAt: Date.now(),
  };
  const all = [entry, ...loadLegacy()].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return entry;
}
