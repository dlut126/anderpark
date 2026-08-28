import { useState } from 'react';
import { getAppearance } from '../data/appearances';
import type { Character } from '../types';

interface Props {
  character: Character;
  onClose: () => void;
}

export function ShareModal({ character, onClose }: Props) {
  const appearance = getAppearance(character.appearanceId);
  const [copied, setCopied] = useState(false);

  const shareText = `${character.nickname} just hit Level ${character.level} in AnderPark! 🎉\n\nKeep your own goal-character alive at AnderPark.`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-100 to-emerald-100 p-6 text-center shadow-2xl">
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-amber-600">Level Up!</p>
        <img src={appearance.image} alt={appearance.name} className="mx-auto h-28 w-28 object-contain drop-shadow-xl" />
        <h2 className="mt-2 text-2xl font-extrabold text-emerald-900">
          {character.nickname} reached Level {character.level}
        </h2>
        <p className="mt-1 text-sm text-emerald-700">AnderPark</p>

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
