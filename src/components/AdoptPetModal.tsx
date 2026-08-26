import { useState } from 'react';
import { SPECIES } from '../data/species';

interface Props {
  onAdopt: (speciesId: string, nickname: string) => void;
  onClose: () => void;
  canClose: boolean;
}

export function AdoptPetModal({ onAdopt, onClose, canClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const selectedSpecies = SPECIES.find((s) => s.id === selected);

  const handleConfirm = () => {
    if (!selectedSpecies) return;
    const finalName = nickname.trim() || selectedSpecies.name;
    onAdopt(selectedSpecies.id, finalName);
    setSelected(null);
    setNickname('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900">Adopt a Pet</h2>
          {canClose && (
            <button
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50"
            >
              Close
            </button>
          )}
        </div>

        <p className="mb-4 text-sm text-emerald-700">
          Pick an animal to represent a goal you're working on. You can raise up to 6 at once.
        </p>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {SPECIES.map((species) => (
            <button
              key={species.id}
              onClick={() => setSelected(species.id)}
              className={`rounded-2xl border-2 p-3 text-center transition ${
                selected === species.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-transparent bg-emerald-50/50 hover:border-emerald-200'
              }`}
            >
              <img src={species.image} alt={species.name} className="mx-auto h-16 w-16 object-contain" />
              <div className="mt-1 text-sm font-semibold text-emerald-900">{species.name}</div>
            </button>
          ))}
        </div>

        {selectedSpecies && (
          <div className="mb-5 rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-800">{selectedSpecies.tagline}</p>
            <p className="mt-1 text-xs text-emerald-600">Goal: {selectedSpecies.goalDescription}</p>
            <label className="mt-3 block text-xs font-semibold text-emerald-700">
              Give them a nickname
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={selectedSpecies.name}
                maxLength={20}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-500"
              />
            </label>
          </div>
        )}

        <button
          disabled={!selectedSpecies}
          onClick={handleConfirm}
          className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-emerald-200"
        >
          Adopt
        </button>
      </div>
    </div>
  );
}
