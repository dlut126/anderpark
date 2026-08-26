import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HUNGER_DECAY_PER_MINUTE,
  HUNGER_PER_FEED,
  XP_PER_FEED,
  XP_PER_LEVEL,
  getSpecies,
} from '../data/species';
import { loadRoster, saveRoster } from '../data/storage';
import type { Pet } from '../types';

function applyHungerDecay(pet: Pet, now: number): Pet {
  const minutesElapsed = (now - pet.lastUpdatedAt) / 60_000;
  if (minutesElapsed <= 0) return pet;
  const hunger = Math.max(0, pet.hunger - minutesElapsed * HUNGER_DECAY_PER_MINUTE);
  return { ...pet, hunger, lastUpdatedAt: now };
}

export function useRoster() {
  const [roster, setRoster] = useState<Pet[]>(() =>
    loadRoster().map((pet) => applyHungerDecay(pet, Date.now())),
  );
  const [leveledUpPet, setLeveledUpPet] = useState<Pet | null>(null);
  const rosterRef = useRef(roster);
  rosterRef.current = roster;

  useEffect(() => {
    saveRoster(roster);
  }, [roster]);

  // Keep hunger bars ticking down in real time while the app is open.
  useEffect(() => {
    const interval = setInterval(() => {
      setRoster((prev) => prev.map((pet) => applyHungerDecay(pet, Date.now())));
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const addPet = useCallback((speciesId: string, nickname: string) => {
    const now = Date.now();
    const newPet: Pet = {
      id: crypto.randomUUID(),
      speciesId,
      nickname,
      level: 1,
      xp: 0,
      hunger: 80,
      foodInventory: 1,
      customTasks: [],
      taskLog: [],
      createdAt: now,
      lastUpdatedAt: now,
    };
    setRoster((prev) => [...prev, newPet]);
  }, []);

  const removePet = useCallback((petId: string) => {
    setRoster((prev) => prev.filter((p) => p.id !== petId));
  }, []);

  const completeTask = useCallback((petId: string, taskLabel: string, foodReward: number) => {
    setRoster((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        return {
          ...pet,
          foodInventory: pet.foodInventory + foodReward,
          taskLog: [
            { id: crypto.randomUUID(), taskLabel, foodEarned: foodReward, completedAt: Date.now() },
            ...pet.taskLog,
          ].slice(0, 50),
          lastUpdatedAt: Date.now(),
        };
      }),
    );
  }, []);

  const addCustomTask = useCallback((petId: string, label: string, foodReward: number) => {
    setRoster((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              customTasks: [
                ...pet.customTasks,
                { id: crypto.randomUUID(), label, foodReward },
              ],
            }
          : pet,
      ),
    );
  }, []);

  const feedPet = useCallback((petId: string) => {
    setRoster((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId || pet.foodInventory <= 0) return pet;

        let xp = pet.xp + XP_PER_FEED;
        let level = pet.level;
        let didLevelUp = false;
        if (xp >= XP_PER_LEVEL) {
          xp -= XP_PER_LEVEL;
          level += 1;
          didLevelUp = true;
        }

        const updated: Pet = {
          ...pet,
          foodInventory: pet.foodInventory - 1,
          hunger: Math.min(100, pet.hunger + HUNGER_PER_FEED),
          xp,
          level,
          lastUpdatedAt: Date.now(),
        };

        if (didLevelUp) {
          // Fire after this render pass so we don't setState-during-setState.
          queueMicrotask(() => setLeveledUpPet(updated));
        }

        return updated;
      }),
    );
  }, []);

  const dismissLevelUp = useCallback(() => setLeveledUpPet(null), []);

  return {
    roster,
    addPet,
    removePet,
    completeTask,
    addCustomTask,
    feedPet,
    leveledUpPet,
    dismissLevelUp,
    getSpeciesFor: (pet: Pet) => getSpecies(pet.speciesId),
  };
}
