import { DECORATIONS } from '../data/decorations';
import { PixelSprite } from './PixelDecor';

interface Props {
  coins: number;
  ownedDecorationIds: string[];
  colorMode: boolean;
  onBuy: (id: string) => void;
  onClose: () => void;
}

export function ShopModal({ coins, ownedDecorationIds, colorMode, onBuy, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900">Shop</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
            Close
          </button>
        </div>
        <p className="mb-4 font-mono text-sm text-emerald-700">Coins: {coins}</p>

        <ul className="space-y-3">
          {DECORATIONS.map((deco) => {
            const owned = ownedDecorationIds.includes(deco.id);
            const canAfford = coins >= deco.cost;
            return (
              <li
                key={deco.id}
                className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-white">
                    <PixelSprite
                      matrix={deco.matrix}
                      size={deco.pixelSize}
                      palette={colorMode ? deco.colorPalette : deco.palette}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">{deco.name}</p>
                    <p className="text-xs text-emerald-600">{deco.cost} coins</p>
                  </div>
                </div>
                <button
                  onClick={() => onBuy(deco.id)}
                  disabled={owned || !canAfford}
                  className="whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                >
                  {owned ? 'Owned' : 'Buy'}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-center text-xs text-emerald-500">
          Earn coins by completing tasks for any of your pets. Once placed, drag a
          decoration in the park to reposition it.
        </p>
      </div>
    </div>
  );
}
