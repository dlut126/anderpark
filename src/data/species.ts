import beaverImg from '../assets/pets/beaver.png';
import octopusImg from '../assets/pets/octopus.png';
import owlImg from '../assets/pets/owl.png';
import type { Species } from '../types';

// Placeholder personas/goals — swap these out once real pet details are ready.
// Everything a pet needs (name, goal, tasks, food) lives here in one place.
export const SPECIES: Species[] = [
  {
    id: 'octopus',
    name: 'Octopus',
    image: octopusImg,
    tagline: 'Juggles a dozen things without dropping one.',
    goalDescription: 'Stay on top of many small to-dos across all your classes.',
    foodName: 'Pearl',
    foodEmoji: '⚪',
    presetTasks: [
      { id: 'octopus-todo', label: 'Checked off a to-do item', foodReward: 1 },
      { id: 'octopus-inbox-zero', label: 'Cleared your inbox', foodReward: 3 },
    ],
    colorFilter: 'sepia(1) saturate(4) hue-rotate(165deg) brightness(0.95)',
  },
  {
    id: 'beaver',
    name: 'Beaver',
    image: beaverImg,
    tagline: 'Always building something.',
    goalDescription: 'Make steady progress on a project, case, or deliverable.',
    foodName: 'Wood Chip',
    foodEmoji: '🟤',
    presetTasks: [
      { id: 'beaver-deepwork', label: 'Completed a focused work session', foodReward: 2 },
      { id: 'beaver-milestone', label: 'Hit a project milestone', foodReward: 5 },
    ],
    colorFilter: 'sepia(1) saturate(3) hue-rotate(-10deg) brightness(0.95)',
  },
  {
    id: 'owl',
    name: 'Owl',
    image: owlImg,
    tagline: 'Never skips the reading.',
    goalDescription: 'Keep up with readings, case prep, and studying.',
    foodName: 'Acorn',
    foodEmoji: '🌰',
    presetTasks: [
      { id: 'owl-reading', label: 'Finished an assigned reading', foodReward: 2 },
      { id: 'owl-case-prep', label: 'Prepped a case cold-call ready', foodReward: 4 },
    ],
    colorFilter: 'sepia(1) saturate(3) hue-rotate(20deg) brightness(1)',
  },
];

export function getSpecies(id: string): Species {
  const species = SPECIES.find((s) => s.id === id);
  if (!species) throw new Error(`Unknown species: ${id}`);
  return species;
}

export const MAX_PETS = 6;
export const XP_PER_LEVEL = 100;
export const XP_PER_FEED = 10;
export const HUNGER_PER_FEED = 25;
export const HUNGER_DECAY_PER_MINUTE = 0.5;
