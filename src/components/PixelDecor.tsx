import { useMemo } from 'react';

// Tiny pixel-art sprites drawn with box-shadow (each shadow = one square "pixel").
// 0 = empty, other numbers index into `palette`.
function buildShadow(matrix: number[][], size: number, palette: Record<number, string>): string {
  const parts: string[] = [];
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      const color = palette[cell];
      if (color) parts.push(`${x * size}px ${y * size}px 0 0 ${color}`);
    });
  });
  return parts.join(',');
}

interface PixelSpriteProps {
  matrix: number[][];
  size: number;
  palette: Record<number, string>;
  className?: string;
}

export function PixelSprite({ matrix, size, palette, className }: PixelSpriteProps) {
  const shadow = useMemo(() => buildShadow(matrix, size, palette), [matrix, size, palette]);
  return <div className={className} style={{ width: size, height: size, boxShadow: shadow }} />;
}

// The sprite's own div is its top-left pixel; box-shadow pixels extend right and
// down from there. When positioning with `bottom`, add this to the offset so the
// sprite's bottom row lands at the intended line instead of overflowing past it.
export function pixelSpriteHeight(matrix: number[][], size: number): number {
  return matrix.length * size;
}

export const TREE_MATRIX = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0],
];

interface PixelTreeProps {
  size?: number;
  palette?: Record<number, string>;
  className?: string;
}

export function PixelTree({ size = 6, palette, className }: PixelTreeProps) {
  return (
    <PixelSprite
      matrix={TREE_MATRIX}
      size={size}
      palette={palette ?? { 1: '#c7c7c7', 2: '#5a5a5a' }}
      className={className}
    />
  );
}

// Clamps a 0-255 lightness value to a grayscale hex color, so trees (or
// anything else) can be given randomized-but-still-monochrome shading.
export function grayHex(lightness: number): string {
  const v = Math.max(0, Math.min(255, Math.round(lightness)));
  const hex = v.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

const SUN_MATRIX = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
];

export function PixelSun({
  size = 8,
  color = '#f5f5f5',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return <PixelSprite matrix={SUN_MATRIX} size={size} palette={{ 1: color }} className={className} />;
}

const CLOUD_MATRIX = [
  [0, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1],
];

export function PixelCloud({ size = 5, className }: { size?: number; className?: string }) {
  return <PixelSprite matrix={CLOUD_MATRIX} size={size} palette={{ 1: '#d8d8d8' }} className={className} />;
}

const GRASS_MATRIX_A = [
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
];

const GRASS_MATRIX_B = [
  [0, 1, 0, 1, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

export const GRASS_MATRICES = [GRASS_MATRIX_A, GRASS_MATRIX_B];

export function PixelGrass({
  variant = 0,
  size = 4,
  color = '#6b6b6b',
  className,
}: {
  variant?: number;
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <PixelSprite
      matrix={GRASS_MATRICES[variant % GRASS_MATRICES.length]}
      size={size}
      palette={{ 1: color }}
      className={className}
    />
  );
}
