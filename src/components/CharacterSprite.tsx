import { useMemo } from 'react';
import { getAppearance } from '../data/appearances';
import { HUNGRY_THRESHOLD, NEED_DEFINITIONS, STARVING_THRESHOLD } from '../data/needs';
import { vitalityStage } from '../data/vitality';
import { useWander } from '../hooks/useWander';
import { NeedIcon } from './NeedIcon';
import type { Character, NeedType } from '../types';

interface Props {
  character: Character;
  colorMode: boolean;
  onClick: () => void;
}

export function CharacterSprite({ character, colorMode, onClick }: Props) {
  const appearance = getAppearance(character.appearanceId);

  const activeNeedDefs = useMemo(
    () => NEED_DEFINITIONS.filter((def) => character.needs[def.id]),
    [character.needs],
  );
  const lowestNeed = useMemo(
    () =>
      activeNeedDefs.length
        ? activeNeedDefs.reduce((lowest, def) =>
            character.needs[def.id]!.level < character.needs[lowest.id]!.level ? def : lowest,
          )
        : null,
    [activeNeedDefs, character.needs],
  );
  const lowestLevel = lowestNeed ? character.needs[lowestNeed.id as NeedType]!.level : 100;
  const isNeedy = lowestNeed !== null && lowestLevel < HUNGRY_THRESHOLD;
  const isCritical = lowestNeed !== null && lowestLevel < STARVING_THRESHOLD;

  // Overall wellbeing, distinct from any single need — a slow-moving signal
  // of sustained care (or neglect), layered on top of the per-need badge.
  const stage = vitalityStage(character.vitality);
  const vitalityFilter =
    stage === 'thriving'
      ? 'saturate(1.3) brightness(1.1)'
      : stage === 'struggling'
        ? 'grayscale(0.4) brightness(0.9)'
        : stage === 'critical'
          ? 'grayscale(0.7) brightness(0.75)'
          : '';
  const combinedFilter = [colorMode ? appearance.colorFilter : '', vitalityFilter].filter(Boolean).join(' ') || undefined;

  // Fixed vertical spot in the grass band, picked once.
  const bottom = useMemo(() => `${6 + Math.random() * 24}%`, [character.id]);
  const seedLeft = useMemo(() => 10 + Math.random() * 70, [character.id]);
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
      title={character.nickname}
    >
      {isNeedy && lowestNeed && (
        <span
          className={`flex items-center gap-0.5 rounded-full border border-black bg-white px-1 py-0.5 ${isCritical ? 'animate-pulse' : ''}`}
        >
          <NeedIcon needType={lowestNeed.id} size={14} />
          <span className="pixel-outline font-mono text-xs font-bold leading-none text-black">
            {isCritical ? '!!' : '!'}
          </span>
        </span>
      )}
      <div
        className={`relative rounded-full ${stage === 'thriving' ? 'animate-thriving-glow' : ''} ${stage === 'critical' ? 'animate-pulse ring-4 ring-red-500/70' : ''}`}
        style={jumping ? { animation: `pet-hop ${duration}s ease-out` } : undefined}
      >
        {stage === 'thriving' && (
          <span className="absolute -left-2 -top-2 text-base" aria-hidden>
            ✨
          </span>
        )}
        <img
          src={appearance.image}
          alt={character.nickname}
          className="h-32 w-32 object-contain animate-bob [image-rendering:pixelated]"
          style={combinedFilter ? { filter: combinedFilter } : undefined}
        />
        <span className="absolute -bottom-1 -right-1 border border-black bg-white px-1 font-mono text-[10px] font-bold text-black">
          Lv{character.level}
        </span>
      </div>
      <span className="border border-white/60 bg-black px-1.5 py-0.5 font-mono text-[11px] text-white">
        {character.nickname}
      </span>
    </button>
  );
}
