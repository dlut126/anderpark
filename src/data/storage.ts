import type { Pet } from '../types';

const STORAGE_KEY = 'anderpark-roster';

export function loadRoster(): Pet[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Pet[];
  } catch {
    return [];
  }
}

export function saveRoster(roster: Pet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
}
