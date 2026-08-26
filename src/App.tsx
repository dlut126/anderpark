import { useState } from 'react';
import { AdoptPetModal } from './components/AdoptPetModal';
import { AnderPark } from './components/AnderPark';
import { PetDetailModal } from './components/PetDetailModal';
import { ShareModal } from './components/ShareModal';
import { ShopModal } from './components/ShopModal';
import { MAX_PETS } from './data/species';
import { usePark } from './hooks/usePark';
import { useRoster } from './hooks/useRoster';
import type { Pet } from './types';

function App() {
  const {
    roster,
    addPet,
    removePet,
    completeTask,
    addCustomTask,
    feedPet,
    leveledUpPet,
    dismissLevelUp,
  } = useRoster();
  const { coins, ownedDecorationIds, decorationPositions, earnCoins, buyDecoration, moveDecoration } = usePark();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [adoptOpen, setAdoptOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const selectedPet = roster.find((p) => p.id === selectedPetId) ?? null;
  const showOnboarding = roster.length === 0 || adoptOpen;

  const handleAdopt = (speciesId: string, nickname: string) => {
    addPet(speciesId, nickname);
    setAdoptOpen(false);
  };

  const handleRelease = (petId: string) => {
    removePet(petId);
    setSelectedPetId(null);
  };

  // Completing a task earns the pet's food AND contributes to the shared park fund.
  const handleCompleteTask = (petId: string, taskLabel: string, foodReward: number) => {
    completeTask(petId, taskLabel, foodReward);
    earnCoins(foodReward);
  };

  return (
    <div className="min-h-screen">
      <AnderPark
        pets={roster}
        ownedDecorationIds={ownedDecorationIds}
        decorationPositions={decorationPositions}
        onSelectPet={(pet: Pet) => setSelectedPetId(pet.id)}
        onMoveDecoration={moveDecoration}
      />

      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/20 bg-black/70 px-4 py-3 backdrop-blur-sm">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-wide text-white">ANDERPARK</h1>
          <p className="hidden font-mono text-[11px] text-white/60 sm:block">
            Turn your goals into pets. Keep them fed to keep them growing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShopOpen(true)}
            className="border border-white/60 bg-transparent px-3 py-2 font-mono text-xs font-bold text-white hover:bg-white/10"
          >
            SHOP · {coins}c
          </button>
          <button
            onClick={() => setAdoptOpen(true)}
            disabled={roster.length >= MAX_PETS}
            className="border border-white bg-white px-3 py-2 font-mono text-xs font-bold text-black disabled:cursor-not-allowed disabled:border-white/30 disabled:bg-transparent disabled:text-white/30"
          >
            + ADOPT ({roster.length}/{MAX_PETS})
          </button>
        </div>
      </header>

      {roster.length > 0 && (
        <p className="fixed inset-x-0 bottom-4 z-10 text-center font-mono text-[11px] text-white/70">
          Tap a pet to feed them or log a completed task.
        </p>
      )}

      {showOnboarding && (
        <AdoptPetModal
          onAdopt={handleAdopt}
          onClose={() => setAdoptOpen(false)}
          canClose={roster.length > 0}
        />
      )}

      {selectedPet && (
        <PetDetailModal
          pet={selectedPet}
          onClose={() => setSelectedPetId(null)}
          onFeed={feedPet}
          onCompleteTask={handleCompleteTask}
          onAddCustomTask={addCustomTask}
          onRelease={handleRelease}
        />
      )}

      {shopOpen && (
        <ShopModal
          coins={coins}
          ownedDecorationIds={ownedDecorationIds}
          onBuy={buyDecoration}
          onClose={() => setShopOpen(false)}
        />
      )}

      {leveledUpPet && <ShareModal pet={leveledUpPet} onClose={dismissLevelUp} />}
    </div>
  );
}

export default App;
