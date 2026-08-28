import type { Character } from '../types';

const STORAGE_KEY = 'anderpark-character';

export function loadCharacter(): Character | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Character;
  } catch {
    return null;
  }
}

export function saveCharacter(character: Character | null): void {
  if (!character) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
}
