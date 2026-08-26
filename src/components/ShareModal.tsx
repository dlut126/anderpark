import { useState } from 'react';
import { getSpecies } from '../data/species';
import type { Pet } from '../types';

interface Props {
  pet: Pet;
  onClose: () => void;
}

export function ShareModal({ pet, onClose }: Props) {
  const species = getSpecies(pet.speciesId);
  const [copied, setCopied] = useState(false);

  const shareText = `${pet.nickname} the ${species.name} just hit Level ${pet.level} in AnderPark! 🎉\n${species.goalDescription}\n\nRaise your own goal-pet at AnderPark.`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-100 to-emerald-100 p-6 text-center shadow-2xl">
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-amber-600">Level Up!</p>
        <img src={species.image} alt={species.name} className="mx-auto h-28 w-28 object-contain drop-shadow-xl" />
        <h2 className="mt-2 text-2xl font-extrabold text-emerald-900">
          {pet.nickname} reached Level {pet.level}
        </h2>
        <p className="mt-1 text-sm text-emerald-700">{species.name} · AnderPark</p>

        <button
          onClick={handleCopy}
          className="mt-6 w-full rounded-full bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          {copied ? 'Copied!' : 'Copy & Share'}
        </button>
        <button onClick={onClose} className="mt-3 text-sm text-emerald-600 hover:text-emerald-800">
          Back to AnderPark
        </button>
      </div>
    </div>
  );
}
