import type { SupabaseClient } from '@supabase/supabase-js';

export interface UnitMissionRow {
  id: string;
  order_index: number;
  title: string;
  book_sections: string | null;
  is_unlocked: boolean;
}

/** class override (greenleaf_class_mission_access) wins over the Mission's own default. */
export async function fetchMissionUnlockMap(
  supabase: SupabaseClient,
  classId: string | null,
  missions: UnitMissionRow[]
): Promise<Map<string, boolean>> {
  const map = new Map(missions.map((m) => [m.id, m.is_unlocked]));
  if (!classId) return map;
  const { data } = await supabase
    .from('greenleaf_class_mission_access')
    .select('mission_id, unlocked')
    .eq('class_id', classId);
  for (const row of (data ?? []) as { mission_id: string; unlocked: boolean }[]) map.set(row.mission_id, row.unlocked);
  return map;
}
