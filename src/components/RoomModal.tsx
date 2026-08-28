import { useRef, useState } from 'react';
import { FURNITURE_ITEMS, getFurniture } from '../data/furniture';
import { MAX_ROOM_FURNITURE, type DecorationInstance } from '../hooks/usePark';
import { PixelSprite, pixelSpriteHeight } from './PixelDecor';

interface Props {
  instance: DecorationInstance;
  coins: number;
  colorMode: boolean;
  onAddFurniture: (itemId: string) => void;
  onMoveFurniture: (furnitureId: string, left: number, bottom: number) => void;
  onClose: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function PlacedFurniture({
  itemId,
  left,
  bottom,
  colorMode,
  floorRef,
  onMove,
}: {
  itemId: string;
  left: number;
  bottom: number;
  colorMode: boolean;
  floorRef: React.RefObject<HTMLDivElement | null>;
  onMove: (left: number, bottom: number) => void;
}) {
  const item = getFurniture(itemId);
  const [dragPos, setDragPos] = useState<{ left: number; bottom: number } | null>(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  if (!item) return null;

  const pointerToPercent = (clientX: number, clientY: number) => {
    const rect = floorRef.current?.getBoundingClientRect();
    if (!rect) return { left, bottom };
    return { left: ((clientX - rect.left) / rect.width) * 100, bottom: ((rect.bottom - clientY) / rect.height) * 100 };
  };

  const current = dragPos ?? { left, bottom };
  const height = pixelSpriteHeight(item.matrix, item.pixelSize);
  const width = (item.matrix[0]?.length ?? 0) * item.pixelSize;

  return (
    <div
      className={`absolute touch-none select-none ${dragPos ? 'z-20 cursor-grabbing' : 'cursor-grab'}`}
      style={{ left: `${current.left}%`, bottom: `calc(${current.bottom}% + ${height}px)`, width, height }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const pointer = pointerToPercent(e.clientX, e.clientY);
        dragOffset.current = { dx: pointer.left - left, dy: pointer.bottom - bottom };
        setDragPos({ left, bottom });
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragPos) return;
        const pointer = pointerToPercent(e.clientX, e.clientY);
        setDragPos({
          left: clamp(pointer.left - dragOffset.current.dx, 4, 92),
          bottom: clamp(pointer.bottom - dragOffset.current.dy, 2, 44),
        });
      }}
      onPointerUp={(e) => {
        if (!dragPos) return;
        onMove(dragPos.left, dragPos.bottom);
        setDragPos(null);
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => setDragPos(null)}
      title={`Drag to move ${item.name}`}
    >
      <PixelSprite matrix={item.matrix} size={item.pixelSize} palette={colorMode ? item.colorPalette : item.palette} />
    </div>
  );
}

export function RoomModal({ instance, coins, colorMode, onAddFurniture, onMoveFurniture, onClose }: Props) {
  const floorRef = useRef<HTMLDivElement>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const furniture = instance.room?.furniture ?? [];
  const atCap = furniture.length >= MAX_ROOM_FURNITURE;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#2b1710]">
      <div className="flex items-center justify-between border-b border-white/20 bg-black/40 px-4 py-3 [padding-top:calc(0.75rem+env(safe-area-inset-top))]">
        <div>
          <h2 className="font-mono text-lg font-bold text-white">Inside</h2>
          <p className="font-mono text-[11px] text-white/60">
            {furniture.length}/{MAX_ROOM_FURNITURE} pieces placed — drag to arrange
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShopOpen(true)}
            className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/20"
          >
            + Furnish
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/20"
          >
            Leave
          </button>
        </div>
      </div>

      <div
        ref={floorRef}
        className="relative flex-1 overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, #4a2f20 0%, #4a2f20 60%, #6b4423 60%, #6b4423 100%)',
        }}
      >
        {furniture.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-xs text-white/50">
            Empty room. Tap "+ Furnish" to bring some things inside.
          </p>
        )}
        {furniture.map((f) => (
          <PlacedFurniture
            key={f.id}
            itemId={f.itemId}
            left={f.left}
            bottom={f.bottom}
            colorMode={colorMode}
            floorRef={floorRef}
            onMove={(left, bottom) => onMoveFurniture(f.id, left, bottom)}
          />
        ))}
      </div>

      {shopOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShopOpen(false)}>
          <div
            className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-900">Furnish the room</h3>
              <button onClick={() => setShopOpen(false)} className="text-sm text-emerald-600">
                Close
              </button>
            </div>
            <p className="mb-3 font-mono text-xs text-emerald-700">Coins: {coins}</p>
            <div className="grid grid-cols-3 gap-3">
              {FURNITURE_ITEMS.map((item) => {
                const canAfford = coins >= item.cost && !atCap;
                return (
                  <button
                    key={item.id}
                    disabled={!canAfford}
                    onClick={() => onAddFurniture(item.id)}
                    className="flex flex-col items-center rounded-xl border border-emerald-100 bg-emerald-50/50 px-2 py-3 text-center disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="mb-1 flex h-14 w-14 items-center justify-center overflow-hidden">
                      <PixelSprite
                        matrix={item.matrix}
                        size={Math.max(1, Math.floor(48 / Math.max(item.matrix[0]?.length ?? 1, item.matrix.length)))}
                        palette={colorMode ? item.colorPalette : item.palette}
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-900">{item.name}</p>
                    <p className="text-[10px] text-emerald-600">{item.cost}c</p>
                  </button>
                );
              })}
            </div>
            {atCap && <p className="mt-3 text-center text-xs text-emerald-500">Room is full.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
