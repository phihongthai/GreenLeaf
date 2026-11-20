'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * TeacherNav/StudentNavBar remount on every page navigation (each is its own
 * route, not a shared layout), so this guards against re-querying — and
 * re-auto-opening — on every tab switch once the user has dismissed the tour
 * in this tab, even if the "seen" write to Supabase is still in flight or
 * fails (e.g. the onboarding_tour_seen_at migration hasn't been applied yet).
 */
const dismissedThisSession = new Set<string>();

/**
 * Drives the first-time "help tour" modal: auto-opens once per account
 * (persisted in greenleaf_profiles.onboarding_tour_seen_at) and exposes
 * `openTour` so a "View guide" button can replay it anytime.
 */
export function useOnboardingTour(userId: string | null) {
  const [open, setOpen] = useState(false);
  const checkedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || checkedFor.current === userId) return;
    checkedFor.current = userId;
    if (dismissedThisSession.has(userId)) return;

    let active = true;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('greenleaf_profiles')
        .select('onboarding_tour_seen_at')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.error('[onboarding-tour] could not load seen status', error);
        return;
      }
      if (active && !data?.onboarding_tour_seen_at) setOpen(true);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const openTour = useCallback(() => setOpen(true), []);

  const closeTour = useCallback(() => {
    setOpen(false);
    if (!userId) return;
    dismissedThisSession.add(userId);
    const supabase = createClient();
    supabase
      .from('greenleaf_profiles')
      .update({ onboarding_tour_seen_at: new Date().toISOString() })
      .eq('id', userId)
      .then(({ error }) => {
        if (error) console.error('[onboarding-tour] could not save seen status', error);
      });
  }, [userId]);

  return { tourOpen: open, openTour, closeTour };
}
