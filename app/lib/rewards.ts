import type { SupabaseClient } from '@supabase/supabase-js';

const PASS_THRESHOLD = 80;
const PERFECT_SCORE = 100;
const STREAK_TARGET = 7;

const LEAF_RULES = {
  mission_complete: 1,
  perfect_score: 5,
  streak_7: 20,
  bonus_3missions: 3,
} as const;

type RewardEventType = keyof typeof LEAF_RULES;

async function addLeaves(
  supabase: SupabaseClient,
  studentId: string,
  type: RewardEventType,
  missionId?: string
) {
  const delta = LEAF_RULES[type];

  const { data: existing } = await supabase
    .from('greenleaf_rewards')
    .select('leaf_count')
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('greenleaf_rewards')
      .update({ leaf_count: existing.leaf_count + delta })
      .eq('student_id', studentId);
  } else {
    await supabase.from('greenleaf_rewards').insert({ student_id: studentId, leaf_count: delta });
  }

  await supabase.from('greenleaf_reward_events').insert({
    student_id: studentId,
    type,
    leaf_delta: delta,
    mission_id: missionId ?? null,
  });

  return delta;
}

async function updateStreak(supabase: SupabaseClient, studentId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: reward } = await supabase
    .from('greenleaf_rewards')
    .select('streak_days, last_active_date')
    .eq('student_id', studentId)
    .maybeSingle();

  if (!reward) {
    await supabase.from('greenleaf_rewards').insert({ student_id: studentId, streak_days: 1, last_active_date: today });
    return { streakDays: 1, streakBonusAwarded: false };
  }

  if (reward.last_active_date === today) {
    return { streakDays: reward.streak_days, streakBonusAwarded: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = reward.last_active_date === yesterday ? reward.streak_days + 1 : 1;

  await supabase
    .from('greenleaf_rewards')
    .update({ streak_days: newStreak, last_active_date: today })
    .eq('student_id', studentId);

  let streakBonusAwarded = false;
  if (newStreak > 0 && newStreak % STREAK_TARGET === 0) {
    await addLeaves(supabase, studentId, 'streak_7');
    streakBonusAwarded = true;
  }

  return { streakDays: newStreak, streakBonusAwarded };
}

async function checkLessonBonus(supabase: SupabaseClient, studentId: string, lessonId: string) {
  const { data: missions } = await supabase
    .from('greenleaf_missions')
    .select('id')
    .eq('lesson_id', lessonId);
  if (!missions || missions.length === 0) return false;

  const missionIds = missions.map((m) => m.id);
  const { data: completed } = await supabase
    .from('greenleaf_student_progress')
    .select('mission_id')
    .eq('student_id', studentId)
    .eq('status', 'completed')
    .in('mission_id', missionIds);

  const allCompleted = (completed?.length ?? 0) >= missionIds.length;
  if (!allCompleted) return false;

  const { data: alreadyAwarded } = await supabase
    .from('greenleaf_reward_events')
    .select('id')
    .eq('student_id', studentId)
    .eq('type', 'bonus_3missions')
    .in('mission_id', missionIds)
    .limit(1);

  return !(alreadyAwarded && alreadyAwarded.length > 0);
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
  studentId: string,
  missionId: string,
  score: number
): Promise<RecordAttemptResult> {
  const passed = score >= PASS_THRESHOLD;
  const status = passed ? 'completed' : 'try_again';

  const { data: existing } = await supabase
    .from('greenleaf_student_progress')
    .select('status')
    .eq('student_id', studentId)
    .eq('mission_id', missionId)
    .maybeSingle();

  await supabase.from('greenleaf_student_progress').upsert(
    {
      student_id: studentId,
      mission_id: missionId,
      score,
      status,
      completed_at: passed ? new Date().toISOString() : null,
    },
    { onConflict: 'student_id,mission_id' }
  );

  // Log riêng, không ghi đè — giữ lại lịch sử mọi lần thử để giáo viên/phụ huynh xem tiến trình.
  await supabase.from('greenleaf_mission_attempts').insert({
    student_id: studentId,
    mission_id: missionId,
    score,
    status,
  });

  let leavesEarned = 0;
  let streakDays = 0;
  let bonusAwarded = false;

  if (passed) {
    const wasAlreadyCompleted = existing?.status === 'completed';

    if (!wasAlreadyCompleted) {
      leavesEarned += await addLeaves(supabase, studentId, 'mission_complete', missionId);
    }
    if (score >= PERFECT_SCORE && !wasAlreadyCompleted) {
      leavesEarned += await addLeaves(supabase, studentId, 'perfect_score', missionId);
    }

    const streak = await updateStreak(supabase, studentId);
    streakDays = streak.streakDays;
    if (streak.streakBonusAwarded) leavesEarned += LEAF_RULES.streak_7;

    const { data: mission } = await supabase
      .from('greenleaf_missions')
      .select('lesson_id')
      .eq('id', missionId)
      .single();

    if (mission && (await checkLessonBonus(supabase, studentId, mission.lesson_id))) {
      leavesEarned += await addLeaves(supabase, studentId, 'bonus_3missions', missionId);
      bonusAwarded = true;
    }
  }

  return { status, score, leavesEarned, streakDays, bonusAwarded };
}
