import { dateKey } from '../data/streak';
import type { Character } from '../types';
import { NeedIcon } from './NeedIcon';

interface Props {
  character: Character;
  onClose: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function DailyLogModal({ character, onClose }: Props) {
  const today = dateKey(new Date());
  const todaysEntries = character.taskLog.filter((entry) => dateKey(new Date(entry.completedAt)) === today);
  const totalRestored = todaysEntries.reduce((sum, e) => sum + e.restored, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-900">Today's log</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
            Close
          </button>
        </div>
        <p className="mb-4 text-xs text-emerald-500">
          {todaysEntries.length === 0
            ? "Nothing logged yet today."
            : `${todaysEntries.length} task${todaysEntries.length === 1 ? '' : 's'} logged · +${totalRestored} total`}
        </p>

        {todaysEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center text-sm text-emerald-500">
            Complete a task and write what you actually did — it'll show up here.
          </p>
        ) : (
          <ul className="space-y-3">
            {todaysEntries.map((entry) => (
              <li key={entry.id} className="rounded-2xl border border-emerald-100 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
                    <NeedIcon needType={entry.needType} size={14} />
                    {entry.taskLabel}
                  </span>
                  <span className="shrink-0 text-xs text-emerald-500">{formatTime(entry.completedAt)}</span>
                </div>
                <p className="text-sm text-emerald-700">"{entry.note}"</p>
                <p className="mt-1 text-xs font-semibold text-emerald-500">+{entry.restored}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
