import { useCallback, useEffect, useState } from 'react';
import { getLine } from '../data/decorations';

const STORAGE_KEY = 'anderpark-park';

interface DecorationPosition {
  left: number;
  bottom: number;
}

interface ParkState {
  coins: number;
  /** Number of tiers unlocked per line — 0 = not owned, 1 = tier 1 owned, etc. */
  ownedTierByLine: Record<string, number>;
  decorationPositions: Record<string, DecorationPosition>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultPosition(index: number): DecorationPosition {
  return { left: 14 + ((index * 27) % 70), bottom: 6 + ((index * 11) % 16) };
}

function loadPark(): ParkState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { coins: 0, ownedTierByLine: {}, decorationPositions: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<ParkState>;
    const ownedTierByLine = parsed.ownedTierByLine ?? {};
    const decorationPositions = { ...(parsed.decorationPositions ?? {}) };

    // Backfill positions for lines owned before per-item placement existed,
    // so they don't silently disappear from the park.
    Object.keys(ownedTierByLine).forEach((lineId, i) => {
      if (!decorationPositions[lineId]) decorationPositions[lineId] = defaultPosition(i);
    });

    return {
      coins: parsed.coins ?? 0,
      ownedTierByLine,
      decorationPositions,
    };
  } catch {
    return { coins: 0, ownedTierByLine: {}, decorationPositions: {} };
  }
}

export function usePark() {
  const [park, setPark] = useState<ParkState>(loadPark);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(park));
  }, [park]);

  const earnCoins = useCallback((amount: number) => {
    setPark((p) => ({ ...p, coins: p.coins + amount }));
  }, []);

  // Buys the next tier in a line — tier 1 if unowned, otherwise the upgrade
  // right above whatever's currently owned. Sequential by construction: you
  // can never skip a tier since the "next" one is always owned+1.
  const buyTier = useCallback((lineId: string) => {
    setPark((p) => {
      const line = getLine(lineId);
      if (!line) return p;
      const owned = p.ownedTierByLine[lineId] ?? 0;
      const nextTier = line.tiers[owned];
      if (!nextTier || p.coins < nextTier.cost) return p;

      const isFirstPurchase = owned === 0;
      const position = isFirstPurchase
        ? defaultPosition(Object.keys(p.ownedTierByLine).length)
        : p.decorationPositions[lineId];

      return {
        coins: p.coins - nextTier.cost,
        ownedTierByLine: { ...p.ownedTierByLine, [lineId]: owned + 1 },
        decorationPositions: { ...p.decorationPositions, [lineId]: position },
      };
    });
  }, []);

  const moveDecoration = useCallback((lineId: string, left: number, bottom: number) => {
    setPark((p) => ({
      ...p,
      decorationPositions: {
        ...p.decorationPositions,
        [lineId]: {
          left: clamp(left, 2, 96),
          bottom: clamp(bottom, 2, 94),
        },
      },
    }));
  }, []);

  return {
    coins: park.coins,
    ownedTierByLine: park.ownedTierByLine,
    decorationPositions: park.decorationPositions,
    earnCoins,
    buyTier,
    moveDecoration,
  };
}
