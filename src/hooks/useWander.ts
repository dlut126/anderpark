import { useEffect, useRef, useState } from 'react';

const MIN_LEFT = 4;
const MAX_LEFT = 84;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface WanderState {
  left: number;
  duration: number;
  easing: string;
  jumping: boolean;
}

// Drives one pet's horizontal position as a small random walk: pause and look
// around, stroll slowly to a nearby spot, or do a couple of quick playful hops.
// Each pet gets its own independent, staggered loop instead of one shared
// back-and-forth animation, so the park doesn't move in lockstep.
export function useWander(seedLeft: number): WanderState {
  const [state, setState] = useState<WanderState>({
    left: seedLeft,
    duration: 0,
    easing: 'ease-in-out',
    jumping: false,
  });
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const scheduleNext = (currentLeft: number) => {
      const roll = Math.random();
      let waitMs: number;

      if (roll < 0.3) {
        // pause and look around
        waitMs = 900 + Math.random() * 1800;
        setState((s) => ({ ...s, duration: 0, jumping: false }));
      } else if (roll < 0.65) {
        // slow stroll to a nearby spot
        const distance = 12 + Math.random() * 30;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const nextLeft = clamp(currentLeft + distance * direction, MIN_LEFT, MAX_LEFT);
        const duration = 3 + Math.random() * 3.5;
        setState({ left: nextLeft, duration, easing: 'ease-in-out', jumping: false });
        waitMs = duration * 1000;
        currentLeft = nextLeft;
      } else {
        // a couple of quick playful hops
        const distance = 5 + Math.random() * 9;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const nextLeft = clamp(currentLeft + distance * direction, MIN_LEFT, MAX_LEFT);
        const duration = 0.35 + Math.random() * 0.2;
        setState({
          left: nextLeft,
          duration,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          jumping: true,
        });
        waitMs = duration * 1000 + 150;
        currentLeft = nextLeft;
      }

      timeoutRef.current = window.setTimeout(() => {
        if (!cancelled) scheduleNext(currentLeft);
      }, waitMs);
    };

    const initialDelay = Math.random() * 4000;
    timeoutRef.current = window.setTimeout(() => scheduleNext(seedLeft), initialDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutRef.current);
    };
    // Intentionally runs once per mounted pet; seedLeft is only a starting point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
