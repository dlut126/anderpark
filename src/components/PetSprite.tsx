import { useMemo } from 'react';
import { getSpecies } from '../data/species';
import { useWander } from '../hooks/useWander';
import type { Pet } from '../types';

interface Props {
  pet: Pet;
  onClick: () => void;
}

export function PetSprite({ pet, onClick }: Props) {
  const species = getSpecies(pet.speciesId);
  const isHungry = pet.hunger < 35;
  const isStarving = pet.hunger < 15;

  // Fixed vertical spot in the grass band, picked once per pet.
  const bottom = useMemo(() => `${6 + Math.random() * 24}%`, [pet.id]);
  const seedLeft = useMemo(() => 10 + Math.random() * 70, [pet.id]);
  const { left, duration, easing, jumping } = useWander(seedLeft);

  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-1 hover:scale-110"
      style={{
        left: `${left}%`,
        bottom,
        transition: `left ${duration}s ${easing}, transform 0.15s ease-out`,
      }}
      title={pet.nickname}
    >
      {isHungry && (
        <span
          className={`pixel-outline font-mono text-base font-bold leading-none ${isStarving ? 'animate-pulse' : ''}`}
        >
          {isStarving ? '!!' : '!'}
        </span>
      )}
      <div className="relative" style={jumping ? { animation: `pet-hop ${duration}s ease-out` } : undefined}>
        <img
          src={species.image}
          alt={pet.nickname}
          className="h-32 w-32 object-contain animate-bob [image-rendering:pixelated]"
        />
        <span className="absolute -bottom-1 -right-1 border border-black bg-white px-1 font-mono text-[10px] font-bold text-black">
          Lv{pet.level}
        </span>
      </div>
      <span className="border border-white/60 bg-black px-1.5 py-0.5 font-mono text-[11px] text-white">
        {pet.nickname}
      </span>
    </button>
  );
}
