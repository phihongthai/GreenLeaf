import type { SupabaseClient } from '@supabase/supabase-js';

export interface UnitMissionRow {
  id: string;
  order_index: number;
  title: string;
  book_sections: string | null;
  is_unlocked: boolean;
}

type Overrides = Map<string, boolean>;

/** Class-level open/lock choices made by the teacher (mission id -> unlocked). */
export async function fetchClassOverrides(supabase: SupabaseClient, classId: string | null): Promise<Overrides> {
  const map: Overrides = new Map();
  if (!classId) return map;
  const { data } = await supabase
    .from('greenleaf_class_mission_access')
    .select('mission_id, unlocked')
    .eq('class_id', classId);
  for (const row of (data ?? []) as { mission_id: string; unlocked: boolean }[]) map.set(row.mission_id, row.unlocked);
  return map;
}

/** class override wins over the Mission's own default. */
export function applyOverrides(missions: UnitMissionRow[], overrides: Overrides): Map<string, boolean> {
  return new Map(missions.map((m) => [m.id, overrides.get(m.id) ?? m.is_unlocked]));
}
