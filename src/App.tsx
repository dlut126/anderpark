import { AnderPark } from './components/AnderPark';
import { AwayReportModal } from './components/AwayReportModal';
import { CharacterDetailModal } from './components/CharacterDetailModal';
import { FriendsModal } from './components/FriendsModal';
import { MemorialModal } from './components/MemorialModal';
import { NeedHud } from './components/NeedHud';
import { OnboardingModal } from './components/OnboardingModal';
import { ShareModal } from './components/ShareModal';
import { ShopModal } from './components/ShopModal';
import { StreakBadge } from './components/StreakBadge';
import { displayStreak } from './data/streak';
import { useCharacter } from './hooks/useCharacter';
import { useColorMode } from './hooks/useColorMode';
import { useFriends } from './hooks/useFriends';
import { useNeedNotifications } from './hooks/useNeedNotifications';
import { usePark } from './hooks/usePark';
import { useEffect, useState } from 'react';
import type { NeedType } from './types';

function App() {
  const {
    character,
    deceased,
    dismissMemorial,
    awayReport,
    dismissAwayReport,
    createCharacter,
    resetCharacter,
    updateCharacter,
    activateNeed,
    completeTask,
    addCustomTask,
    leveledUp,
    dismissLevelUp,
  } = useCharacter();
  const { coins, ownedTierByLine, decorationPositions, earnCoins, buyTier, moveDecoration } = usePark();
  const { colorMode, toggleColorMode } = useColorMode();
  useNeedNotifications(character);
  const friends = useFriends();

  const [detailOpen, setDetailOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);

  // Keep the leaderboard current whenever the local character changes.
  useEffect(() => {
    if (!character) return;
    friends.syncStats({
      nickname: character.nickname,
      appearanceId: character.appearanceId,
      level: character.level,
      streakCount: displayStreak(character.streak, new Date()).count,
      longestStreak: character.streak.longest,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.nickname, character?.appearanceId, character?.level, character?.streak]);

  const handleReset = () => {
    resetCharacter();
    setDetailOpen(false);
  };

  // Land straight on the needs/tasks screen once the character exists —
  // there should be something to act on immediately, not an empty park.
  const handleCreate: typeof createCharacter = (...args) => {
    createCharacter(...args);
    setDetailOpen(true);
  };

  // Completing a task earns the character's need AND contributes to the shared park fund.
  // Returns the actual awarded amount (may be doubled by Lucky Task) so the UI can show it accurately.
  const handleCompleteTask = (needType: NeedType, taskId: string) => {
    const reward = completeTask(needType, taskId);
    if (reward > 0) earnCoins(reward);
    return reward;
  };

  return (
    <div className="min-h-dvh">
      <AnderPark
        character={character}
        ownedTierByLine={ownedTierByLine}
        decorationPositions={decorationPositions}
        colorMode={colorMode}
        onSelectCharacter={() => setDetailOpen(true)}
        onMoveDecoration={moveDecoration}
      />

      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/20 bg-black/70 px-4 pb-3 backdrop-blur-sm [padding-top:calc(0.75rem+env(safe-area-inset-top))]">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-wide text-white">ANDERPARK</h1>
          <p className="hidden font-mono text-[11px] text-white/60 sm:block">
            Turn your goals into needs. Keep them met to keep your character alive.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {character && <StreakBadge streak={character.streak} />}
          <button
            onClick={toggleColorMode}
            title="Toggle color"
            className="border border-white/60 bg-transparent px-3 py-2 font-mono text-xs font-bold text-white hover:bg-white/10"
          >
            {colorMode ? '◑ COLOR' : '◐ MONO'}
          </button>
          <button
            onClick={() => setFriendsOpen(true)}
            title="Friends"
            className="border border-white/60 bg-transparent px-3 py-2 font-mono text-xs font-bold text-white hover:bg-white/10"
          >
            👥
          </button>
          <button
            onClick={() => setShopOpen(true)}
            className="border border-white/60 bg-transparent px-3 py-2 font-mono text-xs font-bold text-white hover:bg-white/10"
          >
            SHOP · {coins}c
          </button>
        </div>
      </header>

      {character && <NeedHud character={character} onSelect={() => setDetailOpen(true)} />}

      {!character && <OnboardingModal onCreate={handleCreate} />}

      {character && detailOpen && (
        <CharacterDetailModal
          character={character}
          onClose={() => setDetailOpen(false)}
          onCompleteTask={handleCompleteTask}
          onAddCustomTask={addCustomTask}
          onActivateNeed={activateNeed}
          onUpdateCharacter={updateCharacter}
          onReset={handleReset}
        />
      )}

      {shopOpen && (
        <ShopModal
          coins={coins}
          characterLevel={character?.level ?? 1}
          ownedTierByLine={ownedTierByLine}
          colorMode={colorMode}
          onBuyTier={buyTier}
          onClose={() => setShopOpen(false)}
        />
      )}

      {friendsOpen && <FriendsModal friends={friends} onClose={() => setFriendsOpen(false)} />}

      {character && leveledUp && <ShareModal character={character} onClose={dismissLevelUp} />}

      {deceased && <MemorialModal character={deceased} onClose={dismissMemorial} />}

      {character && awayReport && (
        <AwayReportModal character={character} report={awayReport} onClose={dismissAwayReport} />
      )}
    </div>
  );
}

export default App;
