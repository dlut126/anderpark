import { getAppearance } from '../data/appearances';
import { activityLine } from '../data/awayActivities';
import type { AwayReport } from '../hooks/useCharacter';
import type { Character } from '../types';

interface Props {
  character: Character;
  report: AwayReport;
  onClose: () => void;
}

const stageEmoji = { thriving: '🎉', healthy: '✅', struggling: '😮‍💨', critical: '😔' } as const;

export function AwayReportModal({ character, report, onClose }: Props) {
  const appearance = getAppearance(character.appearanceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <img src={appearance.image} alt={appearance.name} className="h-12 w-12 object-contain" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-500">While you were away</p>
            <h2 className="text-lg font-bold text-emerald-900">{character.nickname}</h2>
          </div>
        </div>

        <ul className="space-y-3">
          {report.activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-2 rounded-xl border border-emerald-100 p-3">
              <span className="text-xl leading-none">{activity.emoji}</span>
              <span className="flex-1 text-sm text-emerald-800">
                {activityLine(activity, report.stage, character.nickname)}
              </span>
              <span className="text-base leading-none">{stageEmoji[report.stage]}</span>
            </li>
          ))}
        </ul>

        {(report.lostCoins > 0 || report.lostXp > 0) && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-600">
              Struggling took its toll — lost {Math.round(report.lostCoins)}c
              {report.lostXp > 0 ? ` and ${Math.round(report.lostXp)} XP` : ''} while away.
            </p>
            <p className="mt-1 text-[11px] text-rose-500">Keep needs up to stop the bleeding and start recovering.</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Welcome back
        </button>
      </div>
    </div>
  );
}
