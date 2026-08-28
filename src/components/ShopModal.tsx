import { useState } from 'react';
import { CATEGORIES, DECORATION_LINES, MAX_INSTANCES_PER_LINE } from '../data/decorations';
import { OUTFIT_ITEMS } from '../data/outfits';
import { PARK_THEMES } from '../data/themes';
import { MAX_PARK_EXPANSION_TIER, PARK_EXPANSION_COSTS } from '../hooks/usePark';
import { OutfitOverlay } from './OutfitOverlay';
import { PixelSprite } from './PixelDecor';

interface Props {
  coins: number;
  characterLevel: number;
  ownedCountByLine: Record<string, number>;
  colorMode: boolean;
  onBuy: (lineId: string) => void;
  ownedOutfitIds: string[];
  equippedOutfitId: string | null;
  onBuyOutfit: (id: string) => void;
  onEquipOutfit: (id: string | null) => void;
  ownedThemeIds: string[];
  activeThemeId: string;
  onBuyTheme: (id: string) => void;
  onSetActiveTheme: (id: string) => void;
  parkExpansionTier: number;
  onBuyParkExpansion: () => void;
  onClose: () => void;
}

const TABS = ['Decorations', 'Outfits', 'Themes', 'Park Size'] as const;
type Tab = (typeof TABS)[number];

export function ShopModal({
  coins,
  characterLevel,
  ownedCountByLine,
  colorMode,
  onBuy,
  ownedOutfitIds,
  equippedOutfitId,
  onBuyOutfit,
  onEquipOutfit,
  ownedThemeIds,
  activeThemeId,
  onBuyTheme,
  onSetActiveTheme,
  parkExpansionTier,
  onBuyParkExpansion,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('Decorations');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900">Shop</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
            Close
          </button>
        </div>
        <p className="mb-3 font-mono text-sm text-emerald-700">Coins: {coins}</p>

        <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-emerald-50 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                tab === t ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'Decorations' && (
            <div className="space-y-6">
              {CATEGORIES.map((category) => {
                const lines = DECORATION_LINES.filter((l) => l.category === category);
                if (lines.length === 0) return null;
                return (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-500">{category}</h3>
                    <ul className="space-y-3">
                      {lines.map((line) => {
                        const owned = ownedCountByLine[line.id] ?? 0;
                        const locked = line.unlockLevel !== undefined && characterLevel < line.unlockLevel;
                        const atCap = owned >= MAX_INSTANCES_PER_LINE;
                        const firstTier = line.tiers[0];
                        const canAfford = coins >= firstTier.cost;

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
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs font-semibold text-emerald-700">
                                {line.interaction.emoji} {firstTier.name} line
                              </p>
                              <p className="text-xs text-emerald-500">
                                You own {owned}/{MAX_INSTANCES_PER_LINE}
                              </p>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {line.tiers.map((tier, i) => (
                                <div
                                  key={tier.id}
                                  className={`flex w-24 shrink-0 flex-col items-center rounded-xl border px-2 py-2 text-center ${
                                    i === 0 ? 'border-emerald-400 bg-white' : 'border-emerald-100 bg-white/60'
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
                                  {i === 0 ? (
                                    atCap ? (
                                      <p className="mt-1 text-[10px] text-emerald-400">Max owned</p>
                                    ) : (
                                      <button
                                        onClick={() => onBuy(line.id)}
                                        disabled={!canAfford}
                                        className="mt-1 w-full rounded-full bg-emerald-600 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                                      >
                                        Buy · {tier.cost}
                                      </button>
                                    )
                                  ) : (
                                    <p className="mt-1 text-[10px] text-emerald-400">Upgrade in the park</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              <p className="text-center text-xs text-emerald-500">
                Buy as many of each item as you like (up to {MAX_INSTANCES_PER_LINE}) — tap one you've placed in the
                park to upgrade, lock, or sell it back for half its cost.
              </p>
            </div>
          )}

          {tab === 'Outfits' && (
            <div className="grid grid-cols-3 gap-3">
              {OUTFIT_ITEMS.map((outfit) => {
                const owned = ownedOutfitIds.includes(outfit.id);
                const equipped = equippedOutfitId === outfit.id;
                const locked = outfit.unlockLevel !== undefined && characterLevel < outfit.unlockLevel;
                const canAfford = coins >= outfit.cost;
                return (
                  <div
                    key={outfit.id}
                    className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center ${
                      equipped ? 'border-emerald-400 bg-emerald-50' : 'border-emerald-100 bg-white'
                    }`}
                  >
                    <div className="relative mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                      <OutfitOverlay outfitId={outfit.id} />
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-900">{outfit.name}</p>
                    {locked ? (
                      <p className="mt-1 text-[10px] text-emerald-400">Lv{outfit.unlockLevel}</p>
                    ) : !owned ? (
                      <button
                        onClick={() => onBuyOutfit(outfit.id)}
                        disabled={!canAfford}
                        className="mt-1 w-full rounded-full bg-emerald-600 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                      >
                        Buy · {outfit.cost}
                      </button>
                    ) : (
                      <button
                        onClick={() => onEquipOutfit(equipped ? null : outfit.id)}
                        className={`mt-1 w-full rounded-full py-1 text-[10px] font-semibold ${
                          equipped ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {equipped ? 'Unequip' : 'Equip'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'Themes' && (
            <div className="grid grid-cols-2 gap-3">
              {PARK_THEMES.map((theme) => {
                const owned = ownedThemeIds.includes(theme.id);
                const active = activeThemeId === theme.id;
                const locked = theme.unlockLevel !== undefined && characterLevel < theme.unlockLevel;
                const canAfford = coins >= theme.cost;
                return (
                  <div
                    key={theme.id}
                    className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center ${
                      active ? 'border-emerald-400 bg-emerald-50' : 'border-emerald-100 bg-white'
                    }`}
                  >
                    <div
                      className="mb-1 h-12 w-full rounded-lg border border-emerald-100"
                      style={{ background: colorMode ? theme.skyColor : theme.skyMono }}
                    />
                    <p className="text-[11px] font-semibold text-emerald-900">{theme.name}</p>
                    {locked ? (
                      <p className="mt-1 text-[10px] text-emerald-400">Unlocks Lv{theme.unlockLevel}</p>
                    ) : !owned ? (
                      <button
                        onClick={() => onBuyTheme(theme.id)}
                        disabled={!canAfford}
                        className="mt-1 w-full rounded-full bg-emerald-600 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                      >
                        {theme.cost === 0 ? 'Free' : `Buy · ${theme.cost}`}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSetActiveTheme(theme.id)}
                        disabled={active}
                        className="mt-1 w-full rounded-full bg-emerald-600 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                      >
                        {active ? 'Active' : 'Use'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'Park Size' && (
            <div className="space-y-3">
              <p className="text-sm text-emerald-700">
                Widen the park so there's more room to spread things out. Currently {100 + parkExpansionTier * 50}%
                size — scroll sideways or zoom out to see all of it.
              </p>
              {parkExpansionTier >= MAX_PARK_EXPANSION_TIER ? (
                <p className="rounded-xl bg-emerald-50 py-3 text-center text-sm font-semibold text-emerald-600">
                  Park is at maximum size.
                </p>
              ) : (
                <button
                  onClick={onBuyParkExpansion}
                  disabled={coins < PARK_EXPANSION_COSTS[parkExpansionTier]}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                >
                  Expand to {100 + (parkExpansionTier + 1) * 50}% · {PARK_EXPANSION_COSTS[parkExpansionTier]}c
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
