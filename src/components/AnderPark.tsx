import { useMemo, useRef } from 'react';
import { getDecoration } from '../data/decorations';
import type { Pet } from '../types';
import { PetSprite } from './PetSprite';
import {
  GRASS_MATRICES,
  grayHex,
  PixelCloud,
  pixelSpriteHeight,
  PixelGrass,
  PixelSun,
  PixelTree,
  TREE_MATRICES,
} from './PixelDecor';
import { PlacedDecoration } from './PlacedDecoration';

interface Props {
  pets: Pet[];
  ownedDecorationIds: string[];
  decorationPositions: Record<string, { left: number; bottom: number }>;
  colorMode: boolean;
  onSelectPet: (pet: Pet) => void;
  onMoveDecoration: (id: string, left: number, bottom: number) => void;
}

// Derives a tree's palette from a stable per-tree seed, so a given tree keeps
// the same relative light/darkness whether you're in mono or color mode.
function treePalette(seed: number, colorMode: boolean) {
  if (!colorMode) {
    const canopyLightness = 110 + seed * 120;
    return { 1: grayHex(canopyLightness), 2: grayHex(canopyLightness - 70) };
  }
  const canopyL = 26 + seed * 32;
  const trunkL = Math.max(14, canopyL - 16);
  return { 1: `hsl(112, 40%, ${canopyL}%)`, 2: `hsl(28, 45%, ${trunkL}%)` };
}

export function AnderPark({
  pets,
  ownedDecorationIds,
  decorationPositions,
  colorMode,
  onSelectPet,
  onMoveDecoration,
}: Props) {
  const groundRef = useRef<HTMLDivElement>(null);

  // Sit right on the horizon line, like a distant treeline behind the grass.
  // Size and shade seed vary per tree so the line doesn't look stamped-out.
  const treeSpots = useMemo(
    () =>
      [2, 14, 26, 38, 50, 62, 74, 86, 97].map((left) => ({
        left,
        size: 4 + Math.round(Math.random() * 8),
        bottom: 98 + Math.random() * 3,
        seed: Math.random(),
        variant: Math.floor(Math.random() * TREE_MATRICES.length),
      })),
    [],
  );

  // Small grass tufts scattered through the foreground for a bit of ground texture.
  const grassSpots = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        left: Math.random() * 100,
        bottom: 2 + Math.random() * 68,
        size: 3 + Math.round(Math.random() * 2),
        variant: Math.floor(Math.random() * GRASS_MATRICES.length),
      })),
    [],
  );

  return (
    <div className={`fixed inset-0 h-screen w-screen overflow-hidden ${colorMode ? 'pixel-sky-color' : 'pixel-sky'}`}>
      <PixelSun size={11} color={colorMode ? '#ffd54f' : undefined} className="absolute right-[10%] top-[10%]" />
      <PixelCloud
        size={6}
        color={colorMode ? '#ffffff' : undefined}
        className="absolute left-[8%] top-[16%] opacity-80"
      />
      <PixelCloud
        size={5}
        color={colorMode ? '#ffffff' : undefined}
        className="absolute right-[30%] top-[8%] opacity-60"
      />
      <PixelCloud
        size={5}
        color={colorMode ? '#ffffff' : undefined}
        className="absolute left-[40%] top-[22%] opacity-50"
      />

      {/* ground */}
      <div
        ref={groundRef}
        className={`absolute inset-x-0 bottom-0 h-[46%] border-t-2 border-black/60 ${colorMode ? 'pixel-ground-color' : 'pixel-ground'}`}
      >
        {treeSpots.map((tree, i) => (
          <div
            key={i}
            className="absolute opacity-90"
            style={{
              left: `${tree.left}%`,
              bottom: `calc(${tree.bottom}% + ${pixelSpriteHeight(TREE_MATRICES[tree.variant], tree.size)}px)`,
            }}
          >
            <PixelTree variant={tree.variant} size={tree.size} palette={treePalette(tree.seed, colorMode)} />
          </div>
        ))}

        {grassSpots.map((tuft, i) => (
          <div
            key={i}
            className="absolute opacity-70"
            style={{
              left: `${tuft.left}%`,
              bottom: `calc(${tuft.bottom}% + ${pixelSpriteHeight(GRASS_MATRICES[tuft.variant], tuft.size)}px)`,
            }}
          >
            <PixelGrass
              variant={tuft.variant}
              size={tuft.size}
              color={colorMode ? (tuft.variant === 0 ? '#5fa84c' : '#4a8f3c') : undefined}
            />
          </div>
        ))}

        {ownedDecorationIds.map((id) => {
          const deco = getDecoration(id);
          const position = decorationPositions[id];
          if (!deco || !position) return null;
          return (
            <PlacedDecoration
              key={id}
              deco={deco}
              position={position}
              groundRef={groundRef}
              colorMode={colorMode}
              onMove={(left, bottom) => onMoveDecoration(id, left, bottom)}
            />
          );
        })}
      </div>

      {pets.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="border-2 border-white/70 bg-black px-4 py-3 text-center font-mono text-sm text-white">
            ANDERPARK IS EMPTY
            <br />
            Adopt your first pet to get started.
          </p>
        </div>
      ) : (
        pets.map((pet) => <PetSprite key={pet.id} pet={pet} colorMode={colorMode} onClick={() => onSelectPet(pet)} />)
      )}
    </div>
  );
}
