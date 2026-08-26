import { useCallback, useEffect, useState } from 'react';
import { DECORATIONS } from '../data/decorations';

const STORAGE_KEY = 'anderpark-park';

interface DecorationPosition {
  left: number;
  bottom: number;
}

interface ParkState {
  coins: number;
  ownedDecorationIds: string[];
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
  if (!raw) return { coins: 0, ownedDecorationIds: [], decorationPositions: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<ParkState>;
    const ownedDecorationIds = parsed.ownedDecorationIds ?? [];
    const decorationPositions = { ...(parsed.decorationPositions ?? {}) };

    // Backfill positions for decorations owned before per-item placement existed,
    // so they don't silently disappear from the park.
    ownedDecorationIds.forEach((id, i) => {
      if (!decorationPositions[id]) decorationPositions[id] = defaultPosition(i);
    });

    return {
      coins: parsed.coins ?? 0,
      ownedDecorationIds,
      decorationPositions,
    };
  } catch {
    return { coins: 0, ownedDecorationIds: [], decorationPositions: {} };
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

  const buyDecoration = useCallback((id: string) => {
    setPark((p) => {
      const deco = DECORATIONS.find((d) => d.id === id);
      if (!deco || p.ownedDecorationIds.includes(id) || p.coins < deco.cost) return p;
      const count = p.ownedDecorationIds.length;
      return {
        coins: p.coins - deco.cost,
        ownedDecorationIds: [...p.ownedDecorationIds, id],
        decorationPositions: { ...p.decorationPositions, [id]: defaultPosition(count) },
      };
    });
  }, []);

  const moveDecoration = useCallback((id: string, left: number, bottom: number) => {
    setPark((p) => ({
      ...p,
      decorationPositions: {
        ...p.decorationPositions,
        [id]: { left: clamp(left, 2, 96), bottom: clamp(bottom, 2, 94) },
      },
    }));
  }, []);

  return {
    coins: park.coins,
    ownedDecorationIds: park.ownedDecorationIds,
    decorationPositions: park.decorationPositions,
    earnCoins,
    buyDecoration,
    moveDecoration,
  };
}
