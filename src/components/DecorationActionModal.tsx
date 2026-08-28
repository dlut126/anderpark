import { getLine } from '../data/decorations';
import { hasRoom, type DecorationInstance } from '../hooks/usePark';
import { PixelSprite } from './PixelDecor';

interface Props {
  instance: DecorationInstance;
  coins: number;
  colorMode: boolean;
  onUpgrade: () => void;
  onSell: () => void;
  onToggleLock: () => void;
  onOpenRoom: () => void;
  onClose: () => void;
}

export function DecorationActionModal({
  instance,
  coins,
  colorMode,
  onUpgrade,
  onSell,
  onToggleLock,
  onOpenRoom,
  onClose,
}: Props) {
  const line = getLine(instance.lineId);
  if (!line) return null;
  const tier = line.tiers[instance.tier];
  const nextTier = line.tiers[instance.tier + 1];
  const refund = Math.floor(tier.cost / 2);
  const canAffordUpgrade = !!nextTier && coins >= nextTier.cost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">
            <PixelSprite
              matrix={tier.matrix}
              size={Math.max(1, Math.floor(56 / Math.max(tier.matrix[0]?.length ?? 1, tier.matrix.length)))}
              palette={colorMode ? tier.colorPalette : tier.palette}
            />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-900">{tier.name}</p>
            <p className="text-xs text-emerald-500">{line.interaction.emoji} {line.interaction.verb}</p>
          </div>
        </div>

        <div className="space-y-2">
          {hasRoom(instance) && (
            <button
              onClick={onOpenRoom}
              className="w-full rounded-xl border border-emerald-300 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Go inside
            </button>
          )}
          {nextTier ? (
            <button
              onClick={onUpgrade}
              disabled={!canAffordUpgrade}
              className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              Upgrade to {nextTier.name} · {nextTier.cost}c
            </button>
          ) : (
            <p className="text-center text-xs font-semibold text-emerald-500">Max tier reached</p>
          )}
          <button
            onClick={onToggleLock}
            className="w-full rounded-xl border border-emerald-200 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            {instance.locked ? 'Unlock (allow moving)' : 'Lock in place'}
          </button>
          <button
            onClick={onSell}
            className="w-full rounded-xl border border-rose-200 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50"
          >
            Sell back · +{refund}c
          </button>
          <button onClick={onClose} className="w-full rounded-xl py-2 text-sm text-emerald-600 hover:bg-emerald-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
