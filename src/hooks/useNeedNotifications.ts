import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useEffect, useRef } from 'react';
import { HUNGRY_THRESHOLD, NEED_DEFINITIONS } from '../data/needs';
import { vitalityStage } from '../data/vitality';
import type { Character } from '../types';

// Fixed per-need notification ids so re-scheduling a need just replaces its
// pending notification instead of stacking up duplicates.
const NOTIFICATION_ID_BY_NEED = Object.fromEntries(NEED_DEFINITIONS.map((def, i) => [def.id, i + 1]));
// Reserved id, well above the 6 need ids, for the vitality-critical nudge.
const CRITICAL_VITALITY_NOTIFICATION_ID = 999;

// Schedules (or reschedules) one local notification per need, timed for the
// moment its decay is projected to cross the "needy" threshold. Local
// notifications fire natively even if the app is closed, so this only needs
// to run while the app is open/foregrounded to keep the schedule accurate.
export function useNeedNotifications(character: Character | null) {
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    if (!character) {
      LocalNotifications.cancel({
        notifications: [...Object.values(NOTIFICATION_ID_BY_NEED), CRITICAL_VITALITY_NOTIFICATION_ID].map((id) => ({
          id,
        })),
      });
      return;
    }

    let cancelled = false;

    async function scheduleAll() {
      if (!permissionRequested.current) {
        permissionRequested.current = true;
        const { display } = await LocalNotifications.requestPermissions();
        if (display !== 'granted') return;
      }
      if (cancelled || !character) return;

      const now = Date.now();
      const notifications = NEED_DEFINITIONS.filter((def) => character.needs[def.id]).map((def) => {
        const state = character.needs[def.id]!;
        const minutesUntilNeedy =
          state.level <= HUNGRY_THRESHOLD ? 0 : (state.level - HUNGRY_THRESHOLD) / def.decayPerMinute;
        // A few seconds of buffer so an already-needy state still fires soon,
        // rather than being scheduled for a time in the past.
        const fireAt = now + Math.max(5_000, minutesUntilNeedy * 60_000);
        return {
          id: NOTIFICATION_ID_BY_NEED[def.id],
          title: character.nickname,
          body: `I'm ${def.needyLabel.toLowerCase()}... ${character.goals[def.id]!.title}`,
          schedule: { at: new Date(fireAt) },
        };
      });

      // Sustained neglect gets an urgent, distinct nudge — rescheduled roughly
      // hourly for as long as the character stays critical, cleared the
      // moment it isn't.
      if (vitalityStage(character.vitality) === 'critical') {
        notifications.push({
          id: CRITICAL_VITALITY_NOTIFICATION_ID,
          title: character.nickname,
          body: "I'm not doing well... please, I need you.",
          schedule: { at: new Date(now + 60 * 60_000) },
        });
      }

      await LocalNotifications.cancel({
        notifications: [...Object.values(NOTIFICATION_ID_BY_NEED), CRITICAL_VITALITY_NOTIFICATION_ID].map((id) => ({
          id,
        })),
      });
      if (!cancelled) await LocalNotifications.schedule({ notifications });
    }

    scheduleAll();
    return () => {
      cancelled = true;
    };
  }, [character]);
}
