import beaverImg from '../assets/pets/beaver.png';
import octopusImg from '../assets/pets/octopus.png';
import owlImg from '../assets/pets/owl.png';

export interface AppearanceOption {
  id: string;
  name: string;
  image: string;
  tagline: string;
  // CSS filter applied to the (grayscale) art in color mode — a tint, not real
  // recolored artwork, since we don't have a way to regenerate the source PNGs.
  colorFilter: string;
}

// Purely cosmetic — picked once at character creation, unrelated to needs/goals.
export const APPEARANCES: AppearanceOption[] = [
  {
    id: 'octopus',
    name: 'Octopus',
    image: octopusImg,
    tagline: 'Juggles a dozen things without dropping one.',
    colorFilter: 'sepia(1) saturate(4) hue-rotate(165deg) brightness(0.95)',
  },
  {
    id: 'beaver',
    name: 'Beaver',
    image: beaverImg,
    tagline: 'Always building something.',
    colorFilter: 'sepia(1) saturate(3) hue-rotate(-10deg) brightness(0.95)',
  },
  {
    id: 'owl',
    name: 'Owl',
    image: owlImg,
    tagline: 'Never skips the reading.',
    colorFilter: 'sepia(1) saturate(3) hue-rotate(20deg) brightness(1)',
  },
];

export function getAppearance(id: string): AppearanceOption {
  const appearance = APPEARANCES.find((a) => a.id === id);
  if (!appearance) throw new Error(`Unknown appearance: ${id}`);
  return appearance;
}
