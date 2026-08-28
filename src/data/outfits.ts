export type OutfitSlot = 'head' | 'face' | 'neck' | 'back';

export interface OutfitItem {
  id: string;
  name: string;
  cost: number;
  unlockLevel?: number;
  slot: OutfitSlot;
}

// Simple cosmetic accessories layered on top of whichever appearance the
// character has — one size fits all three species, so these stay generic
// shapes (a hat, not "an octopus hat") rather than per-appearance art.
export const OUTFIT_ITEMS: OutfitItem[] = [
  { id: 'party-hat', name: 'Party Hat', cost: 25, slot: 'head' },
  { id: 'bow-tie', name: 'Bow Tie', cost: 20, slot: 'neck' },
  { id: 'sunglasses', name: 'Sunglasses', cost: 30, slot: 'face' },
  { id: 'scarf', name: 'Scarf', cost: 35, slot: 'neck' },
  { id: 'crown', name: 'Crown', cost: 90, unlockLevel: 4, slot: 'head' },
  { id: 'cape', name: 'Cape', cost: 120, unlockLevel: 6, slot: 'back' },
];

export function getOutfit(id: string): OutfitItem | undefined {
  return OUTFIT_ITEMS.find((o) => o.id === id);
}
