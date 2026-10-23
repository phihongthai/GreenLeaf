import type { SupabaseClient } from '@supabase/supabase-js';

const PASS_THRESHOLD = 80;
const PERFECT_SCORE = 100;

const LEAF_RULES = {
  mission_complete: 1,
  perfect_score: 5,
  streak_7: 20,
  bonus_3missions: 3,
} as const;

type RewardEventType = keyof typeof LEAF_RULES;

// `db` must be a service-role client: students have no write policy on greenleaf_rewards /
// greenleaf_reward_events (0018), otherwise they could edit their own leaf_count from the browser.
// Atomic mutations are performed via migration 0020 SECURITY DEFINER functions.
async function addLeaves(
  db: SupabaseClient,
  studentId: string,
  type: RewardEventType,
  missionId?: string
): Promise<number> {
  const delta = LEAF_RULES[type];
  const { data, error } = await db.rpc('greenleaf_add_leaves', {
    p_student_id: studentId,
    p_type: type,
    p_leaf_delta: delta,
    p_mission_id: missionId ?? null,
  });

  if (error) {
    console.error(`[rewards] addLeaves (${type}) failed:`, error.message);
    return 0;
  }

  return typeof data === 'number' ? data : delta;
}

async function updateStreak(
  db: SupabaseClient,
  studentId: string
): Promise<{ streakDays: number; streakBonusAwarded: boolean }> {
  const { data, error } = await db.rpc('greenleaf_update_streak', {
    p_student_id: studentId,
  });

  if (error) {
    console.error('[rewards] updateStreak failed:', error.message);
    return { streakDays: 0, streakBonusAwarded: false };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    streakDays: row?.streak_days ?? 0,
    streakBonusAwarded: Boolean(row?.streak_bonus_awarded),
  };
}

async function claimLessonBonus(
  db: SupabaseClient,
  studentId: string,
  lessonId: string,
  triggerMissionId: string
): Promise<boolean> {
  const { data, error } = await db.rpc('greenleaf_claim_lesson_bonus', {
    p_student_id: studentId,
    p_lesson_id: lessonId,
    p_trigger_mission_id: triggerMissionId,
  });

  if (error) {
    console.error('[rewards] claimLessonBonus failed:', error.message);
    return false;
  }

  return Boolean(data);
}

export interface RecordAttemptResult {
  status: 'completed' | 'try_again';
  score: number;
  leavesEarned: number;
  streakDays: number;
  bonusAwarded: boolean;
}

export async function recordMissionAttempt(
  supabase: SupabaseClient,
  db: SupabaseClient,
  studentId: string,
  missionId: string,
  score: number
): Promise<RecordAttemptResult> {
  const passed = score >= PASS_THRESHOLD;

  // 1. Race-safe progress upsert & first completion detection via 0020 function
  const { data: progressData, error: progressError } = await db.rpc('greenleaf_record_progress', {
    p_student_id: studentId,
    p_mission_id: missionId,
    p_score: score,
  });

  if (progressError) {
    console.error('[rewards] record progress failed:', progressError.message);
  }

  const progressResult = Array.isArray(progressData) ? progressData[0] : progressData;
  const status: 'completed' | 'try_again' = passed ? 'completed' : 'try_again';
  const wasAlreadyCompleted = Boolean(progressResult?.was_already_completed);

  let leavesEarned = 0;
  let streakDays = 0;
  let bonusAwarded = false;

  if (passed) {
    if (!wasAlreadyCompleted) {
      leavesEarned += await addLeaves(db, studentId, 'mission_complete', missionId);
    }
    if (score >= PERFECT_SCORE && !wasAlreadyCompleted) {
      leavesEarned += await addLeaves(db, studentId, 'perfect_score', missionId);
    }

    const streak = await updateStreak(db, studentId);
    streakDays = streak.streakDays;
    if (streak.streakBonusAwarded) {
      leavesEarned += LEAF_RULES.streak_7;
    }

    const { data: mission } = await supabase
      .from('greenleaf_missions')
      .select('lesson_id')
      .eq('id', missionId)
      .single();

    if (mission?.lesson_id && (await claimLessonBonus(db, studentId, mission.lesson_id, missionId))) {
      leavesEarned += LEAF_RULES.bonus_3missions;
      bonusAwarded = true;
    }
  }

  return { status, score, leavesEarned, streakDays, bonusAwarded };
}
