'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UnitShellProfile } from '@/components/unit/UnitShell';

export interface UnitStudent extends UnitShellProfile {
  id: string;
  gradeId: string | null;
  classId: string | null;
}

// Loads the signed-in student with level name and class code for the Unit screens.
export function useUnitStudent(): { student: UnitStudent | null; loading: boolean } {
  const [student, setStudent] = useState<UnitStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      const { data } = await supabase
        .from('greenleaf_profiles')
        .select('name, grade_id, class_id, grade:greenleaf_grades(name), class:greenleaf_classes!greenleaf_profiles_class_id_fkey(code)')
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      const row = data as unknown as {
        name: string; grade_id: string | null; class_id: string | null;
        grade: { name: string } | null; class: { code: string } | null;
      } | null;
      setStudent({
        id: user.id,
        name: row?.name ?? 'Student',
        gradeId: row?.grade_id ?? null,
        classId: row?.class_id ?? null,
        levelName: row?.grade?.name ?? '',
        program: 'Primary Path 1',
        classCode: row?.class?.code ?? null,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { student, loading };
}
