import { createClient } from '@/lib/supabase/client';

const PASS_THRESHOLD = 80;

// Records EVERY recording + scoring attempt (including low scores, below threshold) into
// greenleaf_mission_attempts as soon as results arrive — before knowing whether the student
// will hit "Try again" or continue. Separated from lib/rewards.ts (which handles rewards on
// mission completion) so history reflects actual attempt count, not just passing attempts.
//
// `itemLabel`: the specific word/sentence being practiced at recording time (e.g. "pollution",
// or a Phonics line) — Words Explorer/Phonics have multiple words/sentences in one mission;
// without this label, history would just show "Words Explorer: 64 points" repeatedly.
export async function logMissionAttempt(missionId: string, score: number, itemLabel?: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const status = score >= PASS_THRESHOLD ? 'completed' : 'try_again';
    const { error } = await supabase.from('greenleaf_mission_attempts').insert({
      student_id: user.id,
      mission_id: missionId,
      score,
      status,
      item_label: itemLabel ?? null,
    });
    if (error) console.error('[mission_attempts] insert failed:', error.message);
  } catch (err) {
    console.error('[mission_attempts] insert threw:', err);
  }
}
