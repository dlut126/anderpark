import type { NeedDefinition, NeedType } from '../types';

// The six things that keep a character alive. Each maps to one user-defined
// goal at setup — completing that goal's tasks restores this need directly.
export const NEED_DEFINITIONS: NeedDefinition[] = [
  { id: 'food', label: 'Food', needyLabel: 'Hungry', emoji: '🍖', blurb: 'Eating well', decayPerMinute: 0.5 },
  { id: 'water', label: 'Water', needyLabel: 'Thirsty', emoji: '💧', blurb: 'Staying hydrated', decayPerMinute: 0.5 },
  {
    id: 'shelter',
    label: 'Shelter',
    needyLabel: 'Exposed',
    emoji: '🏠',
    blurb: 'Keeping your space in order',
    decayPerMinute: 0.35,
  },
  {
    id: 'weather',
    label: 'Weather',
    needyLabel: 'Cold',
    emoji: '🌧️',
    blurb: 'Staying prepared',
    decayPerMinute: 0.35,
  },
  { id: 'rest', label: 'Rest', needyLabel: 'Tired', emoji: '😴', blurb: 'Sleep & downtime', decayPerMinute: 0.4 },
  {
    id: 'health',
    label: 'Health',
    needyLabel: 'Unwell',
    emoji: '❤️',
    blurb: 'Moving your body',
    decayPerMinute: 0.4,
  },
];

export function getNeedDefinition(id: NeedType): NeedDefinition {
  const def = NEED_DEFINITIONS.find((n) => n.id === id);
  if (!def) throw new Error(`Unknown need: ${id}`);
  return def;
}

export const XP_PER_LEVEL = 100;
export const HUNGRY_THRESHOLD = 35;
export const STARVING_THRESHOLD = 15;
