import { buildOutlinedMatrix } from './pixelGen';

export interface DecorationTier {
  id: string;
  name: string;
  cost: number;
  pixelSize: number;
  matrix: number[][];
  palette: Record<number, string>;
  colorPalette: Record<number, string>;
}

export interface DecorationLine {
  id: string;
  category: string;
  /** If set, the whole line stays hidden behind a lock until this character level. */
  unlockLevel?: number;
  tiers: DecorationTier[];
}

export const CATEGORIES = ['Housing', 'Comfort', 'Play', 'Nature', 'Wonders'] as const;

// Outline (1) is auto-derived by buildOutlinedMatrix. A handful of shared tone
// ids (2-5) cover every line here so palettes stay short and legible.
const MONO_PALETTE = { 1: '#141414', 2: '#f2f2f2', 3: '#a8a8a8', 4: '#c2c2c2', 5: '#7a7a7a' };

// ---- Shape generators -----------------------------------------------------
// Parametric silhouettes so a "line" of tiers (bigger + nicer materials each
// upgrade) can share one shape function instead of hand-authoring every grid.

function buildHouse(w: number, h: number, doorWFrac = 0.22): number[][] {
  const roofRows = Math.round(h * 0.5);
  const doorW = Math.max(3, Math.round(w * doorWFrac));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < roofRows) {
        const half = y + 1;
        const center = w / 2;
        return x >= center - half && x <= center - 1 + half ? 1 : 0;
      }
      if (x < 1 || x > w - 2) return 0;
      const doorStart = Math.round(w / 2 - doorW / 2);
      const doorTop = h - Math.round((h - roofRows) * 0.62);
      if (x >= doorStart && x < doorStart + doorW && y >= doorTop) return 0;
      return 1;
    },
    (x) => (x < w / 2 ? 2 : 3),
  );
}

function buildPerch(w: number, h: number): number[][] {
  const postW = Math.max(2, Math.round(w * 0.28));
  const postStart = Math.round(w / 2 - postW / 2);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y <= 1) return x >= 1 && x <= w - 2 ? 1 : 0;
      if (y === 2) return x >= postStart - 1 && x <= postStart + postW ? 1 : 0;
      if (y >= 3 && y <= h - 5) return x >= postStart && x < postStart + postW ? 1 : 0;
      if (y >= h - 4 && y <= h - 3) return x >= postStart - 3 && x <= postStart + postW + 2 ? 1 : 0;
      if (y >= h - 2) return x >= postStart - 5 && x <= postStart + postW + 4 ? 1 : 0;
      return 0;
    },
    (x) => (x < w / 2 ? 2 : 3),
  );
}

function buildBlockTower(w: number, h: number, rows: number): number[][] {
  const blockH = Math.floor(h / rows);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const row = Math.min(rows - 1, Math.floor(y / blockH));
      const inset = row % 2 === 0 ? 1 : Math.max(2, Math.round(w * 0.14));
      return x >= inset && x < w - inset ? row + 1 : 0;
    },
    (_x, _y, region) => (region % 2 === 0 ? 2 : 3),
  );
}

function buildTree(w: number, h: number, canopyFrac = 0.65): number[][] {
  const canopyH = Math.round(h * canopyFrac);
  const cx = w / 2;
  const trunkW = Math.max(2, Math.round(w * 0.16));
  const trunkStart = Math.round(cx - trunkW / 2);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < canopyH) {
        const midY = canopyH / 2;
        const distY = Math.abs(y - midY) / midY;
        const maxHalfWidth = cx - 1;
        const halfWidth = maxHalfWidth * Math.sqrt(Math.max(0, 1 - distY * distY));
        return Math.abs(x - cx + 0.5) <= halfWidth ? 1 : 0;
      }
      return x >= trunkStart && x < trunkStart + trunkW ? 2 : 0;
    },
    (x, _y, region) => (region === 2 ? 5 : x < cx ? 2 : 3),
  );
}

function buildPond(w: number, h: number, withFish = false): number[][] {
  const cx = w / 2;
  const cy = h / 2;
  const fishX = Math.round(cx + w * 0.15);
  const fishY = Math.round(cy);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const dx = (x - cx + 0.5) / (w / 2);
      const dy = (y - cy + 0.5) / (h / 2);
      if (dx * dx + dy * dy > 1) return 0;
      if (withFish && x === fishX && y === fishY) return 2;
      return 1;
    },
    (x, _y, region) => (region === 2 ? 5 : x < cx ? 3 : 4),
  );
}

function buildFountain(w: number, h: number, levels: number): number[][] {
  const rowsPerLevel = Math.floor(h / levels);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const levelFromBottom = levels - 1 - Math.min(levels - 1, Math.floor(y / rowsPerLevel));
      const inset = levelFromBottom * Math.max(1, Math.floor(w / (levels * 3)));
      return x >= inset && x < w - inset ? levelFromBottom + 1 : 0;
    },
    (_x, _y, region) => (region % 2 === 0 ? 2 : 3),
  );
}

// ---- Lines ------------------------------------------------------------

export const DECORATION_LINES: DecorationLine[] = [
  {
    id: 'doghouse',
    category: 'Housing',
    tiers: [
      {
        id: 'doghouse-1',
        name: 'Doghouse',
        cost: 15,
        pixelSize: 5,
        matrix: buildHouse(20, 16),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#241608', 2: '#c98a52', 3: '#8a5a30' },
      },
      {
        id: 'doghouse-2',
        name: 'Cottage',
        cost: 45,
        pixelSize: 5,
        matrix: buildHouse(27, 20),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2b1710', 2: '#e8c9a0', 3: '#c48a52' },
      },
      {
        id: 'doghouse-3',
        name: 'Mansion',
        cost: 140,
        pixelSize: 6,
        matrix: buildHouse(34, 24),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#fdf6e3', 3: '#e0c26a' },
      },
    ],
  },
  {
    id: 'perch',
    category: 'Comfort',
    tiers: [
      {
        id: 'perch-1',
        name: 'Perch',
        cost: 10,
        pixelSize: 5,
        matrix: buildPerch(14, 16),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#241608', 2: '#c98a52', 3: '#8a5a30' },
      },
      {
        id: 'perch-2',
        name: 'Tall Perch',
        cost: 35,
        pixelSize: 5,
        matrix: buildPerch(17, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 2: '#7fd1c3', 3: '#3fa393' },
      },
      {
        id: 'perch-3',
        name: 'Golden Perch',
        cost: 100,
        pixelSize: 6,
        matrix: buildPerch(20, 27),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#fdf1c4', 3: '#e0b23a' },
      },
    ],
  },
  {
    id: 'blocks',
    category: 'Play',
    tiers: [
      {
        id: 'blocks-1',
        name: 'Toy Blocks',
        cost: 8,
        pixelSize: 4,
        matrix: buildOutlinedMatrix(
          23,
          13,
          (x, y) => {
            if (x >= 0 && x <= 6 && y >= 6 && y <= 12) return 1;
            if (x >= 8 && x <= 14 && y >= 1 && y <= 7) return 2;
            if (x >= 16 && x <= 22 && y >= 5 && y <= 11) return 3;
            return 0;
          },
          (_x, y, region) => {
            const ranges: Record<number, [number, number]> = { 1: [6, 12], 2: [1, 7], 3: [5, 11] };
            const [top, bottom] = ranges[region];
            return region * 2 + (y <= (top + bottom) / 2 ? 0 : 1);
          },
        ),
        palette: { 1: '#141414', 2: '#f0f0f0', 3: '#9a9a9a', 4: '#f0f0f0', 5: '#9a9a9a', 6: '#f0f0f0', 7: '#9a9a9a' },
        colorPalette: { 1: '#141414', 2: '#ff8a80', 3: '#c94f45', 4: '#82b1ff', 5: '#3f6fb0', 6: '#fff176', 7: '#c9a227' },
      },
      {
        id: 'blocks-2',
        name: 'Block Tower',
        cost: 32,
        pixelSize: 5,
        matrix: buildBlockTower(16, 22, 5),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1a1a2e', 2: '#ff8a80', 3: '#c94f45' },
      },
      {
        id: 'blocks-3',
        name: 'Mega Block Castle',
        cost: 95,
        pixelSize: 5,
        matrix: buildBlockTower(22, 30, 7),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1a1a2e', 2: '#ffd54f', 3: '#ff8a65' },
      },
    ],
  },
  {
    id: 'tree',
    category: 'Nature',
    tiers: [
      {
        id: 'tree-1',
        name: 'Sapling',
        cost: 12,
        pixelSize: 5,
        matrix: buildTree(12, 14),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0d2b12', 2: '#8fd08a', 3: '#5fae5f', 5: '#8a5a30' },
      },
      {
        id: 'tree-2',
        name: 'Oak Tree',
        cost: 45,
        pixelSize: 5,
        matrix: buildTree(19, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0d2b12', 2: '#6fbf6a', 3: '#4a934a', 5: '#6b4423' },
      },
      {
        id: 'tree-3',
        name: 'Ancient Tree',
        cost: 130,
        pixelSize: 6,
        matrix: buildTree(27, 32),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0d1f0f', 2: '#4f9a52', 3: '#2f6b34', 5: '#4a2f1a' },
      },
    ],
  },
  {
    id: 'pond',
    category: 'Nature',
    tiers: [
      {
        id: 'pond-1',
        name: 'Puddle',
        cost: 10,
        pixelSize: 5,
        matrix: buildPond(10, 6),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 3: '#7fc7e8', 4: '#3f9bc4' },
      },
      {
        id: 'pond-2',
        name: 'Pond',
        cost: 40,
        pixelSize: 5,
        matrix: buildPond(18, 11),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 3: '#6fc1e6', 4: '#2f8bb8' },
      },
      {
        id: 'pond-3',
        name: 'Koi Pond',
        cost: 110,
        pixelSize: 6,
        matrix: buildPond(26, 15, true),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 3: '#6fc1e6', 4: '#2f8bb8', 5: '#ff8a3d' },
      },
    ],
  },
  {
    id: 'fountain',
    category: 'Wonders',
    unlockLevel: 3,
    tiers: [
      {
        id: 'fountain-1',
        name: 'Bird Bath',
        cost: 20,
        pixelSize: 5,
        matrix: buildFountain(10, 10, 2),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 2: '#bfe3f0', 3: '#6fb8d6' },
      },
      {
        id: 'fountain-2',
        name: 'Fountain',
        cost: 70,
        pixelSize: 6,
        matrix: buildFountain(16, 16, 3),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 2: '#a8d8ec', 3: '#4fa0c8' },
      },
      {
        id: 'fountain-3',
        name: 'Grand Fountain',
        cost: 200,
        pixelSize: 6,
        matrix: buildFountain(22, 22, 4),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 2: '#fde68a', 3: '#4fa0c8' },
      },
    ],
  },
];

export function getLine(lineId: string): DecorationLine | undefined {
  return DECORATION_LINES.find((l) => l.id === lineId);
}

export function getTier(lineId: string, tierIndex: number): DecorationTier | undefined {
  return getLine(lineId)?.tiers[tierIndex];
}
