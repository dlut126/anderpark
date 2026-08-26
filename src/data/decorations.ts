import { buildOutlinedMatrix } from './pixelGen';

export interface Decoration {
  id: string;
  name: string;
  cost: number;
  pixelSize: number;
  matrix: number[][];
  palette: Record<number, string>;
}

// Outline (1) is auto-derived by buildOutlinedMatrix; fill tones: 2 = light, 3 = mid/shadow.
const OUTLINE_PALETTE = { 1: '#141414', 2: '#f2f2f2', 3: '#a8a8a8' };

const DOGHOUSE_W = 20;
const DOGHOUSE_H = 16;
const DOGHOUSE_MATRIX = buildOutlinedMatrix(
  DOGHOUSE_W,
  DOGHOUSE_H,
  (x, y) => {
    if (y < 8) {
      // pitched roof, widening one row at a time toward the base
      const half = y + 1;
      return x >= 10 - half && x <= 9 + half ? 1 : 0;
    }
    // walls
    if (x < 2 || x > 16) return 0;
    // doorway cutout
    if (x >= 7 && x <= 10 && y >= 11 && y <= 15) return 0;
    return 1;
  },
  (x) => (x < 11 ? 2 : 3),
);

const PERCH_W = 14;
const PERCH_H = 16;
const PERCH_MATRIX = buildOutlinedMatrix(
  PERCH_W,
  PERCH_H,
  (x, y) => {
    if (y <= 1) return x >= 1 && x <= 12 ? 1 : 0; // crossbar
    if (y === 2) return x >= 4 && x <= 9 ? 1 : 0; // taper into the post
    if (y >= 3 && y <= 11) return x >= 5 && x <= 8 ? 1 : 0; // post
    if (y >= 12 && y <= 13) return x >= 2 && x <= 11 ? 1 : 0; // base flare
    if (y >= 14 && y <= 15) return x >= 0 && x <= 13 ? 1 : 0; // foot
    return 0;
  },
  (x) => (x < 8 ? 2 : 3),
);

const BLOCKS_W = 23;
const BLOCKS_H = 13;
const BLOCK_RANGES: Record<number, [number, number]> = { 1: [6, 12], 2: [1, 7], 3: [5, 11] };
const BLOCKS_MATRIX = buildOutlinedMatrix(
  BLOCKS_W,
  BLOCKS_H,
  (x, y) => {
    // small gaps between each cube so they read as separate blocks, not one fused shape
    if (x >= 0 && x <= 6 && y >= 6 && y <= 12) return 1; // back-left cube
    if (x >= 8 && x <= 14 && y >= 1 && y <= 7) return 2; // taller front cube
    if (x >= 16 && x <= 22 && y >= 5 && y <= 11) return 3; // back-right cube
    return 0;
  },
  (x, y, region) => {
    const [top, bottom] = BLOCK_RANGES[region];
    return y <= (top + bottom) / 2 ? 2 : 3;
  },
);

export const DECORATIONS: Decoration[] = [
  { id: 'doghouse', name: 'Doghouse', cost: 15, pixelSize: 5, matrix: DOGHOUSE_MATRIX, palette: OUTLINE_PALETTE },
  { id: 'perch', name: 'Perch', cost: 10, pixelSize: 5, matrix: PERCH_MATRIX, palette: OUTLINE_PALETTE },
  { id: 'blocks', name: 'Toy Blocks', cost: 8, pixelSize: 4, matrix: BLOCKS_MATRIX, palette: OUTLINE_PALETTE },
];

export function getDecoration(id: string): Decoration | undefined {
  return DECORATIONS.find((d) => d.id === id);
}
