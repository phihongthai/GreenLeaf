'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UnitShellProfile } from '@/components/unit/UnitShell';

export interface UnitStudent extends UnitShellProfile {
  id: string;
  gradeId: string | null;
  classId: string | null;
}

const CACHE_MS = 60_000;
let cached: { at: number; userId: string; student: UnitStudent } | null = null;
let inflight: Promise<UnitStudent | null> | null = null;

// One shared load for all Unit screens: reads the session locally (no extra round trip) and
// remembers the profile for a minute so moving between Unit pages is instant.
export function getUnitStudent(): Promise<UnitStudent | null> {
  watchAuth();
  if (inflight) return inflight;
  inflight = (async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      cached = null;
      window.location.href = '/login';
      return null;
    }
    // A shared classroom device: only reuse the cache for the very same signed-in child.
    if (cached && cached.userId === user.id && Date.now() - cached.at < CACHE_MS) return cached.student;
    const { data, error } = await supabase
      .from('greenleaf_profiles')
      .select('name, grade_id, class_id, grade:greenleaf_grades(name), class:greenleaf_classes!greenleaf_profiles_class_id_fkey(code)')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      // Expired or revoked session: the local session still looked valid, so check with the server once.
      const { data: { user: checked } } = await supabase.auth.getUser();
      if (!checked) {
        cached = null;
        window.location.href = '/login';
        return null;
      }
    }
    const row = data as unknown as {
      name: string; grade_id: string | null; class_id: string | null;
      grade: { name: string } | null; class: { code: string } | null;
    } | null;
    const student: UnitStudent = {
      id: user.id,
      name: row?.name ?? 'Student',
      gradeId: row?.grade_id ?? null,
      classId: row?.class_id ?? null,
      levelName: row?.grade?.name ?? '',
      program: 'Primary Path 1',
      classCode: row?.class?.code ?? null,
    };
    cached = { at: Date.now(), userId: user.id, student };
    return student;
  })().finally(() => { inflight = null; });
  return inflight;
}

// Forget the remembered profile when anyone signs out (or in), so a shared device never shows the previous child.
let listening = false;
function watchAuth() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  createClient().auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') cached = null;
  });
}

// Loads the signed-in student with level name and class code for the Unit screens.
export function useUnitStudent(): { student: UnitStudent | null; loading: boolean } {
  const [student, setStudent] = useState<UnitStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUnitStudent().then((s) => {
      if (!active) return;
      setStudent(s);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return { student, loading };
}
