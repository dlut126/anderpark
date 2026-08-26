import { useState } from 'react';
import { XP_PER_LEVEL, getSpecies } from '../data/species';
import type { Pet } from '../types';

interface Props {
  pet: Pet;
  onClose: () => void;
  onFeed: (petId: string) => void;
  onCompleteTask: (petId: string, taskLabel: string, foodReward: number) => void;
  onAddCustomTask: (petId: string, label: string, foodReward: number) => void;
  onRelease: (petId: string) => void;
}

export function PetDetailModal({
  pet,
  onClose,
  onFeed,
  onCompleteTask,
  onAddCustomTask,
  onRelease,
}: Props) {
  const species = getSpecies(pet.speciesId);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskReward, setNewTaskReward] = useState(1);
  const [confirmingRelease, setConfirmingRelease] = useState(false);

  const allTasks = [...species.presetTasks, ...pet.customTasks];

  const handleAddTask = () => {
    const label = newTaskLabel.trim();
    if (!label) return;
    onAddCustomTask(pet.id, label, Math.max(1, newTaskReward));
    setNewTaskLabel('');
    setNewTaskReward(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={species.image} alt={species.name} className="h-14 w-14 object-contain" />
            <div>
              <h2 className="text-xl font-bold text-emerald-900">{pet.nickname}</h2>
              <p className="text-xs text-emerald-600">
                {species.name} · Level {pet.level}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
            Close
          </button>
        </div>

        <p className="mb-4 text-sm text-emerald-700">{species.goalDescription}</p>

        <div className="mb-2">
          <div className="mb-1 flex justify-between text-xs font-medium text-emerald-700">
            <span>XP</span>
            <span>
              {pet.xp}/{XP_PER_LEVEL}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(pet.xp / XP_PER_LEVEL) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs font-medium text-rose-700">
            <span>Hunger</span>
            <span>{Math.round(pet.hunger)}/100</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-rose-500 transition-all"
              style={{ width: `${pet.hunger}%` }}
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
          <span className="text-sm font-medium text-emerald-800">
            {species.foodEmoji} {pet.foodInventory} {species.foodName}
            {pet.foodInventory === 1 ? '' : 's'} in stock
          </span>
          <button
            onClick={() => onFeed(pet.id)}
            disabled={pet.foodInventory <= 0}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
          >
            Feed
          </button>
        </div>

        <h3 className="mb-2 text-sm font-bold text-emerald-900">Tasks</h3>
        <ul className="mb-4 space-y-2">
          {allTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-emerald-100 px-3 py-2"
            >
              <span className="text-sm text-emerald-800">{task.label}</span>
              <button
                onClick={() => onCompleteTask(pet.id, task.label, task.foodReward)}
                className="whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
              >
                +{task.foodReward} {species.foodEmoji}
              </button>
            </li>
          ))}
        </ul>

        <details className="mb-4 rounded-xl border border-dashed border-emerald-200 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-700">
            + Add your own task
          </summary>
          <div className="mt-3 flex gap-2">
            <input
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="e.g. Reviewed my notes"
              className="flex-1 rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              min={1}
              max={20}
              value={newTaskReward}
              onChange={(e) => setNewTaskReward(Number(e.target.value))}
              className="w-16 rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddTask}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
        </details>

        {pet.taskLog.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-bold text-emerald-900">Recent activity</h3>
            <ul className="space-y-1 text-xs text-emerald-600">
              {pet.taskLog.slice(0, 5).map((entry) => (
                <li key={entry.id}>
                  {entry.taskLabel} — +{entry.foodEarned} {species.foodEmoji}
                </li>
              ))}
            </ul>
          </div>
        )}

        {confirmingRelease ? (
          <div className="rounded-xl bg-rose-50 p-3 text-center">
            <p className="mb-2 text-sm text-rose-800">Release {pet.nickname}? This can't be undone.</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setConfirmingRelease(false)}
                className="rounded-full px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100"
              >
                Cancel
              </button>
              <button
                onClick={() => onRelease(pet.id)}
                className="rounded-full bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white"
              >
                Release
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingRelease(true)}
            className="w-full text-center text-xs text-rose-400 hover:text-rose-600"
          >
            Release this pet
          </button>
        )}
      </div>
    </div>
  );
}
