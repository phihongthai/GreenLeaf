import { createClient } from '@/lib/supabase/client';

const PASS_THRESHOLD = 80;

// Ghi lại MỌI lần ghi âm + chấm điểm (kể cả điểm thấp, chưa qua ngưỡng) vào
// greenleaf_mission_attempts, ngay khi có kết quả — trước khi biết học sinh sẽ bấm
// "Try again" hay tiếp tục. Tách riêng khỏi lib/rewards.ts (chỉ lo phần thưởng khi
// hoàn thành mission) để lịch sử phản ánh đúng số lần thử thật, không chỉ lần đạt.
export async function logMissionAttempt(missionId: string, score: number) {
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
    });
    if (error) console.error('[mission_attempts] insert failed:', error.message);
  } catch (err) {
    console.error('[mission_attempts] insert threw:', err);
  }
}
