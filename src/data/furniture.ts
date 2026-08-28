import { buildOutlinedMatrix } from './pixelGen';

export interface FurnitureItem {
  id: string;
  name: string;
  cost: number;
  pixelSize: number;
  matrix: number[][];
  palette: Record<number, string>;
  colorPalette: Record<number, string>;
}

const MONO = { 1: '#141414', 2: '#f2f2f2', 3: '#a8a8a8', 4: '#c2c2c2', 5: '#7a7a7a' };

function buildRug(w: number, h: number): number[][] {
  return buildOutlinedMatrix(w, h, (x, y) => (y >= 1 && y < h - 1 && x >= 1 && x < w - 1 ? 1 : 0), (x) =>
    x % 3 === 0 ? 3 : 2,
  );
}

function buildBookshelf(w: number, h: number): number[][] {
  const shelfEvery = Math.max(2, Math.round(h / 4));
  return buildOutlinedMatrix(
    w,
    h,
    () => 1,
    (_x, y) => (Math.floor(y / shelfEvery) % 2 === 0 ? 2 : 3),
  );
}

function buildLamp(w: number, h: number): number[][] {
  const shadeH = Math.round(h * 0.3);
  const postW = Math.max(1, Math.round(w * 0.14));
  const postStart = Math.round(w / 2 - postW / 2);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < shadeH) {
        const t = y / shadeH;
        const halfW = (w / 2) * (0.4 + 0.6 * t);
        return Math.abs(x - w / 2 + 0.5) <= halfW ? 1 : 0;
      }
      if (y >= h - 2) return x >= postStart - 2 && x <= postStart + postW + 1 ? 2 : 0;
      return x >= postStart && x < postStart + postW ? 2 : 0;
    },
    (_x, _y, region) => (region === 1 ? 4 : 5),
  );
}

function buildSideTable(w: number, h: number): number[][] {
  const topH = Math.max(2, Math.round(h * 0.2));
  const legW = Math.max(1, Math.round(w * 0.12));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < topH) return 1;
      if (x < legW || x >= w - legW) return 2;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 3 : 5),
  );
}

function buildSofa(w: number, h: number): number[][] {
  const armW = Math.max(2, Math.round(w * 0.14));
  const backH = Math.round(h * 0.55);
  const seatTop = Math.round(h * 0.45);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (x < armW || x >= w - armW) return y >= Math.round(h * 0.15) ? 2 : 0;
      if (y < backH * 0.3) return 0;
      if (y < seatTop) return 1;
      return 2;
    },
    (_x, _y, region) => (region === 1 ? 3 : 4),
  );
}

function buildPlant(w: number, h: number): number[][] {
  const potH = Math.round(h * 0.3);
  const cx = w / 2;
  const canopyH = h - potH;
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y >= h - potH) return x >= 1 && x <= w - 2 ? 2 : 0;
      const midY = canopyH / 2;
      const distY = Math.abs(y - midY) / midY;
      const halfWidth = (w / 2 - 1) * Math.sqrt(Math.max(0, 1 - distY * distY));
      return Math.abs(x - cx + 0.5) <= halfWidth ? 1 : 0;
    },
    (_x, _y, region) => (region === 1 ? 4 : 5),
  );
}

export const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'rug',
    name: 'Rug',
    cost: 15,
    pixelSize: 6,
    matrix: buildRug(16, 8),
    palette: MONO,
    colorPalette: { 1: '#141414', 2: '#c94f45', 3: '#e0a03a' },
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    cost: 30,
    pixelSize: 6,
    matrix: buildBookshelf(10, 20),
    palette: MONO,
    colorPalette: { 1: '#141414', 2: '#8a5a30', 3: '#c98a52' },
  },
  {
    id: 'lamp',
    name: 'Lamp',
    cost: 18,
    pixelSize: 6,
    matrix: buildLamp(10, 18),
    palette: MONO,
    colorPalette: { 1: '#141414', 4: '#fdf1c4', 5: '#5a5a5a' },
  },
  {
    id: 'side-table',
    name: 'Side Table',
    cost: 20,
    pixelSize: 6,
    matrix: buildSideTable(14, 12),
    palette: MONO,
    colorPalette: { 1: '#141414', 3: '#c98a52', 5: '#8a5a30' },
  },
  {
    id: 'sofa',
    name: 'Sofa',
    cost: 45,
    pixelSize: 6,
    matrix: buildSofa(22, 14),
    palette: MONO,
    colorPalette: { 1: '#141414', 3: '#5f8ac9', 4: '#3f6aa8' },
  },
  {
    id: 'plant',
    name: 'Potted Plant',
    cost: 16,
    pixelSize: 6,
    matrix: buildPlant(12, 16),
    palette: MONO,
    colorPalette: { 1: '#141414', 4: '#5fae5f', 5: '#8a5a30' },
  },
];

export function getFurniture(id: string): FurnitureItem | undefined {
  return FURNITURE_ITEMS.find((f) => f.id === id);
}
