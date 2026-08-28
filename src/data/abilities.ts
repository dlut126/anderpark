export interface Ability {
  id: string;
  name: string;
  level: number;
  emoji: string;
  description: string;
}

// Level-gated perks. "wonders-shop" is display-only here — its actual gating
// lives on the Wonders decoration line in decorations.ts — everything else
// is enforced where it's used (useCharacter's completeTask, the character
// edit form).
export const ABILITIES: Ability[] = [
  {
    id: 'wonders-shop',
    name: 'Wonders Shop',
    level: 3,
    emoji: '✨',
    description: 'Unlocks the Wonders category in the shop — fountains and beyond.',
  },
  {
    id: 'lucky-task',
    name: 'Lucky Task',
    level: 5,
    emoji: '🍀',
    description: "The first task you complete each day pays double.",
  },
  {
    id: 'edit-character',
    name: 'Reinvent Yourself',
    level: 7,
    emoji: '🎨',
    description: "Change your character's look and name anytime — no reset required.",
  },
];

export function hasAbility(level: number, abilityId: string): boolean {
  const ability = ABILITIES.find((a) => a.id === abilityId);
  return !!ability && level >= ability.level;
}
