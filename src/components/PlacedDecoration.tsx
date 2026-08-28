import { useRef, useState, type RefObject } from 'react';
import type { DecorationTier } from '../data/decorations';
import { pixelSpriteHeight, PixelSprite } from './PixelDecor';

interface Props {
  deco: DecorationTier;
  position: { left: number; bottom: number };
  groundRef: RefObject<HTMLDivElement | null>;
  colorMode: boolean;
  locked?: boolean;
  celebrate?: boolean;
  onMove: (left: number, bottom: number) => void;
  onTap: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Below this much pointer movement, a press-and-release counts as a tap
// (open the upgrade/sell sheet) rather than a drag (reposition it).
const TAP_THRESHOLD_PX = 6;

const FIREWORK_COLORS = ['#ff5252', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ffffff'];
const FIREWORK_PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return {
    dx: Math.cos(angle) * (34 + (i % 3) * 8),
    dy: Math.sin(angle) * (34 + (i % 3) * 8),
    color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
    delay: (i % 4) * 0.05,
  };
});

export function PlacedDecoration({ deco, position, groundRef, colorMode, locked, celebrate, onMove, onTap }: Props) {
  const [dragPos, setDragPos] = useState<{ left: number; bottom: number } | null>(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const pointerStart = useRef({ x: 0, y: 0 });
  const maxBottomPercent = useRef(96);

  const pointerToPercent = (clientX: number, clientY: number) => {
    const rect = groundRef.current?.getBoundingClientRect();
    if (!rect) return { left: position.left, bottom: position.bottom };
    return {
      left: ((clientX - rect.left) / rect.width) * 100,
      bottom: ((rect.bottom - clientY) / rect.height) * 100,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (locked) {
      pointerStart.current = { x: e.clientX, y: e.clientY };
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    pointerStart.current = { x: e.clientX, y: e.clientY };
    const pointer = pointerToPercent(e.clientX, e.clientY);
    dragOffset.current = { dx: pointer.left - position.left, dy: pointer.bottom - position.bottom };
    // An item can never be dragged high enough to visually poke up into the
    // sky. The wrapper's `bottom` is `calc(X% + height px)` with an explicit
    // `height` too, so its rendered top edge sits at
    // `groundBottom - X%*groundHeight/100 - 2*height` — solve for the X% at
    // which that top edge reaches the ground's own top edge.
    const groundHeightPx = groundRef.current?.getBoundingClientRect().height ?? 0;
    maxBottomPercent.current =
      groundHeightPx > 0 ? clamp(100 - (2 * height * 100) / groundHeightPx, 2, 96) : 40;
    setDragPos(position);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragPos || locked) return;
    const pointer = pointerToPercent(e.clientX, e.clientY);
    setDragPos({
      left: clamp(pointer.left - dragOffset.current.dx, 2, 96),
      bottom: clamp(pointer.bottom - dragOffset.current.dy, 2, maxBottomPercent.current),
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (locked || !dragPos) {
      const moved = Math.hypot(e.clientX - pointerStart.current.x, e.clientY - pointerStart.current.y);
      if (moved < TAP_THRESHOLD_PX) onTap();
      setDragPos(null);
      return;
    }
    const moved = Math.hypot(e.clientX - pointerStart.current.x, e.clientY - pointerStart.current.y);
    setDragPos(null);
    if (moved < TAP_THRESHOLD_PX) {
      onTap();
    } else {
      onMove(dragPos.left, dragPos.bottom);
    }
  };

  const current = dragPos ?? position;
  const height = pixelSpriteHeight(deco.matrix, deco.pixelSize);
  const width = (deco.matrix[0]?.length ?? 0) * deco.pixelSize;

  return (
    <div
      className={`absolute touch-none select-none ${dragPos ? 'z-20 cursor-grabbing' : locked ? 'cursor-pointer' : 'cursor-grab'}`}
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
      title={locked ? `${deco.name} (locked)` : `Drag to move ${deco.name}`}
    >
      {celebrate && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-30"
          style={{ width: 0, height: 0 }}
          aria-hidden
        >
          {FIREWORK_PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute animate-firework-particle rounded-full"
              style={{
                width: 5,
                height: 5,
                backgroundColor: p.color,
                left: 0,
                top: 0,
                animationDelay: `${p.delay}s`,
                // @ts-expect-error custom properties read by the keyframe
                '--fw-dx': `${p.dx}px`,
                '--fw-dy': `${p.dy}px`,
              }}
            />
          ))}
        </div>
      )}
      {locked && (
        <svg
          className="absolute -right-1 -top-1 z-10 drop-shadow-[0_0_1px_white]"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="#141414"
          aria-hidden
        >
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#141414" strokeWidth="2.4" fill="none" />
        </svg>
      )}
      <PixelSprite matrix={deco.matrix} size={deco.pixelSize} palette={colorMode ? deco.colorPalette : deco.palette} />
    </div>
  );
}
