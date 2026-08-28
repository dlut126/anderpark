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

export type InteractionAnim = 'bounce' | 'sway' | 'splash' | 'sleep' | 'sit' | 'spin';

export interface DecorationInteraction {
  /** Shown next to the character while it's using this item, e.g. "napping in the doghouse". */
  verb: string;
  emoji: string;
  anim: InteractionAnim;
  /** Small emoji that floats up from the character's head on a loop while using this — hearts, sweat, sparkles. */
  reaction: string;
}

export interface DecorationLine {
  id: string;
  category: string;
  /** If set, the whole line stays hidden behind a lock until this character level. */
  unlockLevel?: number;
  /** How the character behaves when it wanders over to use whichever tier of this is placed. */
  interaction: DecorationInteraction;
  tiers: DecorationTier[];
}

export const CATEGORIES = ['Housing', 'Comfort', 'Play', 'Nature', 'Wonders'] as const;

// You can own several separate instances of the same line at once (e.g. three
// ponds), each upgraded independently — capped so the park doesn't get
// unmanageably crowded.
export const MAX_INSTANCES_PER_LINE = 5;

// Outline (1) is auto-derived by buildOutlinedMatrix. A handful of shared tone
// ids (2-6) cover every line here so palettes stay short and legible.
const MONO_PALETTE = { 1: '#141414', 2: '#f2f2f2', 3: '#a8a8a8', 4: '#c2c2c2', 5: '#7a7a7a', 6: '#5a5a5a' };

// ---- Shape generators -----------------------------------------------------
// Parametric silhouettes so a "line" of tiers (bigger + nicer materials each
// upgrade) can share one shape function instead of hand-authoring every grid.

function buildHouse(
  w: number,
  h: number,
  opts: { doorWFrac?: number; windows?: boolean; chimney?: boolean } = {},
): number[][] {
  const { doorWFrac = 0.22, windows = false, chimney = false } = opts;
  const roofRows = Math.round(h * 0.5);
  const doorW = Math.max(3, Math.round(w * doorWFrac));
  const center = w / 2;
  const chimneyW = Math.max(2, Math.round(w * 0.09));
  const chimneyX = Math.round(w * 0.68);
  const winSize = Math.max(2, Math.round(w * 0.1));
  const winY = roofRows + Math.round((h - roofRows) * 0.18);
  const leftWinX = Math.round(w * 0.16);
  const rightWinX = Math.round(w * 0.84) - winSize;

  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const roofHalf = y + 1;
      const roofCoversHere = y < roofRows && x >= center - roofHalf && x <= center - 1 + roofHalf;

      if (chimney && y < roofRows && !roofCoversHere && x >= chimneyX && x < chimneyX + chimneyW) return 2;
      if (roofCoversHere) return 1;
      if (y < roofRows) return 0;
      if (x < 1 || x > w - 2) return 0;

      const doorStart = Math.round(center - doorW / 2);
      const doorTop = h - Math.round((h - roofRows) * 0.62);
      if (x >= doorStart && x < doorStart + doorW && y >= doorTop) return 0;

      if (windows && y >= winY && y < winY + winSize) {
        if (x >= leftWinX && x < leftWinX + winSize) return 3;
        if (x >= rightWinX && x < rightWinX + winSize) return 3;
      }
      return 1;
    },
    (x, _y, region) => {
      if (region === 2) return 5; // chimney
      if (region === 3) return 4; // window glow
      return x < center ? 2 : 3;
    },
  );
}

// A proper mansion silhouette instead of a scaled-up doghouse: a taller
// central gabled section with a chimney and grand entrance, flanked by two
// lower lean-to-roofed wings dotted with windows.
function buildMansion(w: number, h: number): number[][] {
  const centerW = Math.round(w * 0.44);
  const centerStart = Math.round((w - centerW) / 2);
  const cx = centerStart + centerW / 2;
  const centerRoofH = Math.round(h * 0.42);
  const wingTop = Math.round(h * 0.34);
  const wingRoofH = Math.max(2, Math.round(h * 0.18));
  const wallTopWing = wingTop + wingRoofH;
  const doorW = Math.max(3, Math.round(centerW * 0.3));
  const doorStart = centerStart + Math.round(centerW / 2 - doorW / 2);
  const doorTop = h - Math.round((h - centerRoofH) * 0.55);
  const winSize = Math.max(4, Math.round(w * 0.09));
  const chimneyW = Math.max(3, Math.round(w * 0.07));
  const chimneyX = centerStart + centerW - chimneyW - 1;
  const chimneyTop = Math.round(centerRoofH * 0.15);
  const winRowY = wallTopWing + Math.round((h - wallTopWing) * 0.22);
  const winXs = [
    centerStart + 2,
    centerStart + centerW - winSize - 2,
    Math.round(centerStart * 0.35),
    w - Math.round(centerStart * 0.35) - winSize,
  ];

  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const inCenter = x >= centerStart && x < centerStart + centerW;

      if (inCenter && y < centerRoofH) {
        // Chimney paints over the roof unconditionally within its own band,
        // so it stays one continuous strip from above the peak down into
        // the wall instead of vanishing wherever the roof happens to cover it.
        if (x >= chimneyX && x < chimneyX + chimneyW && y >= chimneyTop) return 4;
        const half = (y + 1) * (centerW / 2 / centerRoofH);
        if (x >= cx - half && x <= cx - 1 + half) return 1;
        return 0;
      }

      if (!inCenter && y >= wingTop && y < wallTopWing) {
        const distFromCenter = x < centerStart ? centerStart - x : x - (centerStart + centerW - 1);
        const roofLine = wingTop + Math.min(wingRoofH - 1, distFromCenter);
        return y >= roofLine ? 2 : 0;
      }

      const wallTop = inCenter ? centerRoofH : wallTopWing;
      if (y < wallTop) return 0;
      if (x < 1 || x > w - 2) return 0;

      if (inCenter && x >= doorStart && x < doorStart + doorW && y >= doorTop) return 0;

      if (y >= winRowY && y < winRowY + winSize) {
        for (const wx of winXs) {
          if (x >= wx && x < wx + winSize && !(inCenter && x >= doorStart - 1 && x < doorStart + doorW + 1)) {
            return 3;
          }
        }
      }

      return inCenter ? 1 : 2;
    },
    (_x, _y, region) => {
      if (region === 4) return 5; // chimney
      if (region === 3) return 6; // window glow
      return region === 1 ? 2 : 3;
    },
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

function buildTree(w: number, h: number, canopyFrac = 0.65, blossoms = false): number[][] {
  const canopyH = Math.round(h * canopyFrac);
  const cx = w / 2;
  const trunkW = Math.max(2, Math.round(w * 0.16));
  const trunkStart = Math.round(cx - trunkW / 2);
  // Deterministic scatter of blossom dots across the canopy, so re-renders stay stable.
  const blossomSpots = blossoms
    ? Array.from({ length: 6 }, (_, i) => ({
        x: Math.round(cx + Math.sin(i * 2.4) * (cx * 0.6)),
        y: Math.round(canopyH * (0.25 + 0.15 * (i % 3))),
      }))
    : [];
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < canopyH) {
        const midY = canopyH / 2;
        const distY = Math.abs(y - midY) / midY;
        const maxHalfWidth = cx - 1;
        const halfWidth = maxHalfWidth * Math.sqrt(Math.max(0, 1 - distY * distY));
        const inCanopy = Math.abs(x - cx + 0.5) <= halfWidth;
        if (!inCanopy) return 0;
        if (blossomSpots.some((b) => Math.abs(b.x - x) <= 1 && Math.abs(b.y - y) <= 1)) return 4;
        return 1;
      }
      return x >= trunkStart && x < trunkStart + trunkW ? 2 : 0;
    },
    (x, _y, region) => {
      if (region === 2) return 5;
      if (region === 4) return 6;
      return x < cx ? 2 : 3;
    },
  );
}

// `fishCount` scatters small two-tone koi around the pond's center — the
// bigger tiers actually show fish swimming instead of empty water.
function buildPond(w: number, h: number, fishCount = 0): number[][] {
  const cx = w / 2;
  const cy = h / 2;
  const fishSpots = Array.from({ length: fishCount }, (_, i) => {
    const angle = (i / Math.max(1, fishCount)) * Math.PI * 2 + 0.7;
    return {
      x: Math.round(cx + w * 0.2 * Math.cos(angle)),
      y: Math.round(cy + h * 0.2 * Math.sin(angle)),
      flip: i % 2 === 0,
    };
  });

  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const dx = (x - cx + 0.5) / (w / 2);
      const dy = (y - cy + 0.5) / (h / 2);
      if (dx * dx + dy * dy > 1) return 0;
      for (const fish of fishSpots) {
        const relX = fish.flip ? fish.x - x : x - fish.x;
        const relY = y - fish.y;
        if (relX >= 0 && relX <= 3 && Math.abs(relY) <= 1) return 2; // body
        if (relX >= -2 && relX < 0 && relY === 0) return 3; // tail
      }
      return 1;
    },
    (x, _y, region) => {
      if (region === 2) return 5; // koi body
      if (region === 3) return 6; // koi tail
      return x < cx ? 3 : 4; // water shading
    },
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

function buildTrampoline(w: number, h: number): number[][] {
  const cx = w / 2;
  const matH = Math.max(3, Math.round(h * 0.35));
  const legW = Math.max(2, Math.round(w * 0.08));
  const leftLegX = Math.round(w * 0.22);
  const rightLegX = Math.round(w * 0.78) - legW;
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < matH) {
        const dx = (x - cx + 0.5) / (w / 2);
        const dy = (y - matH / 2) / (matH / 2);
        return dx * dx * 0.9 + dy * dy * 3 <= 1 ? 1 : 0;
      }
      if (x >= leftLegX && x < leftLegX + legW) return 2;
      if (x >= rightLegX && x < rightLegX + legW) return 2;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 2 : 3),
  );
}

function buildHammock(w: number, h: number): number[][] {
  const postW = Math.max(2, Math.round(w * 0.09));
  const sagTop = Math.round(h * 0.3);
  const sagBottom = Math.round(h * 0.75);
  const clothH = Math.max(2, Math.round(h * 0.08));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (x < postW || x >= w - postW) return 2;
      const t = (x - postW) / (w - 2 * postW);
      const sagY = Math.round(sagTop + (sagBottom - sagTop) * 4 * t * (1 - t));
      if (y >= sagY && y <= sagY + clothH) return 1;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 3 : 5),
  );
}

function buildSwing(w: number, h: number): number[][] {
  const cx = w / 2;
  const beamY = Math.round(h * 0.12);
  const seatY = Math.round(h * 0.7);
  const chainOffset = Math.round(w * 0.16);
  const postW = Math.max(2, Math.round(w * 0.07));
  const leftChainX = Math.round(cx - chainOffset);
  const rightChainX = Math.round(cx + chainOffset);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y >= beamY - 1 && y <= beamY) return x >= 1 && x <= w - 2 ? 1 : 0;
      if (x < postW || x >= w - postW) return y >= beamY ? 2 : 0;
      if (y > beamY && y < seatY && (x === leftChainX || x === rightChainX)) return 3;
      if (y >= seatY && y <= seatY + 1 && x >= leftChainX - 1 && x <= rightChainX + 1) return 1;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 2 : 5),
  );
}

function buildCampfire(w: number, h: number): number[][] {
  const cx = w / 2;
  const logY = Math.round(h * 0.8);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y >= logY) return x >= 1 && x <= w - 2 ? 1 : 0;
      const flameFrac = (logY - y) / logY;
      const halfWidth = (w / 2 - 1) * Math.max(0, 1 - flameFrac * 1.15);
      return Math.abs(x - cx + 0.5) <= halfWidth ? 2 : 0;
    },
    (_x, _y, region) => (region === 1 ? 5 : 3),
  );
}

function buildPicnicTable(w: number, h: number): number[][] {
  const tableTopY = Math.round(h * 0.32);
  const legW = Math.max(2, Math.round(w * 0.08));
  const leftLegX = Math.round(w * 0.15);
  const rightLegX = Math.round(w * 0.85) - legW;
  const benchW = Math.round(w * 0.24);
  const benchY = tableTopY + Math.round(h * 0.32);
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y >= tableTopY && y < tableTopY + 3) return x >= 1 && x <= w - 2 ? 1 : 0;
      if (y >= tableTopY + 3 && y < h) {
        if (x >= leftLegX && x < leftLegX + legW) return 2;
        if (x >= rightLegX && x < rightLegX + legW) return 2;
        if (y >= benchY && y < benchY + 3) {
          if (x >= 0 && x < benchW) return 3;
          if (x >= w - benchW && x < w) return 3;
        }
      }
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 2 : region === 2 ? 5 : 3),
  );
}

function buildSandbox(w: number, h: number): number[][] {
  const rim = Math.max(2, Math.round(h * 0.15));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const isRimSide = x < rim || x >= w - rim;
      const isRimBottom = y >= h - rim;
      if (y < rim) return 0;
      if (isRimSide || isRimBottom) return 2;
      return 1;
    },
    (_x, _y, region) => (region === 1 ? 4 : 5),
  );
}

function buildStatue(w: number, h: number): number[][] {
  const baseH = Math.round(h * 0.22);
  const pedestalW = Math.round(w * 0.6);
  const pedestalStart = Math.round((w - pedestalW) / 2);
  const bodyW = Math.max(3, Math.round(w * 0.3));
  const bodyStart = Math.round(w / 2 - bodyW / 2);
  const headR = Math.max(2, Math.round(w * 0.14));
  const headCy = Math.round(h * 0.22);
  const cx = w / 2;
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y >= h - baseH) return x >= pedestalStart && x < pedestalStart + pedestalW ? 1 : 0;
      const dx = x - cx + 0.5;
      const dy = y - headCy;
      if (dx * dx + dy * dy <= headR * headR) return 2;
      // Body starts at the head's center, not its base, so the two always
      // overlap into one continuous silhouette regardless of head radius.
      if (y >= headCy && y < h - baseH && x >= bodyStart && x < bodyStart + bodyW) return 2;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 5 : 4),
  );
}

function buildBookshelf(w: number, h: number): number[][] {
  const shelfEvery = Math.max(2, Math.round(h / 5));
  return buildOutlinedMatrix(
    w,
    h,
    (x) => (x >= 1 && x <= w - 2 ? 1 : 0),
    (_x, y) => (Math.floor(y / shelfEvery) % 2 === 0 ? 2 : 3),
  );
}

function buildBathtub(w: number, h: number): number[][] {
  const rim = Math.max(2, Math.round(h * 0.2));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      const isRimSide = x < rim || x >= w - rim;
      const isRimBottom = y >= h - rim;
      if (y < rim) return 0;
      if (isRimSide || isRimBottom) return 2;
      return 1;
    },
    (_x, _y, region) => (region === 1 ? 4 : 5),
  );
}

function buildTelescope(w: number, h: number): number[][] {
  const legTop = Math.round(h * 0.55);
  const tubeW = Math.max(2, Math.round(w * 0.2));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < legTop) {
        const shift = Math.round((legTop - y) * 0.5);
        const tubeCx = Math.round(w * 0.5) - shift;
        return x >= tubeCx - tubeW / 2 && x <= tubeCx + tubeW / 2 ? 1 : 0;
      }
      const legW = Math.max(1, Math.round(w * 0.08));
      const spread = Math.round(w * 0.32);
      const cx = w / 2;
      if (Math.abs(x - cx) <= legW) return 2;
      if (Math.abs(x - (cx - spread)) <= legW && y > legTop + 2) return 2;
      if (Math.abs(x - (cx + spread)) <= legW && y > legTop + 2) return 2;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 5 : 3),
  );
}

function buildEasel(w: number, h: number): number[][] {
  const canvasH = Math.round(h * 0.6);
  const canvasW = Math.max(3, Math.round(w * 0.6));
  const cx = w / 2;
  const legW = Math.max(1, Math.round(w * 0.07));
  return buildOutlinedMatrix(
    w,
    h,
    (x, y) => {
      if (y < canvasH) return x >= cx - canvasW / 2 && x < cx + canvasW / 2 ? 1 : 0;
      const spread = Math.round((y - canvasH) * 0.4);
      if (Math.abs(x - (cx - spread - 2)) <= legW) return 2;
      if (Math.abs(x - (cx + spread + 2)) <= legW) return 2;
      return 0;
    },
    (_x, _y, region) => (region === 1 ? 2 : 5),
  );
}

// ---- Lines ------------------------------------------------------------

export const DECORATION_LINES: DecorationLine[] = [
  {
    id: 'doghouse',
    category: 'Housing',
    interaction: { verb: 'napping in the doghouse', emoji: '💤', anim: 'sleep' , reaction: '💤' },
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
        matrix: buildHouse(27, 20, { windows: true }),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2b1710', 2: '#e8c9a0', 3: '#c48a52', 4: '#ffe9a8' },
      },
      {
        id: 'doghouse-3',
        name: 'Mansion',
        cost: 140,
        pixelSize: 6,
        matrix: buildMansion(38, 26),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#fdf6e3', 3: '#e0c26a', 4: '#8a4a3a', 5: '#ffe9a8', 6: '#ffe9a8' },
      },
      {
        id: 'doghouse-4',
        name: 'Castle',
        cost: 350,
        pixelSize: 6,
        matrix: buildMansion(46, 32),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1c1c24', 2: '#d8dce3', 3: '#a8afc0', 4: '#4a4f5c', 5: '#e0c26a', 6: '#8fd6ff' },
      },
    ],
  },
  {
    id: 'perch',
    category: 'Comfort',
    interaction: { verb: 'resting on the perch', emoji: '🪶', anim: 'sit' , reaction: '😌' },
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
    interaction: { verb: 'playing with the blocks', emoji: '🧩', anim: 'bounce' , reaction: '😄' },
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
    interaction: { verb: 'lounging under the tree', emoji: '🍃', anim: 'sway' , reaction: '🍃' },
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
      {
        id: 'tree-4',
        name: 'Enchanted Tree',
        cost: 300,
        pixelSize: 6,
        matrix: buildTree(32, 38, 0.65, true),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0d1f0f', 2: '#5fb3ef', 3: '#3a7fb8', 5: '#4a2f1a', 6: '#ffe0f0' },
      },
    ],
  },
  {
    id: 'pond',
    category: 'Nature',
    interaction: { verb: 'splashing in the water', emoji: '💦', anim: 'splash' , reaction: '💦' },
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
        matrix: buildPond(26, 15, 2),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 3: '#6fc1e6', 4: '#2f8bb8', 5: '#ff8a3d', 6: '#f5f0e0' },
      },
      {
        id: 'pond-4',
        name: 'Coral Lagoon',
        cost: 320,
        pixelSize: 6,
        matrix: buildPond(34, 19, 3),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 3: '#4fd8c9', 4: '#1f8a9e', 5: '#ff8a3d', 6: '#f5f0e0' },
      },
    ],
  },
  {
    id: 'fountain',
    category: 'Wonders',
    unlockLevel: 3,
    interaction: { verb: 'gazing at the fountain', emoji: '✨', anim: 'splash' , reaction: '✨' },
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
  {
    id: 'trampoline',
    category: 'Play',
    interaction: { verb: 'bouncing on the trampoline', emoji: '🤸', anim: 'bounce' , reaction: '💦' },
    tiers: [
      {
        id: 'trampoline-1',
        name: 'Trampoline',
        cost: 18,
        pixelSize: 5,
        matrix: buildTrampoline(18, 12),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#241608', 2: '#4fd1e8', 3: '#1a1a2e' },
      },
      {
        id: 'trampoline-2',
        name: 'Bouncy Trampoline',
        cost: 55,
        pixelSize: 5,
        matrix: buildTrampoline(24, 15),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 2: '#5fe0a8', 3: '#1a1a2e' },
      },
      {
        id: 'trampoline-3',
        name: 'Mega Trampoline',
        cost: 150,
        pixelSize: 6,
        matrix: buildTrampoline(30, 18),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#ffd54f', 3: '#1a1a2e' },
      },
      {
        id: 'trampoline-4',
        name: 'Cosmic Trampoline',
        cost: 280,
        pixelSize: 6,
        matrix: buildTrampoline(36, 21),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1c1030', 2: '#d08aff', 3: '#2a1a4a' },
      },
    ],
  },
  {
    id: 'hammock',
    category: 'Comfort',
    interaction: { verb: 'lounging in the hammock', emoji: '😌', anim: 'sway' , reaction: '💕' },
    tiers: [
      {
        id: 'hammock-1',
        name: 'Hammock',
        cost: 14,
        pixelSize: 5,
        matrix: buildHammock(22, 14),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#241608', 3: '#e8c9a0', 5: '#8a5a30' },
      },
      {
        id: 'hammock-2',
        name: 'Woven Hammock',
        cost: 42,
        pixelSize: 5,
        matrix: buildHammock(28, 17),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 3: '#7fd1c3', 5: '#3fa393' },
      },
      {
        id: 'hammock-3',
        name: 'Silk Hammock',
        cost: 120,
        pixelSize: 6,
        matrix: buildHammock(34, 20),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 3: '#fdf1c4', 5: '#e0b23a' },
      },
    ],
  },
  {
    id: 'swing',
    category: 'Play',
    interaction: { verb: 'swinging around', emoji: '🎈', anim: 'spin' , reaction: '😆' },
    tiers: [
      {
        id: 'swing-1',
        name: 'Swing',
        cost: 22,
        pixelSize: 5,
        matrix: buildSwing(20, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1a1a2e', 2: '#c94f45', 5: '#8a5a30' },
      },
      {
        id: 'swing-2',
        name: 'Tire Swing',
        cost: 65,
        pixelSize: 5,
        matrix: buildSwing(25, 27),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1a1a2e', 2: '#82b1ff', 5: '#3f6fb0' },
      },
      {
        id: 'swing-3',
        name: 'Grand Swing Set',
        cost: 160,
        pixelSize: 6,
        matrix: buildSwing(30, 32),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#ff8a65', 5: '#c9a227' },
      },
    ],
  },
  {
    id: 'campfire',
    category: 'Nature',
    interaction: { verb: 'warming up by the fire', emoji: '🔥', anim: 'sit' , reaction: '😊' },
    tiers: [
      {
        id: 'campfire-1',
        name: 'Campfire',
        cost: 16,
        pixelSize: 5,
        matrix: buildCampfire(12, 12),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a1408', 3: '#ff8a3d', 5: '#6b4423' },
      },
      {
        id: 'campfire-2',
        name: 'Bonfire',
        cost: 48,
        pixelSize: 5,
        matrix: buildCampfire(17, 16),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a1408', 3: '#ffb03d', 5: '#4a2f1a' },
      },
      {
        id: 'campfire-3',
        name: 'Blazing Firepit',
        cost: 135,
        pixelSize: 6,
        matrix: buildCampfire(22, 20),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a1408', 3: '#ffd54f', 5: '#3a2410' },
      },
    ],
  },
  {
    id: 'picnic-table',
    category: 'Comfort',
    interaction: { verb: 'having a picnic', emoji: '🧺', anim: 'sit' , reaction: '💕' },
    tiers: [
      {
        id: 'picnic-table-1',
        name: 'Picnic Table',
        cost: 20,
        pixelSize: 5,
        matrix: buildPicnicTable(24, 16),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2b1710', 2: '#c98a52', 3: '#8a5a30', 5: '#5c3a1e' },
      },
      {
        id: 'picnic-table-2',
        name: 'Garden Table',
        cost: 60,
        pixelSize: 5,
        matrix: buildPicnicTable(30, 19),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 2: '#e8c9a0', 3: '#7fd1c3', 5: '#3fa393' },
      },
      {
        id: 'picnic-table-3',
        name: 'Vineyard Table',
        cost: 165,
        pixelSize: 6,
        matrix: buildPicnicTable(36, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#fdf1c4', 3: '#e0b23a', 5: '#8a5a30' },
      },
    ],
  },
  {
    id: 'sandbox',
    category: 'Play',
    interaction: { verb: 'digging in the sandbox', emoji: '🪣', anim: 'bounce' , reaction: '😄' },
    tiers: [
      {
        id: 'sandbox-1',
        name: 'Sandbox',
        cost: 12,
        pixelSize: 5,
        matrix: buildSandbox(20, 12),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#5c3a1e', 4: '#f0d9a0', 5: '#8a5a30' },
      },
      {
        id: 'sandbox-2',
        name: 'Play Pit',
        cost: 38,
        pixelSize: 5,
        matrix: buildSandbox(26, 15),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 4: '#f5e3ae', 5: '#3fa393' },
      },
      {
        id: 'sandbox-3',
        name: 'Beach Corner',
        cost: 105,
        pixelSize: 6,
        matrix: buildSandbox(32, 18),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 4: '#ffe9b0', 5: '#e0b23a' },
      },
    ],
  },
  {
    id: 'statue',
    category: 'Wonders',
    unlockLevel: 5,
    interaction: { verb: 'admiring the statue', emoji: '🗿', anim: 'sit' , reaction: '✨' },
    tiers: [
      {
        id: 'statue-1',
        name: 'Stone Statue',
        cost: 60,
        pixelSize: 5,
        matrix: buildStatue(14, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2a2a', 4: '#b0b0b0', 5: '#7a7a7a' },
      },
      {
        id: 'statue-2',
        name: 'Marble Statue',
        cost: 150,
        pixelSize: 6,
        matrix: buildStatue(17, 27),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2a2a', 4: '#f0eee8', 5: '#c9c4b8' },
      },
      {
        id: 'statue-3',
        name: 'Golden Statue',
        cost: 380,
        pixelSize: 6,
        matrix: buildStatue(20, 32),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 4: '#ffd54f', 5: '#c9a227' },
      },
    ],
  },
  {
    id: 'bookshelf',
    category: 'Comfort',
    interaction: { verb: 'reading a book', emoji: '📖', anim: 'sit', reaction: '📖' },
    tiers: [
      {
        id: 'bookshelf-1',
        name: 'Bookshelf',
        cost: 24,
        pixelSize: 5,
        matrix: buildBookshelf(12, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#3a2410', 2: '#c98a52', 3: '#e0c26a' },
      },
      {
        id: 'bookshelf-2',
        name: 'Reading Nook',
        cost: 70,
        pixelSize: 6,
        matrix: buildBookshelf(15, 27),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 2: '#7fd1c3', 3: '#fdf1c4' },
      },
      {
        id: 'bookshelf-3',
        name: 'Grand Library',
        cost: 190,
        pixelSize: 6,
        matrix: buildBookshelf(18, 32),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#e0c26a', 3: '#fdf6e3' },
      },
    ],
  },
  {
    id: 'bathtub',
    category: 'Comfort',
    interaction: { verb: 'taking a bubble bath', emoji: '🛁', anim: 'splash', reaction: '🫧' },
    tiers: [
      {
        id: 'bathtub-1',
        name: 'Bathtub',
        cost: 26,
        pixelSize: 5,
        matrix: buildBathtub(20, 11),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 2: '#e8e8e8', 4: '#7fc7e8', 5: '#c2c2c2' },
      },
      {
        id: 'bathtub-2',
        name: 'Spa Tub',
        cost: 75,
        pixelSize: 6,
        matrix: buildBathtub(25, 14),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0a2233', 2: '#f0eee8', 4: '#6fc1e6', 5: '#d8d0c0' },
      },
      {
        id: 'bathtub-3',
        name: 'Golden Bath',
        cost: 200,
        pixelSize: 6,
        matrix: buildBathtub(30, 17),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#fdf6e3', 4: '#4fa0c8', 5: '#e0c26a' },
      },
    ],
  },
  {
    id: 'telescope',
    category: 'Wonders',
    interaction: { verb: 'stargazing', emoji: '🔭', anim: 'sit', reaction: '🌟' },
    tiers: [
      {
        id: 'telescope-1',
        name: 'Telescope',
        cost: 30,
        pixelSize: 5,
        matrix: buildTelescope(16, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#1a1a2e', 3: '#8a5a30', 5: '#c2c2c2' },
      },
      {
        id: 'telescope-2',
        name: 'Observatory Scope',
        cost: 85,
        pixelSize: 6,
        matrix: buildTelescope(20, 27),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 3: '#3fa393', 5: '#e0e0e0' },
      },
      {
        id: 'telescope-3',
        name: 'Star Cannon',
        cost: 230,
        pixelSize: 6,
        matrix: buildTelescope(24, 32),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 3: '#c9a227', 5: '#fdf6e3' },
      },
    ],
  },
  {
    id: 'easel',
    category: 'Wonders',
    interaction: { verb: 'painting', emoji: '🎨', anim: 'sway', reaction: '🎨' },
    tiers: [
      {
        id: 'easel-1',
        name: 'Easel',
        cost: 22,
        pixelSize: 5,
        matrix: buildEasel(16, 18),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#3a2410', 2: '#fdf6e3', 5: '#8a5a30' },
      },
      {
        id: 'easel-2',
        name: 'Art Studio',
        cost: 65,
        pixelSize: 6,
        matrix: buildEasel(20, 22),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#0f2622', 2: '#fdf1c4', 5: '#3fa393' },
      },
      {
        id: 'easel-3',
        name: 'Masterpiece Studio',
        cost: 175,
        pixelSize: 6,
        matrix: buildEasel(24, 26),
        palette: MONO_PALETTE,
        colorPalette: { 1: '#2a2410', 2: '#ff8a80', 5: '#e0c26a' },
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
