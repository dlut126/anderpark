import { CATEGORIES, DECORATION_LINES } from '../data/decorations';
import { PixelSprite } from './PixelDecor';

interface Props {
  coins: number;
  characterLevel: number;
  ownedTierByLine: Record<string, number>;
  colorMode: boolean;
  onBuyTier: (lineId: string) => void;
  onClose: () => void;
}

export function ShopModal({ coins, characterLevel, ownedTierByLine, colorMode, onBuyTier, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900">Shop</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
            Close
          </button>
        </div>
        <p className="mb-4 font-mono text-sm text-emerald-700">Coins: {coins}</p>

        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const lines = DECORATION_LINES.filter((l) => l.category === category);
            if (lines.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-500">{category}</h3>
                <ul className="space-y-3">
                  {lines.map((line) => {
                    const owned = ownedTierByLine[line.id] ?? 0;
                    const locked = line.unlockLevel !== undefined && characterLevel < line.unlockLevel;

                    if (locked) {
                      return (
                        <li
                          key={line.id}
                          className="flex items-center gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 px-4 py-3"
                        >
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                            🔒
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-400">{line.tiers[0].name} line</p>
                            <p className="text-xs text-emerald-500">Unlocks at Level {line.unlockLevel}</p>
                          </div>
                        </li>
                      );
                    }

                    return (
                      <li key={line.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {line.tiers.map((tier, i) => {
                            const isOwned = i < owned;
                            const isNext = i === owned;
                            const canAfford = coins >= tier.cost;
                            return (
                              <div
                                key={tier.id}
                                className={`flex w-24 shrink-0 flex-col items-center rounded-xl border px-2 py-2 text-center ${
                                  isOwned
                                    ? 'border-emerald-300 bg-emerald-100'
                                    : isNext
                                      ? 'border-emerald-400 bg-white'
                                      : 'border-emerald-100 bg-white/60 opacity-50'
                                }`}
                              >
                                <div className="mb-1 flex h-16 w-16 items-center justify-center overflow-hidden">
                                  <PixelSprite
                                    matrix={tier.matrix}
                                    size={Math.max(
                                      1,
                                      Math.floor(56 / Math.max(tier.matrix[0]?.length ?? 1, tier.matrix.length)),
                                    )}
                                    palette={colorMode ? tier.colorPalette : tier.palette}
                                  />
                                </div>
                                <p className="text-[11px] font-semibold leading-tight text-emerald-900">{tier.name}</p>
                                {isOwned ? (
                                  <p className="text-[10px] font-semibold text-emerald-600">✓ Owned</p>
                                ) : isNext ? (
                                  <button
                                    onClick={() => onBuyTier(line.id)}
                                    disabled={!canAfford}
                                    className="mt-1 w-full rounded-full bg-emerald-600 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                                  >
                                    {owned > 0 ? 'Upgrade' : 'Buy'} · {tier.cost}
                                  </button>
                                ) : (
                                  <p className="text-[10px] text-emerald-400">🔒 {tier.cost}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-emerald-500">
          Earn coins by completing tasks. Everything here is cosmetic — upgrade a
          line to replace it with the next tier, in place. Drag anything placed
          in the park to reposition it.
        </p>
      </div>
    </div>
  );
}
