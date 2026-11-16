'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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

    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('greenleaf_profiles')
        .select('onboarding_tour_seen_at')
        .eq('id', userId)
        .maybeSingle();
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
    const supabase = createClient();
    supabase
      .from('greenleaf_profiles')
      .update({ onboarding_tour_seen_at: new Date().toISOString() })
      .eq('id', userId)
      .then(() => {});
  }, [userId]);

  return { tourOpen: open, openTour, closeTour };
}
