import type { SupabaseClient } from '@supabase/supabase-js';

/** studentId → lessonId → teacher override (true = open, false = locked). */
export async function fetchLessonAccess(supabase: SupabaseClient, studentId: string): Promise<Map<string, boolean>> {
  const { data } = await supabase
    .from('greenleaf_student_lesson_access')
    .select('lesson_id, unlocked')
    .eq('student_id', studentId);
  return new Map((data ?? []).map((r: { lesson_id: string; unlocked: boolean }) => [r.lesson_id, r.unlocked]));
}
