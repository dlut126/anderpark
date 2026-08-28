import { getAppearance } from '../data/appearances';
import type { Character } from '../types';

interface Props {
  character: Character;
  onClose: () => void;
}

export function MemorialModal({ character, onClose }: Props) {
  const appearance = getAppearance(character.appearanceId);
  const daysAlive = Math.max(0, Math.round((character.lastUpdatedAt - character.createdAt) / 86_400_000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-100 to-slate-300 p-6 text-center shadow-2xl">
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">In Memory Of</p>
        <img
          src={appearance.image}
          alt={appearance.name}
          className="mx-auto h-28 w-28 object-contain opacity-70 grayscale"
        />
        <h2 className="mt-2 text-2xl font-extrabold text-slate-800">{character.nickname}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reached Level {character.level} · Lived {daysAlive} {daysAlive === 1 ? 'day' : 'days'}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          {character.nickname} needed you, and for a while you were there. Life got in the way — it happens. What
          matters now is the next one.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Start a new journey
        </button>
      </div>
    </div>
  );
}
