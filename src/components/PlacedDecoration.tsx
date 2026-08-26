import { useRef, useState, type RefObject } from 'react';
import type { Decoration } from '../data/decorations';
import { pixelSpriteHeight, PixelSprite } from './PixelDecor';

interface Props {
  deco: Decoration;
  position: { left: number; bottom: number };
  groundRef: RefObject<HTMLDivElement | null>;
  onMove: (left: number, bottom: number) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PlacedDecoration({ deco, position, groundRef, onMove }: Props) {
  const [dragPos, setDragPos] = useState<{ left: number; bottom: number } | null>(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  const pointerToPercent = (clientX: number, clientY: number) => {
    const rect = groundRef.current?.getBoundingClientRect();
    if (!rect) return { left: position.left, bottom: position.bottom };
    return {
      left: ((clientX - rect.left) / rect.width) * 100,
      bottom: ((rect.bottom - clientY) / rect.height) * 100,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const pointer = pointerToPercent(e.clientX, e.clientY);
    dragOffset.current = { dx: pointer.left - position.left, dy: pointer.bottom - position.bottom };
    setDragPos(position);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragPos) return;
    const pointer = pointerToPercent(e.clientX, e.clientY);
    setDragPos({
      left: clamp(pointer.left - dragOffset.current.dx, 2, 96),
      bottom: clamp(pointer.bottom - dragOffset.current.dy, 2, 94),
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragPos) return;
    onMove(dragPos.left, dragPos.bottom);
    setDragPos(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const current = dragPos ?? position;
  const height = pixelSpriteHeight(deco.matrix, deco.pixelSize);
  const width = (deco.matrix[0]?.length ?? 0) * deco.pixelSize;

  return (
    <div
      className={`absolute touch-none select-none ${dragPos ? 'z-20 cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${current.left}%`,
        bottom: `calc(${current.bottom}% + ${height}px)`,
        // The box-shadow pixel art paints outside this element's own box, so
        // without an explicit size here the clickable/draggable area would
        // shrink to a single pixel cell instead of covering the whole sprite.
        width,
        height,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      title={`Drag to move ${deco.name}`}
    >
      <PixelSprite matrix={deco.matrix} size={deco.pixelSize} palette={deco.palette} />
    </div>
  );
}
